import axios from "axios";

import { getToken } from "./auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1",
  timeout: 8000,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function get<T>(url: string) {
  const response = await api.get<T>(url);
  return response.data;
}

export async function post<T>(url: string, body: unknown) {
  const response = await api.post<T>(url, body);
  return response.data;
}

export { api };
