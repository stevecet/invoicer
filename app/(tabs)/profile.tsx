import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/stores/auth-store";
import PageHeader from "@/src/components/PageHeader";
import { useTheme } from "@/src/hooks/useTheme";
import Skeleton from "@/src/components/Skeleton";
import { router } from "expo-router";

export default function ProfileScreen() {
  const { colors, isDark } = useTheme();
  
  const user = useAuthStore((state) => state.user);
  const fetchProfile = useAuthStore((state) => state.fetchProfile);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const deleteAccount = useAuthStore((state) => state.deleteAccount);
  const logout = useAuthStore((state) => state.logout);
  const isStoreLoading = useAuthStore((state) => state.isLoading);
  const storeError = useAuthStore((state) => state.error);

  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const initProfile = async () => {
      setIsLoading(true);
      setFetchError(null);
      const success = await fetchProfile();
      if (!success && !user) {
        setFetchError(storeError || "Failed to load profile details.");
      }
      setIsLoading(false);
    };
    initProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleUpdate = async () => {
    if (!name.trim() && !email.trim() && !password) {
      Alert.alert("Error", "Please fill out at least one field to update.");
      return;
    }
    setIsLoading(true);
    const payload: { name?: string; email?: string; password?: string } = {};
    if (name.trim()) payload.name = name.trim();
    if (email.trim()) payload.email = email.trim();
    if (password) payload.password = password;

    const success = await updateProfile(payload);

    if (success) {
      Alert.alert("Success", "Profile updated successfully.");
      setIsEditing(false);
      setPassword("");
    } else {
      Alert.alert("Error", storeError || "Failed to update profile.");
    }
    setIsLoading(false);
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action is permanent and cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            const success = await deleteAccount();
            setIsLoading(false);
            if (success) {
              Alert.alert("Account Deleted", "Your account has been successfully removed.");
            } else {
              Alert.alert("Error", storeError || "Failed to delete account.");
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => {
            logout();
            router.replace("/login");
          },
        },
      ]
    );
  };

  if (isLoading && !isEditing) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <View style={styles.content}>
          <Skeleton width={100} height={20} style={{ marginBottom: 20 }} />
          <Skeleton height={250} style={{ marginBottom: 20 }} />
          <Skeleton width="40%" height={24} style={{ marginBottom: 12 }} />
          <Skeleton height={150} />
        </View>
      </View>
    );
  }

  if (fetchError || !user) {
    return (
      <View style={[styles.emptyState, { backgroundColor: colors.background }]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          {fetchError ?? "Profile not found"}
        </Text>
        <Text style={[styles.emptyBody, { color: colors.textSecondary }]}>
          We couldn&apos;t find the profile details for this record.
        </Text>
        <Pressable onPress={() => router.back()} style={[styles.backAction, { backgroundColor: colors.tint }]}>
          <Text style={styles.backActionText}>Back to dashboard</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      <PageHeader title="Profile" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
            <Text style={styles.avatarText}>
              {user?.name?.substring(0, 2).toUpperCase() || "US"}
            </Text>
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>{user?.name}</Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user?.email}</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Account Details</Text>
            <Pressable onPress={() => setIsEditing(!isEditing)}>
              <Text style={[styles.editLink, { color: colors.tint }]}>
                {isEditing ? "Cancel" : "Edit"}
              </Text>
            </Pressable>
          </View>

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Full Name</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, color: colors.text }]}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                  placeholderTextColor={colors.textMuted}
                />
              ) : (
                <Text style={[styles.info, { color: colors.text }]}>{user?.name}</Text>
              )}
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Email Address</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, color: colors.text }]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              ) : (
                <Text style={[styles.info, { color: colors.text }]}>{user?.email}</Text>
              )}
            </View>

            {isEditing && (
              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>New Password (Optional)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, color: colors.text }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter new password"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry
                />
              </View>
            )}

            {isEditing && (
              <Pressable
                onPress={handleUpdate}
                disabled={isLoading}
                style={[styles.updateButton, { backgroundColor: colors.tint }, isLoading && styles.disabled]}
              >
                <Text style={styles.updateButtonText}>
                  {isLoading ? "Updating..." : "Save Changes"}
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 16 }]}>Actions</Text>

          <Pressable style={styles.actionItem} onPress={handleLogout}>
            <View style={[styles.actionIcon, { backgroundColor: colors.surfaceSecondary }]}>
              <Ionicons name="log-out-outline" size={20} color={colors.text} />
            </View>
            <Text style={[styles.actionText, { color: colors.text }]}>Logout</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <Pressable style={styles.actionItem} onPress={handleDelete}>
            <View style={[styles.actionIcon, { backgroundColor: colors.error + "15" }]}>
              <Ionicons name="trash-outline" size={20} color={colors.error} />
            </View>
            <Text style={[styles.actionText, { color: colors.error }]}>Delete Account</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  avatarSection: {
    alignItems: "center",
    marginBottom: 30,
    marginTop: 10,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    // marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
  },
  userName: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontWeight: "500",
  },
  card: {
    borderRadius: 5,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  editLink: {
    fontSize: 14,
    fontWeight: "700",
  },
  form: {
    gap: 16,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  info: {
    fontSize: 16,
    fontWeight: "600",
  },
  input: {
    borderRadius: 5,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  updateButton: {
    borderRadius: 5,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  updateButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  disabled: { opacity: 0.6 },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  actionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 10,
  },
  emptyBody: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 18,
  },
  backAction: {
    borderRadius: 5,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  backActionText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
});
