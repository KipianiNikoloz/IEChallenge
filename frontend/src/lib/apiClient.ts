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

export class ApiError extends Error {
  status?: number;
  data?: unknown;
}

function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const err = new ApiError(error.message);
    err.status = error.response?.status;
    err.data = error.response?.data;
    return err;
  }
  const err = new ApiError("Unexpected error");
  return err;
}

async function unwrap<T>(promise: Promise<{ data: T }>): Promise<T> {
  try {
    const response = await promise;
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function get<T>(url: string) {
  return unwrap<T>(api.get<T>(url));
}

export async function post<T>(url: string, body: unknown) {
  return unwrap<T>(api.post<T>(url, body));
}

export async function patch<T>(url: string, body: unknown) {
  return unwrap<T>(api.patch<T>(url, body));
}

export async function destroy<T>(url: string) {
  return unwrap<T>(api.delete<T>(url));
}

export { api };
