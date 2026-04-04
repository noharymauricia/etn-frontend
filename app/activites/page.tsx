"use client";

import { useEffect, useMemo, useState } from "react";

import PageShell from "@/components/layout/PageShell";
import AppCombobox from "@/components/ui/AppCombobox";
import AppScrollArea from "@/components/ui/AppScrollArea";
import Button from "@/components/ui/Button";
import { toast } from "@/components/ui/Toasts";
import { getStoredProfile } from "@/services/auth.services";
import {
  activiteService,
  type Activite,
  type CreateActivitePayload,
} from "@/services/activiter.services";
import { utilisateurService, type Utilisateur } from "@/services/utilisateur.services";

type ActivityFormState = {
  name: string;
  responsable: string;
  responsableId: string;
  status: string;
  comments: string;
  startDate: string;
  endDate: string;
};

function createEmptyActivityForm(defaultResponsable?: Utilisateur | null): ActivityFormState {
  return {
    name: "",
    responsable: defaultResponsable?.nom ?? "",
    responsableId: defaultResponsable ? String(defaultResponsable.id) : "",
    status: "En cours",
    comments: "",
    startDate: "",
    endDate: "",
  };
}

function normalizeStatus(status?: string) {
  if (!status) {
    return "En cours";
  }

  if (status === "Planifiee" || status === "Planifiée") {
    return "Planifiee";
  }

  if (status === "Terminee" || status === "Terminée") {
    return "Terminee";
  }

  return "En cours";
}

function formatDisplayDate(value?: string | null | undefined) {
  if (!value) {
    return "--/--/----";
  }

  const parts = value.split("-");

  if (parts.length !== 3) {
    return value;
  }

  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
}

function getActivityBadgeClass(status: string) {
  if (status === "Terminee" || status === "Terminée") {
    return "text-green-400";
  }

  if (status === "Planifiee" || status === "Planifiée") {
    return "text-orange-400";
  }

  if (status === "En cours") {
    return "text-blue-300";
  }

  return "text-white";
}

export default function ActivitiesPage() {
  const [currentProfileId, setCurrentProfileId] = useState<number | null>(null);
  const [canManageActivities, setCanManageActivities] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState<Activite[]>([]);
  const [users, setUsers] = useState<Utilisateur[]>([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null);
  const [participants, setParticipants] = useState<string[]>([]);
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [participantPickerValue, setParticipantPickerValue] = useState("");
  const [activityForm, setActivityForm] = useState<ActivityFormState>(createEmptyActivityForm());
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    type: "participant" | "activity";
    index: number | null;
  }>({ show: false, type: "participant", index: null });

  const defaultResponsable = useMemo(() => {
    if (!users.length) {
      return null;
    }

    return (
      users.find((user) => user.id === currentProfileId) ??
      users[0]
    );
  }, [currentProfileId, users]);

  const statusOptions = [
    { label: "En cours", value: "En cours" },
    { label: "Planifiee", value: "Planifiee" },
    { label: "Terminee", value: "Terminee" },
  ];

  const responsableOptions = users.map((user) => ({
    label: user.nom,
    value: String(user.id),
  }));

  const availableUsers = users.map((user) => user.nom).filter(Boolean);

  const selectedActivity = useMemo(
    () => activities.find((activity) => activity.id === selectedActivityId) ?? null,
    [activities, selectedActivityId],
  );

  const loadPageData = async (showErrorToast = true) => {
    try {
      const [activites, profils] = await Promise.all([
        activiteService.getAll(),
        utilisateurService.getAll(),
      ]);

      setActivities(Array.isArray(activites) ? activites : []);
      setUsers(Array.isArray(profils) ? profils : []);
    } catch (error) {
      if (showErrorToast) {
        toast.error(
          activiteService.getErrorMessage(error, "Impossible de charger les activites."),
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const refreshActivitiesAfterMutation = () => {
    void loadPageData(false);

    window.setTimeout(() => {
      void loadPageData(false);
    }, 500);

    window.setTimeout(() => {
      void loadPageData(false);
    }, 1200);
  };

  useEffect(() => {
    const storedProfile = getStoredProfile();

    setCurrentProfileId(storedProfile?.id ?? null);
    setCanManageActivities(Boolean(storedProfile));
  }, []);

  useEffect(() => {
    void loadPageData();

    const intervalId = window.setInterval(() => {
      void loadPageData(false);
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const search = searchTerm.toLowerCase().trim();
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      const activityStart = activity.date_debut ? new Date(activity.date_debut) : null;

      const matchesSearch =
        !search ||
        (activity.nom_activite?.toLowerCase() || "").includes(search) ||
        (activity.responsable?.toLowerCase() || "").includes(search) ||
        (activity.statut?.toLowerCase() || "").includes(search);

      let matchesDate = true;

      if (start && activityStart && activityStart < start) {
        matchesDate = false;
      }

      if (end && activityStart && activityStart > end) {
        matchesDate = false;
      }

      return matchesSearch && matchesDate;
    });
  }, [activities, endDate, searchTerm, startDate]);

  useEffect(() => {
    if (!activityForm.responsableId) {
      return;
    }

    const selectedResponsable = users.find(
      (user) => String(user.id) === activityForm.responsableId,
    );

    if (!selectedResponsable) {
      return;
    }

    setActivityForm((prev) => {
      if (prev.responsable === selectedResponsable.nom) {
        return prev;
      }

      return {
        ...prev,
        responsable: selectedResponsable.nom,
      };
    });
  }, [activityForm.responsableId, users]);

  const resetParticipantPicker = () => {
    setShowAddParticipant(false);
    setParticipantPickerValue("");
  };

  const openCreateModal = () => {
    if (!canManageActivities) {
      toast.warning("Vous devez etre connecte pour creer une activite.");
      return;
    }

    setSelectedActivityId(null);
    setActivityForm(createEmptyActivityForm(defaultResponsable));
    setParticipants([]);
    resetParticipantPicker();
    setIsCreateModalOpen(true);
  };

  const openViewModal = (activity: Activite) => {
    setSelectedActivityId(activity.id);
    setActivityForm({
      name: activity.nom_activite,
      responsable: activity.responsable,
      responsableId: String(activity.profil_id),
      status: normalizeStatus(activity.statut),
      comments: activity.commentaire ?? "",
      startDate: activity.date_debut ?? "",
      endDate: activity.date_fin ?? "",
    });
    setParticipants(activity.participants ?? []);
    resetParticipantPicker();
    setIsViewModalOpen(true);
  };

  const handleAddParticipant = (name: string) => {
    if (!name) {
      toast.warning("Selectionnez un participant avant de valider.");
      return;
    }

    if (participants.includes(name)) {
      toast.warning(`${name} participe deja a cette activite.`);
      return;
    }

    setParticipants((prev) => [...prev, name]);
    resetParticipantPicker();
    toast.success(`${name} a ete ajoute a l'activite.`);
  };

  const confirmDeleteParticipant = (index: number) => {
    if (!canManageActivities) {
      toast.warning("Vous devez etre connecte pour modifier cette activite.");
      return;
    }

    setDeleteConfirm({ show: true, type: "participant", index });
  };

  const confirmDeleteActivity = () => {
    if (!canManageActivities) {
      toast.warning("Vous devez etre connecte pour supprimer cette activite.");
      return;
    }

    setDeleteConfirm({ show: true, type: "activity", index: selectedActivityId });
  };

  const handleDelete = async () => {
    if (deleteConfirm.type === "participant" && deleteConfirm.index !== null) {
      const removedParticipant = participants[deleteConfirm.index];
      setParticipants((prev) => prev.filter((_, index) => index !== deleteConfirm.index));
      toast.success(`${removedParticipant} a ete retire de l'activite.`);
      setDeleteConfirm({ show: false, type: "participant", index: null });
      return;
    }

    if (deleteConfirm.type === "activity" && deleteConfirm.index !== null) {
      try {
        await activiteService.remove(deleteConfirm.index);
        setActivities((prev) => prev.filter((activity) => activity.id !== deleteConfirm.index));
        refreshActivitiesAfterMutation();
        setIsViewModalOpen(false);
        setIsCreateModalOpen(false);
        setDeleteConfirm({ show: false, type: "participant", index: null });
        toast.success("L'activite a ete supprimee.");
      } catch (error) {
        toast.error(
          activiteService.getErrorMessage(error, "Impossible de supprimer cette activite."),
        );
      }
    }
  };

  const buildPayload = (): CreateActivitePayload | null => {
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

  const handleActivitySubmit = async (mode: "create" | "update") => {
    if (!canManageActivities) {
      toast.warning("Vous devez etre connecte pour enregistrer une activite.");
      return;
    }

    const payload = buildPayload();

    if (!payload) {
      return;
    }

    try {
      if (mode === "create") {
        const createdActivity = await activiteService.create(payload);
        setActivities((prev) => [...prev, createdActivity]);
        refreshActivitiesAfterMutation();
        setIsCreateModalOpen(false);
        toast.success(`L'activite ${payload.nom_activite} a ete creee.`);
        return;
      }

      if (!selectedActivityId) {
        toast.error("Aucune activite selectionnee.");
        return;
      }

      const updatedActivity = await activiteService.update(selectedActivityId, payload);
      setActivities((prev) =>
        prev.map((activity) => (activity.id === selectedActivityId ? updatedActivity : activity)),
      );
      refreshActivitiesAfterMutation();
      setIsViewModalOpen(false);
      toast.success(`L'activite ${payload.nom_activite} a ete mise a jour.`);
    } catch (error) {
      toast.error(
        activiteService.getErrorMessage(
          error,
          mode === "create"
            ? "Impossible de creer cette activite."
            : "Impossible de mettre a jour cette activite.",
        ),
      );
    }
  };

  const participantOptions = availableUsers
    .filter((user) => !participants.includes(user))
    .map((user) => ({ label: user, value: user }));

  const renderActivityModal = (mode: "create" | "update") => {
    const isUpdateMode = mode === "update";
    const isReadonly = isUpdateMode && !canManageActivities;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/60 p-4 backdrop-blur-sm">
        <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/20 bg-[rgb(15,27,45)] text-white shadow-2xl shadow-black/40 animate-in fade-in zoom-in duration-300">
          <div className="flex items-center justify-between border-b border-white/30 bg-[rgb(15,27,45)] px-6 py-4">
            <h1 className="text-2xl font-bold tracking-wide">Fiche activite</h1>
            <button
              onClick={() => {
                if (isUpdateMode) {
                  setIsViewModalOpen(false);
                } else {
                  setIsCreateModalOpen(false);
                }
              }}
              className="text-white/60 transition-colors hover:text-white"
              aria-label="Fermer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-8 w-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <AppScrollArea className="flex-1 overflow-y-auto" viewportClassName="p-8">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold uppercase tracking-wider text-white/90">Nom activite</label>
                <input
                  type="text"
                  value={activityForm.name}
                  onChange={(event) =>
                    setActivityForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  disabled={isReadonly}
                  className="w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 font-medium text-white outline-none transition-all focus:border-white/60 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold uppercase tracking-wider text-white/90">Statut</label>
                <AppCombobox
                  value={activityForm.status}
                  options={statusOptions}
                  placeholder="Choisir un statut"
                  ariaLabel="Statut"
                  emptyText="Aucun statut trouve."
                  onChange={(value) =>
                    setActivityForm((prev) => ({ ...prev, status: value }))
                  }
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold uppercase tracking-wider text-white/90">Responsable</label>
                <AppCombobox
                  value={activityForm.responsableId}
                  options={responsableOptions}
                  placeholder="Choisir un responsable"
                  ariaLabel="Responsable"
                  emptyText="Aucun responsable trouve."
                  onChange={(value) =>
                    setActivityForm((prev) => ({ ...prev, responsableId: value }))
                  }
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold uppercase tracking-wider text-white/90">Participants</label>
                <div className="rounded-2xl border border-white/25 bg-white/10 p-4 text-white">
                  <ul className="mb-4 space-y-2">
                    {participants.length ? (
                      participants.map((participant, index) => (
                        <li key={`${participant}-${index}`} className="group/p flex items-center justify-between">
                          <span className="font-medium">{participant}</span>
                          {canManageActivities ? (
                            <button
                              onClick={() => confirmDeleteParticipant(index)}
                              className="text-xs text-red-300 opacity-0 transition-all group-hover/p:opacity-100"
                            >
                              Supprimer
                            </button>
                          ) : null}
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-white/60">Aucun participant ajoute.</li>
                    )}
                  </ul>
                  {canManageActivities ? (
                    !showAddParticipant ? (
                      <button
                        onClick={() => setShowAddParticipant(true)}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-white/30 py-2.5 text-sm font-medium transition-colors hover:bg-white/5"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Ajouter un participant
                      </button>
                    ) : (
                      <div className="animate-in slide-in-from-top flex gap-2 duration-300">
                        <div className="flex-1">
                          <AppCombobox
                            value={participantPickerValue}
                            options={participantOptions}
                            placeholder="Selectionner..."
                            ariaLabel="Ajouter un participant"
                            emptyText="Aucun participant disponible."
                            onChange={(value) => {
                              setParticipantPickerValue(value);
                              handleAddParticipant(value);
                            }}
                          />
                        </div>
                        <button
                          onClick={resetParticipantPicker}
                          className="px-3 py-2 text-white/60 transition-colors hover:text-white"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )
                  ) : null}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-semibold text-white/90">Commentaires</label>
              <textarea
                value={activityForm.comments}
                onChange={(event) =>
                  setActivityForm((prev) => ({ ...prev, comments: event.target.value }))
                }
                disabled={isReadonly}
                className="h-32 w-full resize-none rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/60 focus:border-white/60 disabled:opacity-60 disabled:cursor-not-allowed"
                placeholder="Zone de texte pour mettre des remarques."
              />
            </div>

            <div className="mt-6 grid gap-6 text-white/80 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Debut : {formatDisplayDate(activityForm.startDate)}</label>
                <input
                  type="date"
                  value={activityForm.startDate}
                  onChange={(event) =>
                    setActivityForm((prev) => ({ ...prev, startDate: event.target.value }))
                  }
                  disabled={isReadonly}
                  className="w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-white outline-none focus:border-white/60 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Fin : {formatDisplayDate(activityForm.endDate)}</label>
                <input
                  type="date"
                  value={activityForm.endDate}
                  onChange={(event) =>
                    setActivityForm((prev) => ({ ...prev, endDate: event.target.value }))
                  }
                  disabled={isReadonly}
                  className="w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-white outline-none focus:border-white/60 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </AppScrollArea>
           
          {canManageActivities ? (
            <div className="sticky bottom-0 z-20 flex items-center justify-between border-t border-white/30 bg-[rgb(15,27,45)] px-8 py-5">
              {isUpdateMode ? (
                <button
                  onClick={confirmDeleteActivity}
                  className="font-semibold text-red-400 transition-colors hover:text-red-300"
                >
                  Supprimer
                </button>
              ) : (
                <div />
              )}
              <div className="w-full max-w-[200px]">
                <Button
                  label={isUpdateMode ? "Mettre a jour" : "Enregistrer"}
                  onClick={() => void handleActivitySubmit(mode)}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <PageShell>
      <div className="mb-8 flex flex-col items-center justify-between gap-4 xl:flex-row">
        <div className="flex w-full flex-1 flex-col items-center gap-4 md:flex-row">
          <div className="relative w-full md:max-w-xs">
            <input
              type="text"
              placeholder="Rechercher une activite..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 font-medium text-white outline-none transition-all focus:border-white/60"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
          </div>

          <div className="flex w-full items-center gap-3 md:w-auto">
            <div className="flex flex-1 items-center gap-2 md:flex-none">
              <label className="whitespace-nowrap text-xs font-bold uppercase tracking-widest text-white/60">Debut</label>
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="w-full rounded-xl border border-white/25 bg-white/10 px-3 py-2.5 text-sm font-medium text-white outline-none transition-all focus:border-white/60 md:w-40"
              />
            </div>
            <div className="flex flex-1 items-center gap-2 md:flex-none">
              <label className="whitespace-nowrap text-xs font-bold uppercase tracking-widest text-white/60">Fin</label>
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="w-full rounded-xl border border-white/25 bg-white/10 px-3 py-2.5 text-sm font-medium text-white outline-none transition-all focus:border-white/60 md:w-40"
              />
            </div>
          </div>
        </div>

        {canManageActivities ? (
          <div className="w-full max-w-[220px]">
            <Button label="Creer une activite" onClick={openCreateModal} />
          </div>
        ) : null}
      </div>

      <div className="mb-6 flex items-center gap-4">
        <h2 className="whitespace-nowrap text-xl font-bold tracking-tight text-white">LISTE DES ACTIVITES</h2>
        <div className="h-[1px] w-full bg-white/20" />
      </div>

      <AppScrollArea className="w-full" orientation="horizontal">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-[#082f63] text-white">
              <th className="rounded-l-full px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Activite</th>
              <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Responsable</th>
              <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Statut</th>
              <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Debut</th>
              <th className="rounded-r-full px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="before:block before:h-4 before:content-['']">
            {!isLoading && filteredActivities.length ? (
              filteredActivities.map((activity) => (
                <tr key={activity.id} className="group transition-colors">
                  <td className="border-b-2 border-white/30 px-6 py-5 font-semibold text-white/90">{activity.nom_activite}</td>
                  <td className="border-b-2 border-white/30 px-6 py-5 font-semibold text-white/90">{activity.responsable}</td>
                  <td className="border-b-2 border-white/30 px-6 py-5 font-semibold text-white/90">
                    <div className={`inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold ${getActivityBadgeClass(activity.statut)}`}>
                      {activity.statut}
                    </div>
                  </td>
                  <td className="border-b-2 border-white/30 px-6 py-5 font-semibold text-white/90">{formatDisplayDate(activity.date_debut)}</td>
                  <td className="border-b-2 border-white/30 px-6 py-5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openViewModal(activity)}
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
                <td colSpan={5} className="px-6 py-10 text-center text-white/60">
                  {isLoading ? "Chargement des activites..." : "Aucune activite trouvee."}
                </td>
              </tr>
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

      {isCreateModalOpen ? renderActivityModal("create") : null}
      {isViewModalOpen && selectedActivity ? renderActivityModal("update") : null}

      {deleteConfirm.show ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-sm rounded-[2rem] border border-white/20 bg-[rgb(15,27,45)] p-8 text-center text-white shadow-2xl animate-in zoom-in-95 duration-400">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-10 w-10">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <p className="mb-8 font-semibold italic text-white/60">
              Attention : cette action est definitive et irreversible. Confirmez-vous le choix ?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteConfirm({ show: false, type: "participant", index: null })}
                className="flex-1 rounded-xl bg-white/5 py-3 text-sm font-semibold uppercase tracking-tighter transition-all hover:bg-white/10"
              >
                Annuler
              </button>
              <button
                onClick={() => void handleDelete()}
                className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-semibold uppercase tracking-tighter shadow-lg shadow-red-900/40 transition-all hover:bg-red-500"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}
