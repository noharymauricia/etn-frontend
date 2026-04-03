import axios from "axios";

// Instance Axios centralisee pour eviter de reconfigurer la base API dans chaque service.
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
