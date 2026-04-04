import api from "@/api/axios";

export type ActiviteProfil = {
  id: number;
  matricule: string;
  nom: string;
  role: string;
  fonction: string;
  telephone?: string | null;
  image?: string | null;
};

export type Activite = {
  id: number;
  nom_activite: string;
  statut: string;
  responsable: string;
  participants: string[];
  commentaire?: string | null;
  date_debut: string;
  date_fin: string;
  profil_id: number;
  profil?: ActiviteProfil | null;
  created_at?: string;
  updated_at?: string;
};

export type CreateActivitePayload = {
  nom_activite: string;
  statut: string;
  responsable: string;
  participants?: string[];
  commentaire?: string;
  date_debut: string;
  date_fin: string;
  profil_id: number;
};

export type UpdateActivitePayload = CreateActivitePayload;

function getErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
  ) {
    return (error as { response: { data: { message: string } } }).response.data.message;
  }

  return fallback;
}

async function getAll() {
  const response = await api.get<Activite[]>("/activites");
  return response.data;
}

async function getById(id: number) {
  const response = await api.get<Activite>(`/activites/${id}`);
  return response.data;
}

async function search(keyword: string) {
  const response = await api.get<Activite[]>(`/activites/search/${encodeURIComponent(keyword)}`);
  return response.data;
}

async function create(payload: CreateActivitePayload) {
  const response = await api.post<Activite>("/activites", payload);
  return response.data;
}

async function update(id: number, payload: UpdateActivitePayload) {
  const response = await api.put<Activite>(`/activites/${id}`, payload);
  return response.data;
}

async function remove(id: number) {
  const response = await api.delete<{ message: string }>(`/activites/${id}`);
  return response.data;
}

export const activiteService = {
  getAll,
  getById,
  search,
  create,
  update,
  remove,
  getErrorMessage,
};
