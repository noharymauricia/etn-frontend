import axios from "axios";

const AUTH_TOKEN_KEY = "etn_auth_token";
const AUTH_PROFILE_KEY = "etn_auth_profile";
const AUTH_ROLE_KEY = "etn_auth_role";

function getStoredToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(AUTH_TOKEN_KEY);
}

function clearAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_PROFILE_KEY);
  localStorage.removeItem(AUTH_ROLE_KEY);
  document.cookie = `${AUTH_TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
  document.cookie = `${AUTH_ROLE_KEY}=; path=/; max-age=0; SameSite=Lax`;
}

const isProd = process.env.NODE_ENV === "production";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? (isProd ? "https://drse.bambaray.mg/backend/public/api/" : "http://127.0.0.1:8000/api"),
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const UNAUTHORIZED_EVENT = "etn:unauthorized";

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && typeof window !== "undefined") {
      clearAuthSession();
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }

    return Promise.reject(error);
  },
);

export default api;

