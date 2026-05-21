import { create } from "zustand";

export type ThemeMode = "light" | "dark" | "system";
export type Language = "en" | "fr";

interface SettingsState {
  theme: ThemeMode;
  language: Language;
  currency: string;
  setTheme: (theme: ThemeMode) => void;
  setLanguage: (language: Language) => void;
  setCurrency: (currency: string) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: "system",
  language: "en",
  currency: "USD",
  setTheme: (theme) => set({ theme }),
  setLanguage: (language) => set({ language }),
  setCurrency: (currency) => set({ currency }),
}));
