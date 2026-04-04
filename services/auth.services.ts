import api from "@/api/axios";

export const AUTH_TOKEN_KEY = "etn_auth_token";
export const AUTH_PROFILE_KEY = "etn_auth_profile";
export const AUTH_ROLE_KEY = "etn_auth_role";

export type AuthProfile = {
  id: number;
  matricule: string;
  nom: string;
  role: string;
  fonction: string;
  telephone?: string | null;
  image?: string | null;
};

type LoginPayload = {
  matricule: string;
  mot_de_passe: string;
};

type LoginResponse = {
  profil: AuthProfile;
  token: string;
};

function isBrowser() {
  return typeof window !== "undefined";
}

function setCookie(name: string, value: string, maxAge = 60 * 60 * 8) {
  if (!isBrowser()) {
    return;
  }

  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function clearCookie(name: string) {
  if (!isBrowser()) {
    return;
  }

  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

export function persistAuthSession(session: LoginResponse) {
  if (!isBrowser()) {
    return;
  }

  localStorage.setItem(AUTH_TOKEN_KEY, session.token);
  localStorage.setItem(AUTH_PROFILE_KEY, JSON.stringify(session.profil));
  localStorage.setItem(AUTH_ROLE_KEY, session.profil.role);

  setCookie(AUTH_TOKEN_KEY, session.token);
  setCookie(AUTH_ROLE_KEY, session.profil.role);
}

export function clearAuthSession() {
  if (!isBrowser()) {
    return;
  }

  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_PROFILE_KEY);
  localStorage.removeItem(AUTH_ROLE_KEY);

  clearCookie(AUTH_TOKEN_KEY);
  clearCookie(AUTH_ROLE_KEY);
}

export function getStoredToken() {
  if (!isBrowser()) {
    return null;
  }

  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getStoredRole() {
  if (!isBrowser()) {
    return null;
  }

  return localStorage.getItem(AUTH_ROLE_KEY);
}

export function getStoredProfile() {
  if (!isBrowser()) {
    return null;
  }

  const rawProfile = localStorage.getItem(AUTH_PROFILE_KEY);

  if (!rawProfile) {
    return null;
  }

  try {
    return JSON.parse(rawProfile) as AuthProfile;
  } catch {
    clearAuthSession();
    return null;
  }
}

function getErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
  ) {
    return (error as { response: { data: { message: string } } }).response.data.message;
  }

  return "Une erreur est survenue lors de la connexion.";
}

async function login(payload: LoginPayload) {
  const response = await api.post<LoginResponse>("/login", payload);
  persistAuthSession(response.data);
  return response.data;
}

async function me() {
  const response = await api.get<AuthProfile>("/me");
  return response.data;
}

async function logout() {
  try {
    await api.post("/logout");
  } finally {
    clearAuthSession();
  }
}

export const authService = {
  login,
  me,
  logout,
  getErrorMessage,
};
