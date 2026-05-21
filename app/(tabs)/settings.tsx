import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Switch,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import PageHeader from "@/src/components/PageHeader";
import { useTheme } from "@/src/hooks/useTheme";
import { useSettingsStore } from "@/stores/settings-store";
import { useAuthStore } from "@/stores/auth-store";
import { getCurrencies, type Currency } from "@/src/services/currencies";

export default function SettingsScreen() {
  const { colors, isDark } = useTheme();
  const { setTheme, language, setLanguage, currency, setCurrency } = useSettingsStore();

  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);

  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isCurrenciesLoading, setIsCurrenciesLoading] = useState(false);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load currencies from the endpoint
  useEffect(() => {
    const fetchCurrencies = async () => {
      setIsCurrenciesLoading(true);
      const list = await getCurrencies();
      setCurrencies(list);
      setIsCurrenciesLoading(false);
    };
    fetchCurrencies();
  }, []);

  // Synchronize store settings with backend user profile on change
  useEffect(() => {
    if (user?.language && user.language !== language) {
      setLanguage(user.language as any);
    }
    if (user?.currency && user.currency !== currency) {
      setCurrency(user.currency);
    }
  }, [user]);

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  const handleLanguageChange = async (lang: "en" | "fr") => {
    if (language === lang) return;
    setLanguage(lang);
    setIsSaving(true);
    try {
      await updateProfile({ language: lang });
    } catch (error) {
      console.warn("Failed to sync language change to backend:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCurrencySelect = async (selectedCurrency: Currency) => {
    setCurrency(selectedCurrency.code);
    setIsCurrencyModalOpen(false);
    setIsSaving(true);
    try {
      const success = await updateProfile({ currency: selectedCurrency.code });
      if (!success) {
        Alert.alert("Warning", "Could not sync currency with your online profile, saved locally.");
      }
    } catch (error) {
      console.warn("Failed to sync currency change to backend:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const selectedCurrencyDetail = currencies.find((c) => c.code === currency) || {
    code: currency,
    name: "Default Currency",
    symbol: "$",
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <PageHeader title="Settings" />
      
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionIntro, { color: colors.textSecondary }]}>
          Manage your application preferences and regional settings.
        </Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.row}>
              <View style={styles.rowInfo}>
                <View style={[styles.iconBox, { backgroundColor: colors.surfaceSecondary }]}>
                  <Ionicons name="moon-outline" size={20} color={colors.text} />
                </View>
                <View>
                  <Text style={[styles.label, { color: colors.text }]}>Dark Mode</Text>
                  <Text style={[styles.value, { color: colors.textSecondary }]}>
                    {isDark ? "Enabled" : "Disabled"}
                  </Text>
                </View>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: colors.tint + "80" }}
                thumbColor={isDark ? colors.tint : "#f4f3f4"}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Localization</Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.row}>
              <View style={styles.rowInfo}>
                <View style={[styles.iconBox, { backgroundColor: colors.surfaceSecondary }]}>
                  <Ionicons name="language-outline" size={20} color={colors.text} />
                </View>
                <View>
                  <Text style={[styles.label, { color: colors.text }]}>Language</Text>
                  <Text style={[styles.value, { color: colors.textSecondary }]}>
                    {language === "en" ? "English" : "Français"}
                  </Text>
                </View>
              </View>
              <View style={[styles.pickerContainer, { backgroundColor: colors.surfaceSecondary }]}>
                <Pressable
                  onPress={() => handleLanguageChange("en")}
                  style={[
                    styles.pickerBtn,
                    language === "en" && { backgroundColor: colors.tint },
                  ]}
                >
                  <Text style={[styles.pickerText, language === "en" && { color: "#FFF" }]}>EN</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleLanguageChange("fr")}
                  style={[
                    styles.pickerBtn,
                    language === "fr" && { backgroundColor: colors.tint },
                  ]}
                >
                  <Text style={[styles.pickerText, language === "fr" && { color: "#FFF" }]}>FR</Text>
                </Pressable>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.row}>
              <View style={styles.rowInfo}>
                <View style={[styles.iconBox, { backgroundColor: colors.surfaceSecondary }]}>
                  <Ionicons name="cash-outline" size={20} color={colors.text} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: colors.text }]}>Default Currency</Text>
                  <Text style={[styles.value, { color: colors.textSecondary }]}>
                    {selectedCurrencyDetail.code} - {selectedCurrencyDetail.name} ({selectedCurrencyDetail.symbol})
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => setIsCurrencyModalOpen(true)}
                disabled={isCurrenciesLoading}
                style={styles.editActionContainer}
              >
                {isCurrenciesLoading ? (
                  <ActivityIndicator size="small" color={colors.tint} />
                ) : (
                  <Text style={[styles.editAction, { color: colors.tint }]}>Edit</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>

        {isSaving && (
          <View style={styles.savingBadge}>
            <ActivityIndicator size="small" color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.savingText}>Saving settings to profile...</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.row}>
              <Text style={[styles.label, { color: colors.text }]}>Version</Text>
              <Text style={[styles.value, { color: colors.textSecondary }]}>1.0.0</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modern bottom sheet currency selection modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isCurrencyModalOpen}
        onRequestClose={() => setIsCurrencyModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalDismiss} onPress={() => setIsCurrencyModalOpen(false)} />
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Default Currency</Text>
              <Pressable onPress={() => setIsCurrencyModalOpen(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
              {currencies.map((c) => {
                const isSelected = c.code === currency;
                return (
                  <Pressable
                    key={c._id}
                    onPress={() => handleCurrencySelect(c)}
                    style={({ pressed }) => [
                      styles.currencyRow,
                      { borderBottomColor: colors.border },
                      pressed && { backgroundColor: colors.surfaceSecondary },
                    ]}
                  >
                    <View style={[styles.symbolBadge, { backgroundColor: colors.tint + "15" }]}>
                      <Text style={[styles.symbolBadgeText, { color: colors.tint }]}>{c.symbol}</Text>
                    </View>
                    <View style={styles.currencyMeta}>
                      <Text style={[styles.currencyCode, { color: colors.text }]}>{c.code}</Text>
                      <Text style={[styles.currencyName, { color: colors.textSecondary }]}>{c.name}</Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark" size={22} color={colors.tint} />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  sectionIntro: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    borderRadius: 24,
    padding: 20,
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 48,
  },
  rowInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
  },
  value: {
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  pickerContainer: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 3,
  },
  pickerBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9,
  },
  pickerText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#667085",
  },
  editActionContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editAction: {
    fontSize: 14,
    fontWeight: "700",
  },
  savingBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1F2937",
    borderRadius: 12,
    paddingVertical: 8,
    marginBottom: 24,
  },
  savingText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    justifyContent: "flex-end",
  },
  modalDismiss: {
    flex: 1,
  },
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: "75%",
    paddingBottom: 40,
    shadowColor: "#0F172A",
    shadowOpacity: 0.15,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -12 },
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalList: {
    paddingHorizontal: 24,
  },
  currencyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  symbolBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  symbolBadgeText: {
    fontSize: 16,
    fontWeight: "800",
  },
  currencyMeta: {
    flex: 1,
    gap: 2,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: "700",
  },
  currencyName: {
    fontSize: 13,
  },
});
