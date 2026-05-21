import { create } from "axios";

let getToken: () => string | null = () => null;

export function setTokenGetter(getter: () => string | null) {
  getToken = getter;
}

export const api = create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
