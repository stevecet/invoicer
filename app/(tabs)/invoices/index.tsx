import { useCallback, useEffect, useMemo, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  formatCurrency,
  formatDisplayDate,
} from "@/src/data/invoices";
import { getInvoices, type Invoice, type InvoiceStatus } from "@/src/services/invoices";
import AppBar from "@/src/components/AppBar";
import Skeleton from "@/src/components/Skeleton";
import { useTheme } from "@/src/hooks/useTheme";

type FilterOption = "all" | InvoiceStatus;

const FILTERS: { key: FilterOption; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "paid", label: "Paid" },
  { key: "overdue", label: "Overdue" },
];

export default function InvoiceListScreen() {
  const { colors, isDark } = useTheme();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterOption>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchInvoices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getInvoices();
      setInvoices(data);
    } catch {
      setError("Failed to load invoices. Pull down to retry.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchInvoices();
    }, [fetchInvoices])
  );

  const filteredInvoices = useMemo(() => {
    let result = invoices;

    if (activeFilter !== "all") {
      result = result.filter((inv) => inv.status === activeFilter);
    }

    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter(
        (inv) =>
          inv.clientName?.toLowerCase()?.includes(query) ||
          inv.clientEmail?.toLowerCase()?.includes(query) ||
          inv.description?.toLowerCase()?.includes(query) ||
          inv._id?.toLowerCase()?.includes(query)
      );
    }

    return result;
  }, [invoices, activeFilter, searchQuery]);

  if (isLoading) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <AppBar title="Invoices" />
        <View style={styles.content}>
          <View style={{ gap: 14 }}>
            <Skeleton height={140} />
            <Skeleton height={140} />
            <Skeleton height={140} />
            <Skeleton height={140} />
            <Skeleton height={140} />
          </View>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <AppBar title="Invoices" />
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          <Pressable onPress={fetchInvoices} style={[styles.retryButton, { backgroundColor: colors.tint }]}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <AppBar title="Invoices" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* Search bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
          <Ionicons
            name="search-outline"
            size={18}
            color={colors.textMuted}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by name, email or description..."
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          ) : null}
        </View>

        {/* Filter chips */}
        <View style={styles.filterRow}>
          {FILTERS.map((filter) => (
            <Pressable
              key={filter.key}
              onPress={() => setActiveFilter(filter.key)}
              style={[
                styles.filterChip,
                { backgroundColor: colors.surface },
                activeFilter === filter.key && { backgroundColor: colors.tint },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: colors.textSecondary },
                  activeFilter === filter.key && styles.filterTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Invoice list */}
        <View style={styles.list}>
          {filteredInvoices.length === 0 ? (
            <View style={styles.emptyList}>
              <Ionicons name="document-text-outline" size={40} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {searchQuery || activeFilter !== "all"
                  ? "No invoices match your search or filter."
                  : "No invoices yet."}
              </Text>
            </View>
          ) : (
            filteredInvoices.map((invoice) => (
              <Pressable
                key={invoice._id}
                onPress={() => router.push(`/(tabs)/invoices/${invoice._id}`)}
                style={[styles.invoiceCard, { backgroundColor: colors.surface }]}
              >
                <View style={styles.cardTopRow}>
                  <View style={styles.companyBlock}>
                    <Text style={[styles.clientName, { color: colors.text }]}>{invoice.clientName}</Text>
                    <Text style={[styles.clientEmail, { color: colors.textSecondary }]}>{invoice.clientEmail}</Text>
                  </View>
                  <View style={styles.cardTopRight}>
                    <Text style={[styles.amount, { color: colors.text }]}>
                      {formatCurrency(invoice.amount, invoice.currency)}
                    </Text>
                  </View>
                </View>
                {invoice.description ? (
                  <View style={[styles.cardFooter, styles.dueRow, { borderTopColor: colors.border }]}>
                    <View style={styles.dueRow}>
                      <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                      <Text style={[styles.dueText, { color: colors.textSecondary }]}>
                        Due {formatDisplayDate(invoice.dueDate)}
                      </Text>
                    </View>
                    <View style={[styles.statusPill, statusStyles[invoice.status]]}>
                      <Text
                        style={[styles.statusText, statusTextStyles[invoice.status]]}
                      >
                        {invoice.status}
                      </Text>
                    </View>
                  </View>
                ) : null}
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 100 },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  errorText: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    borderRadius: 5,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  hero: { marginBottom: 10 },
  overline: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 5,
    paddingHorizontal: 14,
    marginBottom: 14,
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  searchIcon: { marginRight: 10 },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 14,
  },
  // Filters
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 18,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 5,
  },
  filterText: { fontSize: 13, fontWeight: "700" },
  filterTextActive: { color: "#FFFFFF" },
  // List
  list: { gap: 14 },
  emptyList: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: { fontSize: 14, textAlign: "center" },
  invoiceCard: {
    borderRadius: 5,
    padding: 20,
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  companyBlock: { flex: 1 },
  cardTopRight: { alignItems: "flex-end", gap: 8 },
  clientName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  clientEmail: { fontSize: 13 },
  statusPill: {
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: "flex-start",
  },
  statusText: { fontSize: 12, fontWeight: "700", textTransform: "capitalize" },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  amount: { fontSize: 20, fontWeight: "800" },
  dueRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  dueText: { fontSize: 13, fontWeight: "600" },
  cardFooter: {
    borderTopWidth: 1,
    paddingTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  description: { fontSize: 13 },
});

const statusStyles = StyleSheet.create({
  paid: { backgroundColor: "#E7F7EE" },
  pending: { backgroundColor: "#FFF3D9" },
  overdue: { backgroundColor: "#FFE5DF" },
  draft: { backgroundColor: "#EEF2F6" },
});

const statusTextStyles = StyleSheet.create({
  paid: { color: "#1F8F5F" },
  pending: { color: "#B7791F" },
  overdue: { color: "#C24E32" },
  draft: { color: "#5F6B7A" },
});
