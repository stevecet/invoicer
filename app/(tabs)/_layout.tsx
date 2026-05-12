import { Redirect, Tabs } from "expo-router";
import { useAuthStore } from "@/stores/auth-store";

export default function TabsLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#169AF7",
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
    </Tabs>
  );
}
