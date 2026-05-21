import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useTheme } from "../hooks/useTheme";

type AppBarProps = {
  title: string;
};

function getInitials(name?: string | null) {
  if (!name) {
    return "IN";
  }

  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "IN";
}

export default function AppBar({ title }: AppBarProps) {
  const { colors, isDark } = useTheme();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const fetchProfile = useAuthStore((state) => state.fetchProfile);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return (
    <>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.container}>
          <Pressable onPress={() => setIsProfileOpen(true)} style={[styles.avatarButton, { backgroundColor: colors.tint }]}>
            <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
          </Pressable>

          <Pressable onPress={() => router.push("/(tabs)/notifications")} style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
          </Pressable>
        </View>
      </SafeAreaView>

      <Modal
        animationType="fade"
        transparent
        visible={isProfileOpen}
        onRequestClose={() => setIsProfileOpen(false)}
      >
        <Pressable
          style={[styles.modalOverlay, { backgroundColor: isDark ? "rgba(0,0,0,0.7)" : "rgba(15, 23, 42, 0.35)" }]}
          onPress={() => setIsProfileOpen(false)}
        >
          <Pressable style={[styles.modalCard, { backgroundColor: colors.surface }]} onPress={() => { }}>
            <View style={styles.profileHeader}>
              <View style={[styles.profileAvatar, { backgroundColor: colors.tint }]}>
                <Text style={styles.profileAvatarText}>{getInitials(user?.name)}</Text>
              </View>
              <View style={styles.profileMeta}>
                <Text style={[styles.profileName, { color: colors.text }]}>{user?.name ?? "Invoicer User"}</Text>
                <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{user?.email ?? "No email available"}</Text>
              </View>
            </View>

            <Pressable
              style={[styles.menuItem, { borderTopColor: colors.border }]}
              onPress={() => {
                setIsProfileOpen(false);
                router.push("/(tabs)/profile");
              }}
            >
              <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.menuText, { color: colors.text }]}>Profile</Text>
            </Pressable>

            <Pressable
              style={[styles.menuItem, { borderTopColor: colors.border }]}
              onPress={() => {
                setIsProfileOpen(false);
                router.push("/(tabs)/settings");
              }}
            >
              <Ionicons name="settings-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.menuText, { color: colors.text }]}>Settings</Text>
            </Pressable>

            <Pressable
              style={[styles.menuItem, { borderTopColor: colors.border }]}
              onPress={() => {
                setIsProfileOpen(false);
                logout();
              }}
            >
              <Ionicons name="log-out-outline" size={20} color={colors.error} />
              <Text style={[styles.logoutText, { color: colors.error }]}>Sign out</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "transparent",
  },
  container: {
    minHeight: 68,
    backgroundColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
  },
  avatarButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    paddingTop: 96,
    paddingHorizontal: 16,
  },
  modalCard: {
    width: 280,
    borderRadius: 24,
    padding: 18,
    shadowColor: "#0F172A",
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 16 },
    elevation: 8,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  profileAvatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  profileMeta: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 13,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
    borderTopWidth: 1,
  },
  menuText: {
    fontSize: 15,
    fontWeight: "600",
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "700",
  },
});
