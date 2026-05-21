import { Redirect, Tabs, usePathname, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/stores/auth-store";
import { Pressable, StyleSheet, View } from "react-native";
import { useTheme } from "@/src/hooks/useTheme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
  const { colors, isDark } = useTheme();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const shouldShowTabBar = pathname === "/" || pathname === "/invoices";

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  const tabPaddingBottom = Math.max(insets.bottom, 16);
  const tabHeight = 64 + tabPaddingBottom;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.tabIconSelected,
          tabBarInactiveTintColor: colors.tabIconDefault,
          tabBarStyle: {
            display: shouldShowTabBar ? "flex" : "none",
            height: tabHeight,
            paddingTop: 8,
            paddingBottom: tabPaddingBottom,
            backgroundColor: colors.surface,
            borderTopWidth: 0,
            shadowColor: "#0F172A",
            shadowOpacity: isDark ? 0.4 : 0.08,
            shadowRadius: 18,
            shadowOffset: { width: 0, height: -4 },
            elevation: 10,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: "600",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Dashboard",
            tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="invoices/index"
          options={{
            title: "Invoices",
            href: "/invoices",
            tabBarIcon: ({ color, size }) => <Ionicons name="document-text-outline" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="invoices/[id]"
          options={{
            href: null,
            title: "Invoice Details",
          }}
        />
        <Tabs.Screen
          name="invoices/create"
          options={{
            href: null,
            title: "Create Invoice",
          }}
        />
        <Tabs.Screen
          name="notifications"
          options={{
            href: null,
            title: "Notifications",
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            href: null,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            href: null,
          }}
        />
      </Tabs>

      {shouldShowTabBar && (
        <Pressable
          style={[styles.fab, { backgroundColor: colors.tint, bottom: tabHeight + 16 }]}
          onPress={() => router.push("/(tabs)/invoices/create")}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fab: {
    position: "absolute",
    bottom: 96,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0F172A",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
});
