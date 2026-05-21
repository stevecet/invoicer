import AppBootScreen from "@/src/components/AppBootScreen";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const restoreSession = useAuthStore((state) => state.restoreSession);

  useEffect(() => {
    let active = true;
    let timer: any = null;

    restoreSession()
      .catch((err) => {
        console.error("Session restoration error on app boot:", err);
      })
      .finally(() => {
        if (active) {
          timer = setTimeout(() => {
            setIsReady(true);
          }, 800);
        }
      });

    return () => {
      active = false;
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [restoreSession]);

  if (!isReady) {
    return <AppBootScreen />;
  }

  return (
    <Stack
      initialRouteName="(auth)"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
