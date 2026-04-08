"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import AppScrollArea from "@/components/ui/AppScrollArea";
import Button from "@/components/ui/Button";
import { toast } from "@/components/ui/Toasts";
import { authService, clearAuthSession, getStoredToken, persistAuthSession } from "@/services/auth.services";
import { utilisateurService, type UpdateUtilisateurPayload, type Utilisateur } from "@/services/utilisateur.services";

function formatImInput(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const digits = value.replace(/\D/g, "").slice(0, 6);

  if (digits.length <= 3) {
    return digits;
  }

  return `${digits.slice(0, 3)} ${digits.slice(3)}`;
}

function formatPhoneInput(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const digits = value.replace(/\D/g, "").slice(0, 10);

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 5) {
    return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  }

  if (digits.length <= 8) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5)}`;
  }

  return `${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
}

function getDisplayRole(role?: string) {
  if (!role) {
    return "Role non renseigne";
  }

  return role === "Simple utilisateur" ? "Utilisateur" : role;
}

function buildProfileUpdatePayload(payload: UpdateUtilisateurPayload) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  ) as UpdateUtilisateurPayload;
}

export default function ProfilePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<Utilisateur | null>(null);
  const [activeProfileTab, setActiveProfileTab] = useState<"info" | "security">("info");
  const [currentAvatar, setCurrentAvatar] = useState<string>("/profile-default.svg");
  const [pendingProfileImagePayload, setPendingProfileImagePayload] = useState<string | null>(null);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileForm, setProfileForm] = useState({
    nom: "",
    im: "",
    fonction: "",
    tel: "",
  });
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isLengthValid = newPassword.length >= 8 && newPassword.length <= 16;
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const isPasswordValid = isLengthValid && hasUpperCase && hasNumber && hasSpecialChar;
  const passwordsMatch = newPassword !== "" && newPassword === confirmPassword;

  const applyUserToView = (profil: Utilisateur, syncForm = true) => {
    setCurrentUser(profil);
    if (syncForm) {
      setProfileForm({
        nom: profil.nom ?? "",
        im: formatImInput(profil.matricule),
        fonction: profil.fonction ?? "",
        tel: formatPhoneInput(profil.telephone),
      });
    }
    setCurrentAvatar(profil.image || "/profile-default.svg");
    setPendingProfileImagePayload(null);
  };

  useEffect(() => {
    let isMounted = true;

    const validateSession = async () => {
      const token = getStoredToken();

      if (!token) {
        clearAuthSession();
        router.replace("/");
        return;
      }

      try {
        const profil = await authService.me();
        persistAuthSession({ token, profil });
        if (!isMounted) {
          return;
        }

        applyUserToView(profil as Utilisateur);
      } catch {
        clearAuthSession();
        router.replace("/");
      }
    };

    void validateSession();

    return () => {
      isMounted = false;
    };
  }, [router]);

  // On ne fait plus de polling toutes les 5 secondes sur le profil car cela ecrase la saisie en cours.
  // Le profil est charge au montage et mis a jour apres chaque sauvegarde.

  useEffect(() => {
    return () => {
      if (currentAvatar.startsWith("blob:")) {
        URL.revokeObjectURL(currentAvatar);
      }
    };
  }, [currentAvatar]);

  const openFilePicker = () => {
    if (isSavingAvatar) {
      return;
    }

    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Le fichier selectionne doit etre une image.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.warning("L'image est trop lourde. Choisissez un fichier de moins de 10 Mo.");
      return;
    }

    if (!currentUser) {
      toast.error("Profil introuvable. Rechargez la page.");
      event.target.value = "";
      return;
    }

    const previousAvatar = currentAvatar;
    const localUrl = URL.createObjectURL(file);
    event.target.value = "";

    try {
      const fileAsBase64 = await toCompressedDataUrl(file);
      setCurrentAvatar(localUrl);
      setPendingProfileImagePayload(fileAsBase64);
      setIsSavingAvatar(true);

      const updatedUser = await utilisateurService.update(currentUser.id, buildProfileUpdatePayload({
        matricule: profileForm.im.replace(/\D/g, ""),
        nom: profileForm.nom.trim(),
        role: currentUser.role,
        fonction: profileForm.fonction.trim(),
        telephone: profileForm.tel.replace(/\D/g, "") || undefined,
        image: fileAsBase64,
      }));

      applyUserToView(updatedUser, false);

      const token = getStoredToken();
      if (token) {
        persistAuthSession({ token, profil: updatedUser });
      }

      toast.success("La photo de profil a ete enregistree.");
    } catch (error) {
      URL.revokeObjectURL(localUrl);
      setCurrentAvatar(previousAvatar);
      setPendingProfileImagePayload(null);
      toast.error(utilisateurService.getErrorMessage(error, "Impossible d'enregistrer la photo de profil."));
    } finally {
      setIsSavingAvatar(false);
    }
  };

  const handleProfileUpdate = async () => {
    if (!currentUser) {
      toast.error("Profil introuvable. Rechargez la page.");
      return;
    }

    const normalizedIm = profileForm.im.replace(/\D/g, "");
    const normalizedPhone = profileForm.tel.replace(/\D/g, "");

    if (!profileForm.nom.trim() || !normalizedIm || !profileForm.fonction.trim()) {
      toast.warning("Completez le nom, l'IM et la fonction avant la mise a jour.");
      return;
    }

    if (normalizedIm.length !== 6) {
      toast.error("L'IM doit contenir exactement 6 chiffres.");
      return;
    }

    if (normalizedPhone && normalizedPhone.length !== 10) {
      toast.error("Le numero de telephone doit contenir 10 chiffres.");
      return;
    }

    try {
      const updatedUser = await utilisateurService.update(currentUser.id, buildProfileUpdatePayload({
        matricule: normalizedIm,
        nom: profileForm.nom.trim(),
        role: currentUser.role,
        fonction: profileForm.fonction.trim(),
        telephone: normalizedPhone || undefined,
        image: pendingProfileImagePayload,
      }));

      applyUserToView(updatedUser);

      const token = getStoredToken();
      if (token) {
        persistAuthSession({ token, profil: updatedUser });
      }

      toast.success("Les informations du profil ont ete mises a jour.");
    } catch (error) {
      toast.error(utilisateurService.getErrorMessage(error, "Impossible de mettre a jour le profil."));
    }
  };

  const handlePasswordUpdate = async () => {
    if (!currentUser) {
      toast.error("Profil introuvable. Rechargez la page.");
      return;
    }

    if (!currentPassword.trim()) {
      toast.warning("Saisissez votre mot de passe actuel.");
      return;
    }

    if (!newPassword.trim()) {
      toast.warning("Saisissez un nouveau mot de passe.");
      return;
    }

    if (!isPasswordValid) {
      toast.error("Le nouveau mot de passe ne respecte pas les regles de securite.");
      return;
    }

    if (!passwordsMatch) {
      toast.error("La confirmation du mot de passe ne correspond pas.");
      return;
    }

    try {
      await utilisateurService.update(currentUser.id, buildProfileUpdatePayload({
        matricule: profileForm.im.replace(/\D/g, ""),
        nom: profileForm.nom.trim(),
        role: currentUser.role,
        fonction: profileForm.fonction.trim(),
        telephone: profileForm.tel.replace(/\D/g, "") || undefined,
        mot_de_passe: newPassword,
        image: pendingProfileImagePayload,
      }));

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Votre mot de passe a ete mis a jour avec succes.");
    } catch (error) {
      toast.error(utilisateurService.getErrorMessage(error, "Impossible de mettre a jour le mot de passe."));
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    toast.success("Deconnexion reussie.");
    router.push("/");
  };

  const displayName = currentUser?.nom?.trim() || "Utilisateur";
  const [firstNameLine, ...remainingNameParts] = displayName.split(" ");
  const secondNameLine = remainingNameParts.join(" ");

  return (
    <main className="flex h-screen flex-col text-white overflow-hidden">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Bouton toggle sidebar — mobile/tablette uniquement */}
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#75b82a] text-white shadow-xl transition-all hover:bg-[#68a625] active:scale-95 lg:hidden"
          aria-label={sidebarOpen ? "Fermer le profil" : "Voir le profil"}
        >
          {sidebarOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          )}
        </button>

        {/* Overlay backdrop pour sidebar mobile */}
        {sidebarOpen ? (
          <div
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
            onClick={() => setSidebarOpen(false)}
          />
        ) : null}

        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-[#0f4b86]/95 backdrop-blur-md transition-transform duration-300 lg:relative lg:translate-x-0 lg:bg-transparent lg:backdrop-blur-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}>
          <div className="flex min-h-full flex-col items-center px-4 py-5 pt-20 text-white lg:pt-5">
          <div className="mb-6 flex w-full flex-col items-center">
            <div className="mb-5 h-[260px] w-[185px] overflow-hidden rounded-2xl border border-white/15 bg-white/10 shadow-lg">
              <Image
                src={currentAvatar}
                alt="Avatar de profil"
                width={185}
                height={260}
                unoptimized
                className="h-full w-full object-cover object-top"
              />
            </div>
            <div className="w-[170px] rounded-2xl bg-transparent px-1 py-1 text-left">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[15px] font-semibold leading-5">{firstNameLine}</p>
                  {secondNameLine ? <p className="text-[15px] font-semibold leading-5">{secondNameLine}</p> : null}
                </div>
              </div>
              <div className="my-2 h-[3px] w-full rounded-full bg-white/90" />
              <p className="pb-2 text-[13px] font-medium leading-5">
                {currentUser?.fonction || "Fonction non renseignee"}
              </p>
              <div className="my-2 h-[3px] w-full rounded-full bg-white/90" />
              <p className="pt-2 text-[13px] font-medium capitalize leading-5">
                {getDisplayRole(currentUser?.role)}
              </p>
            </div>
          </div>

          <button
            onClick={() => setConfirmLogout(true)}
            className="mt-auto flex w-full items-center justify-center gap-2 py-3 text-white transition-opacity hover:opacity-80"
          >
            <span className="font-medium">Deconnexion</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.6"
              className="h-6 w-6 shrink-0 [transform:scaleX(-1)]"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 3H18a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 18 21h-2.25" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 16.5 3.75 12 9 7.5" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h12" />
            </svg>
          </button>
          </div>
        </div>

        <AppScrollArea className="flex-1 min-h-0" viewportClassName="px-4 py-4 md:px-8 md:py-6 lg:px-10">
          <div className="animate-in fade-in duration-500">
            {currentUser?.role !== "Simple utilisateur" ? (
              <div className="mb-6 flex items-center justify-between">
                <button
                  onClick={() => router.push("/tableau")}
                  className="flex items-center gap-2 font-semibold text-white/80 transition-colors hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  Retour
                </button>
              </div>
            ) : null}

            <div className="mx-auto max-w-4xl rounded-2xl bg-[#082f63] p-3 text-white sm:p-4 md:rounded-3xl">
              <div className="mb-4 flex flex-col items-center gap-4 pb-4 sm:flex-row">
                <div className="group relative">
                  <Image
                    src={currentAvatar}
                    alt="Profil"
                    width={96}
                    height={96}
                    unoptimized
                    className="h-24 w-24 rounded-full border-4 border-white/10 object-cover object-top shadow-lg"
                  />
                  <button
                    type="button"
                    onClick={openFilePicker}
                    disabled={isSavingAvatar}
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity backdrop-blur-[2px] group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-100"
                  >
                    {isSavingAvatar ? (
                      <span className="text-xs font-semibold tracking-wide text-white">Enregistrement...</span>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                      </svg>
                    )}
                  </button>
                </div>
                <div className="flex-1 space-y-0.5">
                  <p className="text-sm font-semibold uppercase tracking-wider text-white/85">{displayName}</p>
                  <h1 className="text-xl font-bold">{getDisplayRole(currentUser?.role) || "Utilisateur"}</h1>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                disabled={isSavingAvatar}
                onChange={handleAvatarUpload}
                className="hidden"
              />

              <div className="mb-4 flex flex-col sm:flex-row md:mb-6">
                <button
                  onClick={() => setActiveProfileTab("info")}
                  className={`relative px-4 py-2.5 text-sm font-semibold transition-all sm:px-6 sm:py-3 sm:text-base ${activeProfileTab === "info" ? "text-white" : "text-white/40 hover:text-white/60"}`}
                >
                  Informations personnelles
                  {activeProfileTab === "info" ? <span className="absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-blue-500" /> : null}
                </button>
                <button
                  onClick={() => setActiveProfileTab("security")}
                  className={`relative px-4 py-2.5 text-sm font-semibold transition-all sm:px-6 sm:py-3 sm:text-base ${activeProfileTab === "security" ? "text-white" : "text-white/40 hover:text-white/60"}`}
                >
                  Securite & Mot de passe
                  {activeProfileTab === "security" ? <span className="absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-blue-500" /> : null}
                </button>
              </div>

              {activeProfileTab === "info" ? (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-white/90">NOM</label>
                        <input
                          type="text"
                          value={profileForm.nom}
                          onChange={(event) => {
                            setProfileForm((prev) => ({ ...prev, nom: event.target.value }));
                          }}
                          className="w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 font-medium text-white outline-none transition-all focus:border-white/60"
                        />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-white/90 uppercase tracking-widest">IM</label>
                        <input
                          type="text"
                          placeholder="123 456"
                          value={profileForm.im}
                          onChange={(event) => {
                            setProfileForm((prev) => ({ ...prev, im: formatImInput(event.target.value) }));
                          }}
                          className="w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-white outline-none transition-all focus:border-white/60 font-medium"
                        />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-white/90">Role</label>
                      <input
                        type="text"
                        disabled
                        value={getDisplayRole(currentUser?.role)}
                        className="w-full cursor-not-allowed rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-white/40 outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-white/90">Fonction</label>
                        <input
                          type="text"
                          value={profileForm.fonction}
                          onChange={(event) => {
                            setProfileForm((prev) => ({ ...prev, fonction: event.target.value }));
                          }}
                          className="w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-white outline-none transition-all focus:border-white/60"
                        />
                    </div>
                    <div className="max-w-md md:col-span-2">
                      <label className="mb-2 block text-sm font-semibold text-white/90 uppercase tracking-widest">Tel</label>
                        <input
                          type="text"
                          placeholder="032 12 456 78"
                          value={profileForm.tel}
                          onChange={(event) => {
                            setProfileForm((prev) => ({ ...prev, tel: formatPhoneInput(event.target.value) }));
                          }}
                          className="w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-white outline-none transition-all focus:border-white/60 font-medium"
                        />
                    </div>
                  </div>
                  <div className="mt-8 flex justify-end">
                    <div className="w-full sm:max-w-[180px]">
                      <Button label="Mettre a jour" onClick={handleProfileUpdate} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="mx-auto grid max-w-md gap-6">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-white/90">Mot de passe actuel</label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(event) => setCurrentPassword(event.target.value)}
                          placeholder="........"
                          className="w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 pr-12 font-sans text-white outline-none transition-all focus:border-white/60"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 transition-colors hover:text-white"
                        >
                          <EyeIcon crossed={showCurrentPassword} />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 flex items-center justify-between text-sm font-semibold text-white/90">
                        <span>Nouveau mot de passe</span>
                        {newPassword ? (
                          <span className={`rounded-full px-2 py-0.5 text-[10px] ${isPasswordValid ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                            {isPasswordValid ? "Valide" : "Faible"}
                          </span>
                        ) : null}
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(event) => setNewPassword(event.target.value)}
                          placeholder="........"
                          className={`w-full rounded-xl border px-4 py-3 pr-12 font-sans text-white outline-none transition-all ${newPassword ? (isPasswordValid ? "border-green-500/50 bg-green-500/5" : "border-red-500/50 bg-red-500/5") : "border-white/25 bg-white/10"}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 transition-colors hover:text-white"
                        >
                          <EyeIcon crossed={showNewPassword} />
                        </button>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
                        <PasswordHint active={isLengthValid} label="8-16 caracteres" />
                        <PasswordHint active={hasUpperCase} label="Une majuscule" />
                        <PasswordHint active={hasNumber} label="Un chiffre" />
                        <PasswordHint active={hasSpecialChar} label="Caractere special" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 flex items-center justify-between text-sm font-semibold text-white/90">
                        <span>Confirmation du mot de passe</span>
                        {confirmPassword ? (
                          <span className={`rounded-full px-2 py-0.5 text-[10px] ${passwordsMatch ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                            {passwordsMatch ? "Identique" : "Different"}
                          </span>
                        ) : null}
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(event) => setConfirmPassword(event.target.value)}
                          placeholder="........"
                          className={`w-full rounded-xl border px-4 py-3 pr-12 font-sans text-white outline-none transition-all ${confirmPassword ? (passwordsMatch ? "border-green-500/50 bg-green-500/5" : "border-red-500/50 bg-red-500/5") : "border-white/25 bg-white/10"}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 transition-colors hover:text-white"
                        >
                          <EyeIcon crossed={showConfirmPassword} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 flex justify-end">
                    <div className="w-full sm:max-w-[180px]">
                      <Button label="Mettre a jour" onClick={handlePasswordUpdate} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </AppScrollArea>
      </div>

      {confirmLogout ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-sm rounded-[2rem] border border-white/20 bg-[rgb(15,27,45)] p-8 text-center text-white shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-8 w-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-bold">Confirmer la deconnexion</h3>
            <p className="mb-8 leading-relaxed text-white/60">
              Voulez-vous vraiment vous deconnecter ? Toute session non enregistree pourrait etre perdue.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmLogout(false)}
                className="flex-1 rounded-xl bg-white/10 py-3 font-semibold outline-none transition-all hover:bg-white/15"
              >
                Annuler
              </button>
              <button
                onClick={() => void handleLogout()}
                className="flex-1 rounded-xl bg-blue-600 py-3 font-semibold shadow-lg shadow-blue-900/40 outline-none transition-all hover:bg-blue-500 active:scale-95"
              >
                Deconnecter
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function PasswordHint({ active, label }: { active: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-2 text-[11px] transition-colors ${active ? "text-green-400" : "text-white/30"}`}>
      <div className={`h-1.5 w-1.5 rounded-full ${active ? "bg-green-400" : "bg-white/20"}`} />
      {label}
    </div>
  );
}

function EyeIcon({ crossed }: { crossed: boolean }) {
  if (crossed) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
      </svg>
    );
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.183.184.557.184 1.144 0 1.701C20.577 17.584 16.641 20.5 12 20.5c-4.638 0-8.573-3.007-9.963-7.183Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );
}

async function toCompressedDataUrl(file: File) {
  const image = await loadImage(file);
  const maxDimension = 1200;
  const maxBytes = 2_600_000;
  const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Impossible de preparer l'image pour l'envoi.");
  }

  context.drawImage(image, 0, 0, width, height);

  const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg";
  let quality = mimeType === "image/png" ? undefined : 0.86;
  let dataUrl = canvas.toDataURL(mimeType, quality);

  while (estimateDataUrlBytes(dataUrl) > maxBytes && quality && quality > 0.45) {
    quality = Number((quality - 0.08).toFixed(2));
    dataUrl = canvas.toDataURL("image/jpeg", quality);
  }

  if (estimateDataUrlBytes(dataUrl) > maxBytes) {
    throw new Error("L'image reste trop lourde apres compression. Choisissez une image plus legere.");
  }

  return dataUrl;
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new window.Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Impossible de lire le fichier image."));
    };

    image.src = objectUrl;
  });
}

function estimateDataUrlBytes(dataUrl: string) {
  const base64 = dataUrl.split(",")[1] ?? "";
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  return Math.floor((base64.length * 3) / 4) - padding;
}
