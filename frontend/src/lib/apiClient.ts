import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1",
  timeout: 8000,
});

export async function get<T>(url: string) {
  const response = await api.get<T>(url);
  return response.data;
}

export { api };
