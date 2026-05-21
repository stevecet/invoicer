import { api } from "@/src/services/api";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};
export type UserProfile = {
  _id: string;
  name: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type VerifyResetOtpPayload = {
  email: string;
  otp: string;
};

export type ResetPasswordWithOtpPayload = {
  email: string;
  otp: string;
  password: string;
};

export async function login(payload: LoginPayload) {
  const response = await api.post<AuthResponse>("/auth/login", payload);
  return response.data;
}

export async function register(payload: RegisterPayload) {
  const response = await api.post<AuthResponse>("/auth/register", payload);
  return response.data;
}

export async function forgotPassword(payload: ForgotPasswordPayload) {
  const response = await api.post("/auth/forgot-password", payload);
  return response.data;
}

export async function verifyResetOtp(payload: VerifyResetOtpPayload) {
  const response = await api.post("/auth/verify-reset-otp", payload);
  return response.data;
}

export async function resetPasswordWithOtp(
  payload: ResetPasswordWithOtpPayload,
) {
  const response = await api.put("/auth/reset-password", payload);
  return response.data;
}

export type UpdateProfilePayload = {
  name?: string;
  email?: string;
  password?: string;
};

export async function updateProfile(payload: UpdateProfilePayload) {
  const response = await api.patch<UserProfile>("/users/profile", payload);
  return response.data;
}

export async function getProfile(): Promise<UserProfile | null> {
  const response = await api.get<any>("/users/me");
  if (response.data?.user) return response.data.user;
  if (response.data?.data) return response.data.data;
  return response.data;
}

export async function deleteAccount() {
  await api.delete("/auth/profile");
}
