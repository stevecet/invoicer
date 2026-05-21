import { useCallback, useEffect, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuthStore } from "@/stores/auth-store";
import { getInvoices, type Invoice } from "@/src/services/invoices";
import {
  formatCurrency,
  getInvoiceMetrics,
  formatDisplayDate,
} from "@/src/data/invoices";
import AppBar from "@/src/components/AppBar";
import Skeleton from "@/src/components/Skeleton";
import { useTheme } from "@/src/hooks/useTheme";

export default function DashboardScreen() {
  const { colors, isDark } = useTheme();
  const user = useAuthStore((state) => state.user);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInvoices = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getInvoices();
      setInvoices(data);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchInvoices();
    }, [fetchInvoices])
  );

  const metrics = getInvoiceMetrics(invoices);
  const recentInvoices = invoices.slice(0, 4);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <AppBar title="Dashboard" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.heroCopy}>
            <Text style={[styles.title, { color: colors.text }]}>
              {user?.name ? `Welcome back, ${user.name}` : "Welcome back"}
            </Text>
          </View>
        </View>

        {isLoading ? (
          <View style={{ gap: 18 }}>
            <Skeleton height={180} />
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Skeleton height={100} style={{ flex: 1 }} />
              <Skeleton height={100} style={{ flex: 1 }} />
            </View>
            <View style={{ gap: 8, marginTop: 10 }}>
              <Skeleton width="40%" height={24} />
              <Skeleton width="60%" height={16} />
            </View>
            <View style={{ gap: 12 }}>
              <Skeleton height={80} />
              <Skeleton height={80} />
              <Skeleton height={80} />
            </View>
          </View>
        ) : (
          <>
            <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
              <View style={styles.summaryHeader}>
                <View>
                  <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>This month</Text>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>
                    {formatCurrency(metrics.total)}
                  </Text>
                </View>
              </View>

              <View style={[styles.summaryGrid, { borderTopColor: colors.border }]}>
                <View>
                  <Text style={[styles.summaryValue, { color: colors.text }]}>
                    {metrics.pendingCount}
                  </Text>
                  <Text style={[styles.summaryCaption, { color: colors.textSecondary }]}>Awaiting payment</Text>
                </View>
                <View>
                  <Text style={[styles.summaryValue, { color: colors.text }]}>
                    {metrics.overdueCount}
                  </Text>
                  <Text style={[styles.summaryCaption, { color: colors.textSecondary }]}>Overdue</Text>
                </View>
                <View>
                  <Text style={[styles.summaryValue, { color: colors.text }]}>
                    {metrics.draftCount}
                  </Text>
                  <Text style={[styles.summaryCaption, { color: colors.textSecondary }]}>Drafts</Text>
                </View>
              </View>
            </View>

            <View style={styles.grid}>
              <View style={[styles.miniCard, { backgroundColor: colors.surface }]}>
                <Text style={[styles.miniEyebrow, { color: colors.tint }]}>Outstanding</Text>
                <Text style={[styles.miniValue, { color: colors.text }]}>
                  {formatCurrency(metrics.pending + metrics.overdue)}
                </Text>
                <Text style={[styles.miniLabel, { color: colors.textSecondary }]}>Open invoice balance</Text>
              </View>
              <View style={[styles.miniCard, { backgroundColor: colors.surface }]}>
                <Text style={[styles.miniEyebrow, { color: colors.error }]}>Priority</Text>
                <Text style={[styles.miniValue, { color: colors.text }]}>{metrics.overdueCount}</Text>
                <Text style={[styles.miniLabel, { color: colors.textSecondary }]}>Invoices overdue now</Text>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <View style={styles.sectionCopy}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent invoices</Text>
                <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                  A quick snapshot of the latest billing activity.
                </Text>
              </View>
              <Pressable onPress={() => router.push("/(tabs)/invoices")}>
                <Text style={[styles.sectionLink, { color: colors.tint }]}>See all</Text>
              </Pressable>
            </View>

            <View style={styles.list}>
              {recentInvoices.map((invoice) => (
                <Pressable
                  key={invoice._id}
                  onPress={() =>
                    router.push(`/(tabs)/invoices/${invoice._id}`)
                  }
                  style={[styles.invoiceRow, { backgroundColor: colors.surface }]}
                >
                  <View style={styles.invoiceMeta}>
                    <Text style={[styles.invoiceClient, { color: colors.text }]}>
                      {invoice.clientName}
                    </Text>
                    <Text style={[styles.invoiceDate, { color: colors.textSecondary }]}>
                      Due {formatDisplayDate(invoice.dueDate)}
                    </Text>
                  </View>
                  <View style={styles.invoiceRight}>
                    <Text style={[styles.invoiceAmount, { color: colors.text }]}>
                      {formatCurrency(invoice.amount, invoice.currency)}
                    </Text>
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: invoice.status === "paid" ? colors.success : colors.warning }
                      ]}
                    />
                  </View>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 },
  hero: { marginBottom: 24 },
  heroCopy: { gap: 4 },
  title: { fontSize: 24, fontWeight: "800" },
  summaryCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  cardLabel: { fontSize: 13, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  cardTitle: { fontSize: 32, fontWeight: "800" },
  trendBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  trendText: { fontSize: 12, fontWeight: "800" },
  summaryGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    paddingTop: 20,
  },
  summaryValue: { fontSize: 18, fontWeight: "800", marginBottom: 2 },
  summaryCaption: { fontSize: 12, fontWeight: "600" },
  grid: { flexDirection: "row", gap: 16, marginBottom: 32 },
  miniCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  miniEyebrow: { fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 },
  miniValue: { fontSize: 18, fontWeight: "800", marginBottom: 4 },
  miniLabel: { fontSize: 12, fontWeight: "500" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 },
  sectionCopy: { flex: 1, gap: 4 },
  sectionTitle: { fontSize: 18, fontWeight: "800" },
  sectionSubtitle: { fontSize: 13, fontWeight: "500" },
  sectionLink: { fontSize: 14, fontWeight: "700" },
  list: { gap: 12 },
  invoiceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#0F172A",
    shadowOpacity: 0.03,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  invoiceMeta: { gap: 4 },
  invoiceClient: { fontSize: 15, fontWeight: "700" },
  invoiceDate: { fontSize: 12, fontWeight: "600" },
  invoiceRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  invoiceAmount: { fontSize: 16, fontWeight: "800" },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
});
