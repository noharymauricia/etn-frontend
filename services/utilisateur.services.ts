import api from "@/api/axios";

export type Utilisateur = {
  id: number;
  matricule: string;
  nom: string;
  role: string;
  fonction: string;
  telephone?: string | null;
  image?: string | null;
};

export type CreateUtilisateurPayload = {
  matricule: string;
  mot_de_passe: string;
  nom: string;
  role: string;
  fonction: string;
  telephone?: string;
  image?: string | null;
};

export type UpdateUtilisateurPayload = {
  matricule: string;
  nom: string;
  role: string;
  fonction: string;
  telephone?: string;
  mot_de_passe?: string;
  image?: string | null;
};

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
  const response = await api.get<Utilisateur[]>("/profils");
  return response.data;
}

async function getById(id: number) {
  const response = await api.get<Utilisateur>(`/profils/${id}`);
  return response.data;
}

async function create(payload: CreateUtilisateurPayload) {
  const response = await api.post<Utilisateur>("/profils", payload);
  return response.data;
}

async function update(id: number, payload: UpdateUtilisateurPayload) {
  const response = await api.put<Utilisateur>(`/profils/${id}`, payload);
  return response.data;
}

async function remove(id: number) {
  const response = await api.delete<{ message: string }>(`/profils/${id}`);
  return response.data;
}

export const utilisateurService = {
  getAll,
  getById,
  create,
  update,
  remove,
  getErrorMessage,
};
