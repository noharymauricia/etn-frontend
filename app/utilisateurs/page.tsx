"use client";

import { useEffect, useMemo, useState } from "react";

import PageShell from "@/components/layout/PageShell";
import AppCombobox from "@/components/ui/AppCombobox";
import AppScrollArea from "@/components/ui/AppScrollArea";
import Button from "@/components/ui/Button";
import { toast } from "@/components/ui/Toasts";
import { utilisateurService, type Utilisateur } from "@/services/utilisateur.services";

function formatImInput(value: string | null | undefined) {
  if (!value) return "";
  const digits = value.replace(/\D/g, "").slice(0, 6);

  if (digits.length <= 3) {
    return digits;
  }

  return `${digits.slice(0, 3)} ${digits.slice(3)}`;
}

function formatPhoneInput(value: string | null | undefined) {
  if (!value) return "";
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

function getDisplayRole(role: string | null | undefined) {
  if (!role) return "Utilisateur";
  return role === "Simple utilisateur" ? "Utilisateur" : role;
}

export default function UsersPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<Utilisateur[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [userForm, setUserForm] = useState({
    name: "",
    im: "",
    role: "Administrateur",
    function: "",
    phone: "",
  });
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    index: number | null;
  }>({ show: false, index: null });

  const roleOptions = [
    { label: "Administrateur", value: "Administrateur" },
    { label: "Utilisateur", value: "Simple utilisateur" },
  ];

  const isLengthValid = newPassword.length >= 8 && newPassword.length <= 16;
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const isPasswordValid = isLengthValid && hasUpperCase && hasNumber && hasSpecialChar;
  const passwordsMatch = newPassword !== "" && newPassword === confirmPassword;

  const loadUsers = async (showErrorToast = true) => {
    try {
      const profils = await utilisateurService.getAll();
      setUsers(Array.isArray(profils) ? profils : []);
    } catch (error) {
      if (showErrorToast) {
        toast.error(utilisateurService.getErrorMessage(error, "Impossible de charger les utilisateurs."));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUsersAfterMutation = () => {
    void loadUsers(false);

    window.setTimeout(() => {
      void loadUsers(false);
    }, 500);

    window.setTimeout(() => {
      void loadUsers(false);
    }, 1200);
  };

  useEffect(() => {
    void loadUsers();

    const intervalId = window.setInterval(() => {
      void loadUsers(false);
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const filteredUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];
    
    return users.filter((user) => {
      const search = searchTerm.toLowerCase();

      return (
        (user.nom?.toLowerCase() || "").includes(search) ||
        (user.fonction?.toLowerCase() || "").includes(search) ||
        (getDisplayRole(user.role).toLowerCase() || "").includes(search) ||
        (user.matricule?.toLowerCase() || "").includes(search)
      );
    });
  }, [searchTerm, users]);

  const openCreateModal = () => {
    setUserForm({
      name: "",
      im: "",
      role: "Administrateur",
      function: "",
      phone: "",
    });
    setNewPassword("");
    setConfirmPassword("");
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setIsCreateModalOpen(true);
  };

  const handleDelete = async () => {
    if (deleteConfirm.index === null) {
      return;
    }

    try {
      await utilisateurService.remove(deleteConfirm.index);
      setUsers((prev) => prev.filter((user) => user.id !== deleteConfirm.index));
      refreshUsersAfterMutation();
      setDeleteConfirm({ show: false, index: null });
      toast.success("L'utilisateur a ete supprime.");
    } catch (error) {
      toast.error(utilisateurService.getErrorMessage(error, "Impossible de supprimer cet utilisateur."));
    }
  };

  const handleSaveUser = async () => {
    const normalizedIm = userForm.im.replace(/\D/g, "");
    const normalizedPhone = userForm.phone.replace(/\D/g, "");

    if (
      !userForm.name.trim() ||
      !normalizedIm ||
      !userForm.role.trim() ||
      !userForm.function.trim() ||
      !normalizedPhone
    ) {
      toast.warning("Tous les champs obligatoires doivent etre renseignes.");
      return;
    }

    if (normalizedIm.length !== 6) {
      toast.error("L'IM doit contenir exactement 6 chiffres.");
      return;
    }

    if (users.some((user) => user.matricule.replace(/\D/g, "") === normalizedIm)) {
      toast.warning("Cet IM existe deja. Il doit etre unique.");
      return;
    }

    if (normalizedPhone.length !== 10) {
      toast.error("Le numero de telephone doit contenir 10 chiffres.");
      return;
    }

    if (!newPassword.trim()) {
      toast.warning("Definissez un mot de passe pour ce compte.");
      return;
    }

    if (!isPasswordValid) {
      toast.error("Le mot de passe ne respecte pas les regles de securite.");
      return;
    }

    if (!passwordsMatch) {
      toast.error("La confirmation du mot de passe ne correspond pas.");
      return;
    }

    try {
      await utilisateurService.create({
        matricule: normalizedIm,
        mot_de_passe: newPassword,
        nom: userForm.name.trim(),
        role: userForm.role,
        fonction: userForm.function.trim(),
        telephone: normalizedPhone,
      });

      refreshUsersAfterMutation();
      setIsCreateModalOpen(false);
      toast.success(`Le compte de ${userForm.name.trim()} a ete cree.`);
    } catch (error) {
      toast.error(utilisateurService.getErrorMessage(error, "Impossible de creer cet utilisateur."));
    }
  };

  return (
    <PageShell>
      <div className="mb-8 flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-white outline-none transition-all focus:border-white/60 font-medium"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
        </div>

        <div className="w-full max-w-[220px]">
          <Button label="Creer un utilisateur" onClick={openCreateModal} />
        </div>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <h2 className="whitespace-nowrap text-xl font-bold tracking-tight text-white">LISTE DES UTILISATEURS</h2>
        <div className="h-[1px] w-full bg-white/20" />
      </div>

      <AppScrollArea className="w-full" orientation="horizontal">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            <tr className="overflow-hidden bg-[#082f63] text-white">
              <th className="rounded-l-full px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Noms</th>
              <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">IM</th>
              <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Fonctions</th>
              <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Statut</th>
              <th className="rounded-r-full px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="before:block before:h-4 before:content-['']">
            {isLoading || filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-white/40 italic font-medium">
                  Aucun utilisateur trouvé.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="group transition-colors">
                  <td className="border-b-2 border-white/30 px-6 py-5 font-semibold text-white/90">{user.nom || "N/A"}</td>
                  <td className="border-b-2 border-white/30 px-6 py-5 font-semibold text-white/90">{formatImInput(user.matricule)}</td>
                  <td className="border-b-2 border-white/30 px-6 py-5 font-semibold text-white/90">{user.fonction || "N/A"}</td>
                  <td className="border-b-2 border-white/30 px-6 py-5 font-semibold text-white/90">{getDisplayRole(user.role)}</td>
                  <td className="border-b-2 border-white/30 px-6 py-5 font-semibold text-white/90">
                    <div className="inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-white">
                      Actif
                    </div>
                  </td>
                  <td className="border-b-2 border-white/30 px-6 py-5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDeleteConfirm({ show: true, index: user.id })}
                        className="rounded-lg bg-red-500/10 p-2 text-red-500 transition-colors hover:bg-red-500/20"
                        title="Supprimer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </AppScrollArea>

      <div className="mt-8 flex items-center justify-center gap-6">
        <button className="rounded-xl border border-white/20 p-2.5 text-white transition-colors hover:bg-white/10" aria-label="Precedent">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        <span className="text-sm font-bold opacity-60">1 / 1</span>
        <button className="rounded-xl border border-white/20 p-2.5 text-white transition-colors hover:bg-white/10" aria-label="Suivant">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/20 bg-[rgb(15,27,45)] text-white shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between border-b border-white/30 bg-[rgb(15,27,45)] px-6 py-4">
              <h2 className="text-2xl font-bold tracking-wide">ENREGISTRER UN UTILISATEUR</h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-white/60 transition-colors hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-8 w-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <AppScrollArea className="flex-1" viewportClassName="p-8" contentClassName="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold uppercase tracking-wider text-white/90">
                    NOM <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={userForm.name}
                    onChange={(event) => setUserForm((prev) => ({ ...prev, name: event.target.value }))}
                    className="w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-white outline-none transition-all focus:border-white/60 font-medium"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold uppercase tracking-wider text-white/90">
                    IM <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="123 456"
                    value={userForm.im}
                    onChange={(event) => setUserForm((prev) => ({ ...prev, im: formatImInput(event.target.value) }))}
                    className="w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-white outline-none transition-all focus:border-white/60 font-medium"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold uppercase tracking-wider text-white/90">
                    Role <span className="text-red-400">*</span>
                  </label>
                  <AppCombobox
                    value={userForm.role}
                    options={roleOptions}
                    placeholder="Choisir un role"
                    ariaLabel="Role"
                    emptyText="Aucun role trouve."
                    onChange={(value) => setUserForm((prev) => ({ ...prev, role: value }))}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold uppercase tracking-wider text-white/90">
                    Fonction <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={userForm.function}
                    onChange={(event) => setUserForm((prev) => ({ ...prev, function: event.target.value }))}
                    className="w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-white outline-none transition-all focus:border-white/60 font-medium"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold uppercase tracking-wider text-white/90">
                    Tel <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="032 12 456 78"
                    value={userForm.phone}
                    onChange={(event) => setUserForm((prev) => ({ ...prev, phone: formatPhoneInput(event.target.value) }))}
                    className="w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-white outline-none transition-all focus:border-white/60 font-medium"
                  />
                </div>
              </div>

              <div className="grid gap-6 border-t border-white/10 pt-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-white/90 flex items-center justify-between">
                    <span>MOT DE PASSE <span className="text-red-400">*</span></span>
                    {newPassword && (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] ${isPasswordValid ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                        {isPasswordValid ? "Valide" : "Faible"}
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      placeholder="••••••••"
                      className={`w-full rounded-xl border px-4 py-3 pr-12 text-white outline-none transition-all font-sans ${newPassword ? (isPasswordValid ? "border-green-500/50 bg-green-500/5" : "border-red-500/50 bg-red-500/5") : "border-white/25 bg-white/10"}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 transition-colors hover:text-white"
                    >
                      {showNewPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.183.184.557.184 1.144 0 1.701C20.577 17.584 16.641 20.5 12 20.5c-4.638 0-8.573-3.007-9.963-7.183Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
                    <div className={`flex items-center gap-2 text-[11px] transition-colors ${isLengthValid ? "text-green-400" : "text-white/30"}`}>
                      <div className={`h-1.5 w-1.5 rounded-full ${isLengthValid ? "bg-green-400" : "bg-white/20"}`} />
                      8-16 caracteres
                    </div>
                    <div className={`flex items-center gap-2 text-[11px] transition-colors ${hasUpperCase ? "text-green-400" : "text-white/30"}`}>
                      <div className={`h-1.5 w-1.5 rounded-full ${hasUpperCase ? "bg-green-400" : "bg-white/20"}`} />
                      Une majuscule
                    </div>
                    <div className={`flex items-center gap-2 text-[11px] transition-colors ${hasNumber ? "text-green-400" : "text-white/30"}`}>
                      <div className={`h-1.5 w-1.5 rounded-full ${hasNumber ? "bg-green-400" : "bg-white/20"}`} />
                      Un chiffre
                    </div>
                    <div className={`flex items-center gap-2 text-[11px] transition-colors ${hasSpecialChar ? "text-green-400" : "text-white/30"}`}>
                      <div className={`h-1.5 w-1.5 rounded-full ${hasSpecialChar ? "bg-green-400" : "bg-white/20"}`} />
                      Caractere special
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-white/90 flex items-center justify-between">
                    <span>CONFIRMER LE MOT DE PASSE <span className="text-red-400">*</span></span>
                    {confirmPassword && (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] ${passwordsMatch ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                        {passwordsMatch ? "Identique" : "Different"}
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="••••••••"
                      className={`w-full rounded-xl border px-4 py-3 pr-12 text-white outline-none transition-all font-sans ${confirmPassword ? (passwordsMatch ? "border-green-500/50 bg-green-500/5" : "border-red-500/50 bg-red-500/5") : "border-white/25 bg-white/10"}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 transition-colors hover:text-white"
                    >
                      {showConfirmPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.183.184.557.184 1.144 0 1.701C20.577 17.584 16.641 20.5 12 20.5c-4.638 0-8.573-3.007-9.963-7.183Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

            </AppScrollArea>
            <div className="sticky bottom-0 z-20 flex justify-end border-t border-white/30 bg-[rgb(15,27,45)] px-8 py-5">
              <div className="w-full max-w-[180px]">
                <Button label="Enregistrer" onClick={handleSaveUser} />
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-sm rounded-[2rem] border border-white/20 bg-[rgb(15,27,45)] p-8 text-center text-white shadow-2xl animate-in zoom-in-95 duration-400">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-10 w-10">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <p className="mb-8 font-semibold italic text-white/60">Attention : cette action est definitive et irreversible. Confirmez-vous le choix ?</p>
            <div className="flex gap-4">
              <button onClick={() => setDeleteConfirm({ show: false, index: null })} className="flex-1 rounded-xl bg-white/5 py-3 text-sm font-semibold uppercase tracking-tighter transition-all hover:bg-white/10">
                Annuler
              </button>
              <button onClick={handleDelete} className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-semibold uppercase tracking-tighter shadow-lg shadow-red-900/40 transition-all hover:bg-red-500">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
