import {
  forgotPassword,
  login as loginRequest,
  register as registerRequest,
  resetPasswordWithOtp,
  type LoginPayload,
  type RegisterPayload,
  verifyResetOtp,
  deleteAccount as deleteAccountRequest,
} from "@/src/services/auth";
import {
  type UserProfile,
  type UpdateProfilePayload,
  getProfile as getProfileRequest,
  updateProfile as updateProfileRequest,
} from "@/src/services/users";
import { setTokenGetter } from "@/src/services/api";
import { AxiosError } from "axios";
import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

const INVOICER_TOKEN_KEY = "invoicer_auth_token";
const INVOICER_USER_KEY = "invoicer_auth_user";
const INVOICER_EXP_KEY = "invoicer_auth_exp";

function decodeJwt(token: string): any {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    let base64Url = parts[1];
    let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

    while (base64.length % 4) {
      base64 += "=";
    }

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    const str = base64.replace(/=+$/, "");
    let decoded = "";

    for (
      let bc = 0, bs = 0, buffer, idx = 0;
      (buffer = str.charAt(idx++));
      ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4)
        ? (decoded += String.fromCharCode(255 & (bs >> (-2 * bc & 6))))
        : 0
    ) {
      buffer = chars.indexOf(buffer);
    }

    return JSON.parse(decoded);
  } catch (error) {
    console.warn("Failed to decode JWT token:", error);
    return null;
  }
}

async function saveSession(token: string, user: any) {
  try {
    await SecureStore.setItemAsync(INVOICER_TOKEN_KEY, token);
    if (user) {
      await SecureStore.setItemAsync(INVOICER_USER_KEY, JSON.stringify(user));
    }
    const decoded = decodeJwt(token);
    if (decoded && typeof decoded.exp === "number") {
      const expiryTimestamp = decoded.exp * 1000;
      await SecureStore.setItemAsync(INVOICER_EXP_KEY, expiryTimestamp.toString());
    } else {
      // Fallback: 7 days
      const expiryTimestamp = Date.now() + 7 * 24 * 60 * 60 * 1000;
      await SecureStore.setItemAsync(INVOICER_EXP_KEY, expiryTimestamp.toString());
    }
  } catch (error) {
    console.error("Failed to save session to SecureStore:", error);
  }
}

async function clearSession() {
  try {
    await SecureStore.deleteItemAsync(INVOICER_TOKEN_KEY);
    await SecureStore.deleteItemAsync(INVOICER_USER_KEY);
    await SecureStore.deleteItemAsync(INVOICER_EXP_KEY);
  } catch (error) {
    console.error("Failed to clear session from SecureStore:", error);
  }
}

type AuthState = {
  isAuthenticated: boolean;
  token: string | null;
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<boolean>;
  register: (payload: RegisterPayload) => Promise<boolean>;
  deleteAccount: () => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  verifyPasswordResetOtp: (email: string, otp: string) => Promise<boolean>;
  resetPasswordWithOtp: (
    email: string,
    otp: string,
    password: string,
  ) => Promise<boolean>;
  fetchProfile: () => Promise<boolean>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  restoreSession: () => Promise<boolean>;
};

function getErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    return error.response?.data?.message ?? error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  token: null,
  user: null,
  isLoading: false,
  error: null,
  login: async (payload) => {
    set({ isLoading: true, error: null });

    try {
      const response = await loginRequest(payload);
      const resolvedUser = response.user ? { ...response.user, _id: response.user.id, id: response.user.id } : null;

      set({
        isAuthenticated: true,
        token: response.token,
        user: resolvedUser,
        isLoading: false,
      });

      if (response.token) {
        await saveSession(response.token, resolvedUser);
      }

      return true;
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(error),
      });
      return false;
    }
  },
  register: async (payload) => {
    set({ isLoading: true, error: null });

    try {
      const response = await registerRequest(payload);
      const resolvedUser = response.user ? { ...response.user, _id: response.user.id, id: response.user.id } : null;

      set({
        isAuthenticated: true,
        token: response.token,
        user: resolvedUser,
        isLoading: false,
      });

      if (response.token) {
        await saveSession(response.token, resolvedUser);
      }

      return true;
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(error),
      });
      return false;
    }
  },
  deleteAccount: async () => {
    set({ isLoading: true, error: null });

    try {
      await deleteAccountRequest();
      await clearSession();
      set({
        isAuthenticated: false,
        token: null,
        user: null,
        isLoading: false,
      });
      return true;
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(error),
      });
      return false;
    }
  },
  requestPasswordReset: async (email) => {
    set({ isLoading: true, error: null });

    try {
      await forgotPassword({ email });
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(error),
      });
      return false;
    }
  },
  verifyPasswordResetOtp: async (email, otp) => {
    set({ isLoading: true, error: null });

    try {
      await verifyResetOtp({ email, otp });
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(error),
      });
      return false;
    }
  },
  resetPasswordWithOtp: async (email, otp, password) => {
    set({ isLoading: true, error: null });

    try {
      await resetPasswordWithOtp({ email, otp, password });
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(error),
      });
      return false;
    }
  },
  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await getProfileRequest();
      if (data) {
        const updatedUser = { ...data, id: data._id };
        set({
          user: updatedUser,
          isLoading: false,
        });
        // Keep the local storage session user in-sync
        SecureStore.setItemAsync(INVOICER_USER_KEY, JSON.stringify(updatedUser)).catch(e => {
          console.warn("Failed to update user in SecureStore:", e);
        });
        return true;
      }
      set({ isLoading: false });
      return false;
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(error),
      });
      return false;
    }
  },
  updateProfile: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const data = await updateProfileRequest(payload);
      set((state) => {
        const updatedUser = state.user ? { ...state.user, ...payload, ...data, id: data?._id || state.user._id } : null;
        if (updatedUser) {
          SecureStore.setItemAsync(INVOICER_USER_KEY, JSON.stringify(updatedUser)).catch(e => {
            console.warn("Failed to update user in SecureStore:", e);
          });
        }
        return {
          user: updatedUser,
          isLoading: false,
        };
      });
      return true;
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(error),
      });
      return false;
    }
  },
  logout: () => {
    clearSession();
    set({
      isAuthenticated: false,
      token: null,
      user: null,
      error: null,
    });
  },
  clearError: () => set({ error: null }),
  restoreSession: async () => {
    try {
      const token = await SecureStore.getItemAsync(INVOICER_TOKEN_KEY);
      const userStr = await SecureStore.getItemAsync(INVOICER_USER_KEY);
      const expStr = await SecureStore.getItemAsync(INVOICER_EXP_KEY);

      if (!token || !expStr) {
        await clearSession();
        return false;
      }

      const expiryTimestamp = parseInt(expStr, 10);
      const currentTime = Date.now();

      if (isNaN(expiryTimestamp) || currentTime >= expiryTimestamp) {
        await clearSession();
        return false;
      }

      let user = null;
      if (userStr) {
        try {
          user = JSON.parse(userStr);
        } catch (e) {
          console.warn("Failed to parse user session", e);
        }
      }

      set({
        isAuthenticated: true,
        token,
        user,
      });

      // Background refresh user profile to keep it updated and verify token validity
      getProfileRequest()
        .then((profile) => {
          if (profile) {
            const updatedUser = { ...profile, id: profile._id };
            set({ user: updatedUser });
            SecureStore.setItemAsync(INVOICER_USER_KEY, JSON.stringify(updatedUser)).catch(e => {
              console.warn("Failed to update user in SecureStore:", e);
            });
          }
        })
        .catch((error) => {
          console.error("Session refresh failed (possibly invalid/revoked token):", error);
          if (error instanceof AxiosError && (error.response?.status === 401 || error.response?.status === 403)) {
            useAuthStore.getState().logout();
          }
        });

      return true;
    } catch (error) {
      console.error("Failed to restore session from SecureStore:", error);
      await clearSession();
      return false;
    }
  },
}));

setTokenGetter(() => useAuthStore.getState().token);
