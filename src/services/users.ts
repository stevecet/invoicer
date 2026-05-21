import { api } from "@/src/services/api";

export type UserProfile = {
  _id: string;
  id?: string;
  name: string;
  email: string;
  password?: string;
  currency?: string;
  language?: string;
};

export async function getProfile(): Promise<UserProfile | null> {
  const response = await api.get<any>("/users/me");
  if (response.data?.user) return response.data.user;
  if (response.data?.data) return response.data.data;
  return response.data;
}

export type UpdateProfilePayload = {
  name?: string;
  email?: string;
  password?: string;
  currency?: string;
  language?: string;
};

export async function updateProfile(payload: UpdateProfilePayload) {
  const response = await api.patch("/users/me", payload);
  return response.data;
}

