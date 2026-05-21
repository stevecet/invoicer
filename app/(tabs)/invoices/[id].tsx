import { useCallback, useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as WebBrowser from "expo-web-browser";
import { Ionicons } from "@expo/vector-icons";
import { AxiosError } from "axios";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Share,
} from "react-native";
import { formatCurrency, formatDisplayDate } from "@/src/data/invoices";
import { getInvoiceById, sendReminder, type Invoice } from "@/src/services/invoices";
import { createCheckoutSession } from "@/src/services/payments";
import Skeleton from "@/src/components/Skeleton";
import { useTheme } from "@/src/hooks/useTheme";
import AppBar from "@/src/components/AppBar";
import PageHeader from "@/src/components/PageHeader";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { generateInvoiceHtml } from "@/src/utils/pdfGenerator";

function getErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    return error.response?.data?.message ?? error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Unable to open the payment link right now.";
}

export default function InvoiceDetailsScreen() {
  const { colors, isDark } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isOpeningPayment, setIsOpeningPayment] = useState(false);
  const [isSendingReminder, setIsSendingReminder] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoice = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await getInvoiceById(id);
      setInvoice(data);
    } catch {
      setFetchError("Failed to load invoice details.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  const handleOpenPaymentLink = async () => {
    if (!invoice) return;
    setIsOpeningPayment(true);
    setError(null);
    try {
      const response = await createCheckoutSession({ invoiceId: invoice._id });
      setCheckoutUrl(response.checkoutUrl);
      await WebBrowser.openBrowserAsync(response.checkoutUrl);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsOpeningPayment(false);
    }
  };

  const handleShare = async () => {
    if (!invoice) return;
    setIsSharing(true);
    try {
      const htmlContent = generateInvoiceHtml(invoice);
      const { uri } = await Print.printToFileAsync({ html: htmlContent });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: `Share Invoice #${invoice._id.slice(-8).toUpperCase()}`,
          UTI: "com.adobe.pdf",
        });
      } else {
        Alert.alert("Sharing not available", "Sharing is not supported on this device.");
      }
    } catch (shareError) {
      console.error("Error generating/sharing PDF:", shareError);
      Alert.alert("Error", "Failed to generate or share the PDF invoice.");
    } finally {
      setIsSharing(false);
    }
  };

  const handleSendReminder = async () => {
    if (!invoice) return;
    setIsSendingReminder(true);
    try {
      await sendReminder(invoice._id);
      Alert.alert("Success", "Reminder sent successfully!");
    } catch (reminderError) {
      const message = reminderError instanceof AxiosError ? reminderError.response?.data?.message ?? reminderError.message : "Failed to send reminder.";
      Alert.alert("Error", message);
    } finally {
      setIsSendingReminder(false);
    }
  };

  if (isLoading) {
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

  if (fetchError || !invoice) {
    return (
      <View style={[styles.emptyState, { backgroundColor: colors.background }]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          {fetchError ?? "Invoice not found"}
        </Text>
        <Text style={[styles.emptyBody, { color: colors.textSecondary }]}>
          We couldn&apos;t find the invoice details for this record.
        </Text>
        <Pressable onPress={() => router.replace("/(tabs)")} style={[styles.backAction, { backgroundColor: colors.tint }]}>
          <Text style={styles.backActionText}>Back to dashboard</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      <PageHeader title="Invoice Details" onBack={() => router.replace("/(tabs)")} />

      <View style={[styles.heroCard, { backgroundColor: colors.surface }]}>
        <View style={styles.heroTopRow}>
          <View>
            <Text style={[styles.overline, { color: colors.tint }]}>Invoice details</Text>
          </View>
          <View style={[styles.statusPill, invoice?.status ? statusStyles[invoice.status] : null]}>
            <Text
              style={[styles.statusText, invoice?.status ? statusTextStyles[invoice.status] : null]}
            >
              {invoice?.status}
            </Text>
          </View>
        </View>

        <Text style={[styles.clientName, { color: colors.text }]}>{invoice?.clientName}</Text>
        <Text style={[styles.clientEmail, { color: colors.textSecondary }]}>{invoice?.clientEmail}</Text>
        <Text style={[styles.amount, { color: colors.text }]}>
          {formatCurrency(invoice?.amount || 0, invoice?.currency)}
        </Text>

        {invoice?.description ? (
          <Text style={[styles.description, { color: colors.textSecondary }]}>{invoice.description}</Text>
        ) : null}

        <View style={styles.dateGrid}>
          <View style={[styles.dateCard, { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>Created</Text>
            <Text style={[styles.dateValue, { color: colors.text }]}>
              {formatDisplayDate(invoice?.createdAt || "")}
            </Text>
          </View>
          <View style={[styles.dateCard, { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>Due date</Text>
            <Text style={[styles.dateValue, { color: colors.text }]}>
              {formatDisplayDate(invoice?.dueDate || "")}
            </Text>
          </View>
        </View>

        {invoice?.paidAt ? (
          <View style={[styles.paidAtRow, { backgroundColor: isDark ? colors.success + "15" : "#E7F7EE" }]}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            <Text style={[styles.paidAtText, { color: colors.success }]}>
              Paid on {formatDisplayDate(invoice.paidAt)}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.actionRow}>
        <Pressable
          onPress={handleSendReminder}
          disabled={isSendingReminder || invoice.status === 'paid'}
          style={[
            styles.secondaryButton,
            { borderColor: colors.border, flex: 1 },
            (isSendingReminder || invoice.status === 'paid') && { opacity: 0.5 }
          ]}
        >
          <Ionicons name="notifications-outline" size={18} color={colors.text} />
          <Text numberOfLines={1} style={[styles.secondaryButtonText, { color: colors.text }]}>
            {isSendingReminder ? "Sending..." : "Send Reminder"}
          </Text>
        </Pressable>

        <Pressable
          onPress={handleShare}
          disabled={isSharing}
          style={[
            styles.secondaryButton,
            { borderColor: colors.border, flex: 1 },
            isSharing && { opacity: 0.5 }
          ]}
        >
          <Ionicons name="share-outline" size={18} color={colors.text} />
          <Text numberOfLines={1} style={[styles.secondaryButtonText, { color: colors.text }]}>
            {isSharing ? "Sharing..." : "Share PDF"}
          </Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Invoice details</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, padding: 0 }]}>
          {invoice.items?.map((item, index) => (
            <View
              key={index}
              style={[
                styles.itemRow,
                index !== 0 && { borderTopWidth: 1, borderTopColor: colors.border }
              ]}
            >
              <View style={styles.flex}>
                <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.itemDetail, { color: colors.textSecondary }]}>
                  {item.qty} x {formatCurrency(item.price, invoice.currency)}
                </Text>
              </View>
              <Text style={[styles.itemTotal, { color: colors.text }]}>
                {formatCurrency(item.total, invoice.currency)}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment</Text>
        <View style={[styles.paymentCard, { backgroundColor: colors.surfaceTertiary }]}>
          <Text style={[styles.paymentTitle, { color: colors.text }]}>Stripe checkout session</Text>
          <Text style={[styles.paymentBody, { color: colors.textSecondary }]}>
            Generate the checkout session from the backend, then open the
            returned payment link in the browser.
          </Text>
          {error ? <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text> : null}

          <Pressable
            disabled={isOpeningPayment || invoice.status === 'paid'}
            onPress={handleOpenPaymentLink}
            style={[
              styles.paymentButton,
              { backgroundColor: colors.tint },
              (isOpeningPayment || invoice.status === 'paid') ? styles.paymentButtonDisabled : null,
            ]}
          >
            <Ionicons name="open-outline" size={18} color="#FFFFFF" />
            <Text style={styles.paymentButtonText}>
              {isOpeningPayment ? "Opening payment..." : "Open Payment Link"}
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 32 },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  iconAction: {
    width: 40,
    height: 40,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: { fontSize: 15, fontWeight: "600" },
  heroCard: {
    borderRadius: 5,
    padding: 22,
    marginBottom: 16,
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 14,
  },
  overline: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  title: { fontSize: 24, fontWeight: "800" },
  statusPill: { borderRadius: 5, paddingHorizontal: 12, paddingVertical: 6 },
  statusText: { fontSize: 12, fontWeight: "700", textTransform: "capitalize" },
  clientName: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  clientEmail: { fontSize: 14, marginBottom: 18 },
  amount: {
    fontSize: 36,
    fontWeight: "800",
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 18,
  },
  dateGrid: { flexDirection: "row", gap: 12 },
  dateCard: {
    flex: 1,
    borderRadius: 5,
    padding: 16,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  dateValue: { fontSize: 15, fontWeight: "700" },
  paidAtRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
    borderRadius: 5,
    padding: 12,
  },
  paidAtText: { fontSize: 13, fontWeight: "600" },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  itemName: { fontSize: 15, fontWeight: "700", marginBottom: 2 },
  itemDetail: { fontSize: 13, fontWeight: "500" },
  itemTotal: { fontSize: 15, fontWeight: "800" },

  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 5,
    borderWidth: 1
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
  },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 12,
  },
  flex: { flex: 1 },
  card: {
    borderRadius: 5,
    padding: 22,
    marginBottom: 16,
  },
  paymentCard: { borderRadius: 5, padding: 20 },
  paymentTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
  },
  paymentBody: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 16,
  },
  checkoutUrl: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 10,
  },
  paymentButton: {
    borderRadius: 5,
    minHeight: 54,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  paymentButtonDisabled: { opacity: 0.9, backgroundColor: "#A0AEC0" },
  paymentButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
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
