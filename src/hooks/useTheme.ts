import { useColorScheme } from "react-native";
import { Colors } from "../constants/Colors";
import { useSettingsStore } from "@/stores/settings-store";

export function useTheme() {
  const systemColorScheme = useColorScheme();
  const preferredTheme = useSettingsStore((state) => state.theme);
  
  const theme = preferredTheme === "system" 
    ? (systemColorScheme === "dark" ? "dark" : "light")
    : preferredTheme;
  
  return {
    colors: Colors[theme],
    theme,
    isDark: theme === "dark",
  };
}
