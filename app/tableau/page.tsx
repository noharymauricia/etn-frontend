"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import AppCombobox from "@/components/ui/AppCombobox";
import AppScrollArea from "@/components/ui/AppScrollArea";
import Button from "@/components/ui/Button";
import { toast } from "@/components/ui/Toasts";
import { activiteService, type Activite } from "@/services/activiter.services";
import { authService, clearAuthSession, getStoredToken, persistAuthSession } from "@/services/auth.services";
import { utilisateurService, type Utilisateur } from "@/services/utilisateur.services";

function getDisplayRole(role?: string) {
  if (!role) {
    return "Role non renseigne";
  }

  return role === "Simple utilisateur" ? "Utilisateur" : role;
}

function getStatusColor(status: string) {
  switch (status) {
    case "En cours":
      return "text-blue-300";
    case "Planifiee":
    case "Planifiée":
      return "text-orange-400";
    case "Terminee":
    case "Terminée":
      return "text-green-400";
    default:
      return "text-white";
  }
}

function formatDisplayDate(value?: string | null) {
  if (!value) {
    return "--/--/----";
  }

  const [year, month, day] = value.split("-");

  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
}

export default function TableauPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<Utilisateur | null>(null);
  const canManageActivities = Boolean(currentUser);
  const [activities, setActivities] = useState<Activite[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null);
  const [participants, setParticipants] = useState<string[]>([]);
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [participantPickerValue, setParticipantPickerValue] = useState("");
  const [activityForm, setActivityForm] = useState({
    name: "",
    status: "Planifiee",
    responsable: "",
    responsableId: "",
    comments: "",
    startDate: "",
    endDate: "",
  });
  const [confirmAction, setConfirmAction] = useState<{
    show: boolean;
    type: "participant" | "activity" | "logout";
    index: number | null;
  }>({ show: false, type: "participant", index: null });

  const applyUserToView = (profil: Utilisateur) => {
    setCurrentUser(profil);
  };

  const loadActivities = async (showErrorToast = true) => {
    try {
      const activites = await activiteService.getAll();
      setActivities(activites);
    } catch (error) {
      if (showErrorToast) {
        toast.error(activiteService.getErrorMessage(error, "Impossible de charger les activites."));
      }
    }
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
        const fullProfil = await utilisateurService.getById(profil.id);

        if (!isMounted) {
          return;
        }

        applyUserToView(fullProfil);
        await loadActivities();
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

  useEffect(() => {
    if (!currentUser?.id) {
      return;
    }

    const intervalId = window.setInterval(async () => {
      try {
        const [refreshedUser, refreshedActivities] = await Promise.all([
          utilisateurService.getById(currentUser.id),
          activiteService.getAll(),
        ]);

        applyUserToView(refreshedUser);
        setActivities(refreshedActivities);

        const token = getStoredToken();
        if (token) {
          persistAuthSession({ token, profil: refreshedUser });
        }
      } catch {
        // Ignore temporary refresh issues and keep the current view.
      }
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [currentUser?.id]);

  const availableUsers = useMemo(
    () => Array.from(new Set(activities.flatMap((activity) => activity.participants ?? []))),
    [activities],
  );

  const statusOptions = [
    { label: "Planifiee", value: "Planifiee" },
    { label: "En cours", value: "En cours" },
    { label: "Terminee", value: "Terminee" },
  ];

  const responsableOptions = useMemo(
    () =>
      Array.from(
        new Map(
          activities
            .filter((activity) => activity.responsable && activity.profil_id)
            .map((activity) => [
              String(activity.profil_id),
              { label: activity.responsable, value: String(activity.profil_id) },
            ]),
        ).values(),
      ),
    [activities],
  );

  const dashboardTotalActivities = activities.length;
  const dashboardInProgressCount = activities.filter((activity) => activity.statut === "En cours").length;
  const dashboardPlannedCount = activities.filter(
    (activity) => activity.statut === "Planifiee" || activity.statut === "Planifiée",
  ).length;
  const dashboardCompletedCount = activities.filter(
    (activity) => activity.statut === "Terminee" || activity.statut === "Terminée",
  ).length;

  const dashboardRecentActivities = useMemo(() => {
    return [...activities]
      .sort((a, b) => {
        const left = new Date(b.updated_at ?? b.created_at ?? b.date_debut ?? 0).getTime();
        const right = new Date(a.updated_at ?? a.created_at ?? a.date_debut ?? 0).getTime();
        return left - right;
      })
      .slice(0, 5);
  }, [activities]);

  const displayName = currentUser?.nom?.trim() || "Utilisateur";
  const [firstNameLine, ...remainingNameParts] = displayName.split(" ");
  const secondNameLine = remainingNameParts.join(" ");

  const openActivityModal = (activity: Activite) => {
    setSelectedActivityId(activity.id);
    setActivityForm({
      name: activity.nom_activite,
      status: activity.statut,
      responsable: activity.responsable,
      responsableId: String(activity.profil_id),
      comments: activity.commentaire ?? "",
      startDate: activity.date_debut ?? "",
      endDate: activity.date_fin ?? "",
    });
    setParticipants(activity.participants ?? []);
    setShowAddParticipant(false);
    setParticipantPickerValue("");
    setIsModalOpen(true);
  };

  const buildActivityPayload = () => {
    const responsableId = Number(activityForm.responsableId);

    if (
      !activityForm.name.trim() ||
      !activityForm.status.trim() ||
      !activityForm.responsable.trim() ||
      !activityForm.startDate ||
      !activityForm.endDate ||
      !responsableId
    ) {
      toast.warning("Tous les champs obligatoires doivent etre renseignes.");
      return null;
    }

    if (activityForm.startDate > activityForm.endDate) {
      toast.error("La date de fin doit etre posterieure a la date de debut.");
      return null;
    }

    return {
      nom_activite: activityForm.name.trim(),
      statut: activityForm.status.trim(),
      responsable: activityForm.responsable.trim(),
      participants,
      commentaire: activityForm.comments.trim(),
      date_debut: activityForm.startDate,
      date_fin: activityForm.endDate,
      profil_id: responsableId,
    };
  };

  const closeActivityModal = () => {
    setIsModalOpen(false);
  };

  const handleAddParticipant = (name: string) => {
    if (!canManageActivities) {
      toast.warning("Vous devez etre connecte pour modifier cette activite.");
      return;
    }

    if (!name) {
      toast.warning("Selectionnez un participant avant de valider.");
      return;
    }

    if (participants.includes(name)) {
      toast.warning(`${name} fait deja partie des participants.`);
      return;
    }

    setParticipants((prev) => [...prev, name]);
    setShowAddParticipant(false);
    setParticipantPickerValue("");
    toast.success(`${name} a ete ajoute aux participants.`);
  };

  const handleActivityUpdate = () => {
    if (!canManageActivities) {
      toast.warning("Vous devez etre connecte pour modifier cette activite.");
      return;
    }

    const payload = buildActivityPayload();

    if (!payload) {
      return;
    }

    if (!selectedActivityId) {
      toast.error("Aucune activite selectionnee.");
      return;
    }

    void (async () => {
      try {
        const updatedActivity = await activiteService.update(selectedActivityId, payload);
        setActivities((prev) =>
          prev.map((activity) => (activity.id === selectedActivityId ? updatedActivity : activity)),
        );
        setIsModalOpen(false);
        toast.success(`L'activite ${payload.nom_activite} a ete mise a jour.`);
      } catch (error) {
        toast.error(activiteService.getErrorMessage(error, "Impossible de mettre a jour cette activite."));
      }
    })();
  };

  const handleAction = async () => {
    if (confirmAction.type === "participant" && confirmAction.index !== null) {
      if (!canManageActivities) {
        toast.warning("Vous devez etre connecte pour modifier cette activite.");
        setConfirmAction({ show: false, type: "participant", index: null });
        return;
      }

      const removedParticipant = participants[confirmAction.index];
      setParticipants((prev) => prev.filter((_, index) => index !== confirmAction.index));
      toast.success(`${removedParticipant} a ete retire des participants.`);
    } else if (confirmAction.type === "activity") {
      if (!canManageActivities) {
        toast.warning("Vous devez etre connecte pour supprimer cette activite.");
        setConfirmAction({ show: false, type: "participant", index: null });
        return;
      }

      if (confirmAction.index !== null) {
        try {
          await activiteService.remove(confirmAction.index);
          setActivities((prev) => prev.filter((activity) => activity.id !== confirmAction.index));
          setIsModalOpen(false);
          toast.success("L'activite a bien ete supprimee.");
        } catch (error) {
          toast.error(activiteService.getErrorMessage(error, "Impossible de supprimer cette activite."));
        }
      }
    } else if (confirmAction.type === "logout") {
      await authService.logout();
      toast.success("Deconnexion reussie.");
      router.push("/");
    }

    setConfirmAction({ show: false, type: "participant", index: null });
  };

  return (
    <main className="flex min-h-screen flex-col bg-[linear-gradient(90deg,#0f4b86_0%,#1460ab_46%,#1460ab_74%,#1d6ab7_100%)] text-white">
      <Navbar />

      <div className="flex flex-1">
        <div className="flex min-h-full w-64 flex-col items-center bg-transparent px-4 py-5 text-white">
          <div className="mb-6 flex w-full flex-col items-center">
            <div className="mb-5 h-[260px] w-[185px] overflow-hidden rounded-2xl border border-white/15 bg-white/10 shadow-lg">
              <Image
                src={currentUser?.image || "/profile-default.svg"}
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
                {currentUser?.role === "Administrateur" ? (
                  <button
                    type="button"
                    onClick={() => router.push("/profile")}
                    aria-label="Modifier le profil"
                    className="inline-flex h-6 w-6 items-center justify-center cursor-pointer text-white transition-colors hover:scale-110 hover:text-white/80 active:scale-95"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" className="h-5 w-5" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487a2.25 2.25 0 1 1 3.182 3.182L8.25 18.463 4.5 19.5l1.037-3.75L16.862 3.487Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 4.5 19.5 8.25" />
                    </svg>
                  </button>
                ) : null}
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
            onClick={() => setConfirmAction({ show: true, type: "logout", index: null })}
            className="mt-auto flex w-full items-center justify-center gap-2 py-3 text-white transition-opacity hover:opacity-80"
          >
            <span className="font-medium">Deconnexion</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" className="h-6 w-6 shrink-0 [transform:scaleX(-1)]" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 3H18a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 18 21h-2.25" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 16.5 3.75 12 9 7.5" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h12" />
            </svg>
          </button>
        </div>

        <AppScrollArea className="flex-1 min-h-0" viewportClassName="px-8 py-6 md:px-10">
          <div className="animate-in fade-in duration-500">
            <div className="mb-8 rounded-[2rem] border border-white/10 bg-[#082f63] p-8 backdrop-blur-md">
              <div className="flex flex-col items-center gap-8 lg:flex-row">
                <div className="flex min-w-[200px] flex-col justify-center">
                  <div>
                    <h1 className="text-3xl font-light tracking-tight text-white/70">Annee</h1>
                    <h2 className="text-5xl font-bold tracking-tighter text-white">{new Date().getFullYear()}</h2>
                  </div>

                  <div className="mt-8">
                    <span className="text-5xl font-extrabold leading-none text-white">{dashboardTotalActivities}</span>
                    <p className="mt-2 text-xs font-bold uppercase leading-tight tracking-[0.2em] text-white/50">Total des activites</p>
                  </div>
                </div>

                <div className="flex w-full flex-1 flex-col gap-4 sm:flex-row">
                  <DashboardCard label="En cours" value={dashboardInProgressCount} href="/activites" />
                  <DashboardCard label="Planifiees" value={dashboardPlannedCount} href="/activites" />
                  <DashboardCard label="Terminees" value={dashboardCompletedCount} href="/activites" highlighted />
                </div>
              </div>
            </div>

            <div className="mb-6 flex items-center gap-4">
              <h2 className="whitespace-nowrap text-xl font-bold uppercase tracking-tight text-white">Activites recentes</h2>
              <div className="h-[1px] w-full bg-white/20" />
            </div>

            <AppScrollArea className="w-full" orientation="horizontal">
              <table className="min-w-full border-separate border-spacing-0">
                <thead>
                  <tr className="bg-[#082f63] text-white">
                    <th className="rounded-l-full px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Activite</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Debut</th>
                    <th className="rounded-r-full px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="before:block before:h-4 before:content-['']">
                  {dashboardRecentActivities.length ? (
                    dashboardRecentActivities.map((activity) => (
                      <tr key={activity.id} className="group transition-colors">
                        <td className="border-b-2 border-white/30 px-6 py-5 font-semibold text-white/90">{activity.nom_activite}</td>
                        <td className="border-b-2 border-white/30 px-6 py-5">
                          <div className={`inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold ${getStatusColor(activity.statut)}`}>
                            {activity.statut}
                          </div>
                        </td>
                        <td className="border-b-2 border-white/30 px-6 py-5 font-semibold text-white/90">{formatDisplayDate(activity.date_debut)}</td>
                        <td className="border-b-2 border-white/30 px-6 py-5">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openActivityModal(activity)}
                              className="rounded-lg bg-white/5 p-2 text-white transition-colors hover:bg-white/10"
                              title="Voir"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.183.184.557.184 1.144 0 1.701C20.577 17.584 16.641 20.5 12 20.5c-4.638 0-8.573-3.007-9.963-7.183Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-white/60">
                        Aucune activite recente.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </AppScrollArea>
          </div>
        </AppScrollArea>
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/20 bg-[rgb(15,27,45)] text-white shadow-2xl shadow-black/40 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between border-b border-white/30 bg-[rgb(15,27,45)] px-6 py-4">
              <h1 className="text-2xl font-bold tracking-wide">Fiche activite</h1>
              <button onClick={closeActivityModal} className="text-white/60 transition-colors hover:text-white" aria-label="Fermer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-8 w-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <AppScrollArea className="flex-1 min-h-0" viewportClassName="p-8">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold uppercase tracking-widest text-white/90">Nom activite</label>
                  <input
                    type="text"
                    value={activityForm.name}
                    onChange={(event) => setActivityForm((prev) => ({ ...prev, name: event.target.value }))}
                    disabled={!canManageActivities}
                    className="w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 font-medium text-white outline-none transition-all focus:border-white/60 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold uppercase tracking-widest text-white/90">Statut</label>
                  {canManageActivities ? (
                    <AppCombobox
                      value={activityForm.status}
                      options={statusOptions}
                      placeholder="Choisir un statut"
                      ariaLabel="Statut"
                      emptyText="Aucun statut trouve."
                      onChange={(value) => setActivityForm((prev) => ({ ...prev, status: value }))}
                    />
                  ) : (
                    <input
                      type="text"
                      value={activityForm.status}
                      disabled
                      className="w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-white/70 outline-none disabled:cursor-not-allowed"
                    />
                  )}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold uppercase tracking-widest text-white/90">Responsable</label>
                  {canManageActivities ? (
                    <AppCombobox
                      value={activityForm.responsableId}
                      options={responsableOptions}
                      placeholder="Choisir un responsable"
                      ariaLabel="Responsable"
                      emptyText="Aucun responsable trouve."
                      onChange={(value) => {
                        const selectedResponsable = responsableOptions.find((option) => option.value === value);
                        setActivityForm((prev) => ({
                          ...prev,
                          responsableId: value,
                          responsable: selectedResponsable?.label ?? "",
                        }));
                      }}
                    />
                  ) : (
                    <input
                      type="text"
                      value={activityForm.responsable}
                      disabled
                      className="w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-white/70 outline-none disabled:cursor-not-allowed"
                    />
                  )}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold uppercase tracking-widest text-white/90">Participants</label>
                  <div className="rounded-2xl border border-white/25 bg-white/10 p-4 text-white">
                    <ul className="mb-4 space-y-2">
                      {participants.length ? (
                        participants.map((participant, index) => (
                          <li key={`${participant}-${index}`} className="group/p flex items-center justify-between">
                            <span className="font-medium">{participant}</span>
                            {canManageActivities ? (
                              <button
                                onClick={() => setConfirmAction({ show: true, type: "participant", index })}
                                className="text-xs text-red-300 opacity-0 transition-all group-hover/p:opacity-100 hover:text-red-200"
                              >
                                Supprimer
                              </button>
                            ) : null}
                          </li>
                        ))
                      ) : (
                        <li className="text-sm text-white/60">Aucun participant.</li>
                      )}
                    </ul>
                    {canManageActivities && !showAddParticipant ? (
                      <button
                        onClick={() => setShowAddParticipant(true)}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-white/30 py-2.5 text-sm font-medium transition-colors hover:bg-white/5"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Ajouter un participant
                      </button>
                    ) : canManageActivities ? (
                      <div className="animate-in slide-in-from-top flex gap-2 duration-300">
                        <div className="flex-1">
                          <AppCombobox
                            value={participantPickerValue}
                            options={availableUsers.filter((user) => !participants.includes(user)).map((user) => ({ label: user, value: user }))}
                            placeholder="Selectionner..."
                            ariaLabel="Ajouter un participant"
                            emptyText="Aucun participant disponible."
                            onChange={(value) => {
                              setParticipantPickerValue(value);
                              handleAddParticipant(value);
                            }}
                          />
                        </div>
                        <button onClick={() => setShowAddParticipant(false)} className="px-3 py-2 text-white/60 transition-colors hover:text-white">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="mb-2 block text-sm font-semibold uppercase tracking-widest text-white/90">Commentaires</label>
                <textarea
                  value={activityForm.comments}
                  onChange={(event) => setActivityForm((prev) => ({ ...prev, comments: event.target.value }))}
                  disabled={!canManageActivities}
                  className="h-32 w-full resize-none rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/60 focus:border-white/60 disabled:cursor-not-allowed disabled:opacity-60"
                  placeholder="Zone de texte pour mettre des remarques"
                />
              </div>

              <div className="mt-6 grid gap-6 text-white/80 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Debut : {formatDisplayDate(activityForm.startDate)}</label>
                  <input
                    type="date"
                    value={activityForm.startDate}
                    onChange={(event) => setActivityForm((prev) => ({ ...prev, startDate: event.target.value }))}
                    disabled={!canManageActivities}
                    className="w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-white outline-none focus:border-white/60 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Fin : {formatDisplayDate(activityForm.endDate)}</label>
                  <input
                    type="date"
                    value={activityForm.endDate}
                    onChange={(event) => setActivityForm((prev) => ({ ...prev, endDate: event.target.value }))}
                    disabled={!canManageActivities}
                    className="w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-white outline-none focus:border-white/60 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
              </div>
            </AppScrollArea>

            {canManageActivities ? (
              <div className="flex items-center justify-between border-t border-white/30 bg-[rgb(15,27,45)] px-8 py-5">
                <button
                  onClick={() => setConfirmAction({ show: true, type: "activity", index: selectedActivityId })}
                  className="font-semibold text-red-400 transition-colors hover:text-red-300"
                >
                  Supprimer
                </button>
                <div className="w-full sm:max-w-[200px]">
                  <Button label="Mettre a jour" onClick={handleActivityUpdate} />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {confirmAction.show ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-sm rounded-[2rem] border border-white/20 bg-[rgb(15,27,45)] p-8 text-center text-white shadow-2xl animate-in zoom-in-95 duration-300">
            <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full ${confirmAction.type === "logout" ? "bg-blue-500/20 text-blue-400" : "bg-red-500/20 text-red-400"}`}>
              {confirmAction.type === "logout" ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-8 w-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-8 w-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              )}
            </div>
            <h3 className="mb-2 text-xl font-bold">
              {confirmAction.type === "logout" ? "Confirmer la deconnexion" : "Confirmer la suppression"}
            </h3>
            <p className="mb-8 leading-relaxed text-white/60">
              {confirmAction.type === "logout"
                ? "Voulez-vous vraiment vous deconnecter ? Toute session non enregistree pourrait etre perdue."
                : confirmAction.type === "participant" && confirmAction.index !== null
                  ? `Voulez-vous vraiment supprimer ce participant "${participants[confirmAction.index]}" ? Cette action est irreversible.`
                  : "Voulez-vous vraiment supprimer cette activite ? Cette action est irreversible."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmAction({ show: false, type: "participant", index: null })}
                className="flex-1 rounded-xl bg-white/10 py-3 font-semibold outline-none transition-all hover:bg-white/15"
              >
                Annuler
              </button>
              <button
                onClick={() => void handleAction()}
                className={`flex-1 rounded-xl py-3 font-semibold shadow-lg outline-none transition-all active:scale-95 ${confirmAction.type === "logout" ? "bg-blue-600 hover:bg-blue-500 shadow-blue-900/40" : "bg-red-600 hover:bg-red-500 shadow-red-900/40"}`}
              >
                {confirmAction.type === "logout" ? "Deconnecter" : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function DashboardCard({
  label,
  value,
  href,
  highlighted = false,
}: {
  label: string;
  value: number;
  href: string;
  highlighted?: boolean;
}) {
  return (
    <div className={`group relative flex min-h-[180px] flex-1 flex-col justify-between rounded-[2rem] border border-white/10 p-8 transition-all hover:bg-white/10 ${highlighted ? "bg-[#1460ab]/20 shadow-xl shadow-black/10 hover:bg-[#1460ab]/30" : "bg-white/5"}`}>
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <span className="text-6xl font-black leading-none text-white">{value}</span>
        <p className="mt-4 text-lg font-bold uppercase tracking-widest text-white/80">{label}</p>
      </div>
      <Link href={href} className="absolute bottom-6 right-6 text-white/30 transition-colors group-hover:text-white">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
        </svg>
      </Link>
    </div>
  );
}
