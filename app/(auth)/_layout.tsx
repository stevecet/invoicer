import { Redirect, Stack } from "expo-router";
import { useAuthStore } from "@/stores/auth-store";

export default function AuthLayout() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    if (isAuthenticated) {
        return <Redirect href="/home" />;
    }

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: "#FFFFFF" },
            }}
        />
    );
}
