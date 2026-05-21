import PageHeader from "@/src/components/PageHeader";
import { formatDisplayDate } from "@/src/data/invoices";
import { useTheme } from "@/src/hooks/useTheme";
import { createInvoice, type InvoiceStatus } from "@/src/services/invoices";
import { useSettingsStore } from "@/stores/settings-store";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { AxiosError } from "axios";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Button } from "react-native-paper";
import { getCurrencies, type Currency } from "@/src/services/currencies";

type InvoiceItem = {
  id: string;
  name: string;
  price: string;
  qty: string;
  total: number;
};

export default function CreateInvoiceScreen() {
  const { colors, isDark } = useTheme();
  const defaultCurrency = useSettingsStore((state) => state.currency);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [currency, setCurrency] = useState(defaultCurrency || "USD");
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [description, setDescription] = useState("");

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const list = await getCurrencies();
        setCurrencies(list);
      } catch (err) {
        console.error("Error fetching currencies in create screen:", err);
      }
    };
    fetchCurrencies();
  }, []);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [dueDate, setDueDate] = useState(new Date());
  const [openDueDate, setOpenDueDate] = useState(false);
  const [issueDate, setIssueDate] = useState(new Date());
  const [openIssueDate, setOpenIssueDate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [items, setItems] = useState<InvoiceItem[]>([
    { id: "item-1", name: "", price: "", qty: "1", total: 0 },
  ]);

  const itemsTotal = useMemo(
    () => items.reduce((sum, item) => sum + item.total, 0),
    [items]
  );

  const amount = itemsTotal.toFixed(2);

  const allItemsValid =
    items.length > 0 &&
    items.every(
      (item) =>
        item.name.trim() &&
        Number.parseFloat(item.price) > 0 &&
        Number.parseInt(item.qty, 10) > 0
    );

  const isValid =
    clientName.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail) &&
    allItemsValid &&
    dueDate &&
    issueDate &&
    !isSubmitting;

  const updateItem = (index: number, field: keyof InvoiceItem, value: string) => {
    setItems((current) => {
      const next = [...current];
      next[index] = { ...next[index], [field]: value };

      if (field === "price" || field === "qty") {
        const price = Number.parseFloat(next[index].price) || 0;
        const qty = Number.parseInt(next[index].qty, 10) || 0;
        next[index].total = price * qty;
      }

      return next;
    });
  };

  const addItem = () => {
    setItems((current) => [
      ...current,
      {
        id: `item-${Date.now()}`,
        name: "",
        price: "",
        qty: "1",
        total: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    setItems((current) => current.filter((_, i) => i !== index));
  };

  const onIssueDateChange = (event: DateTimePickerEvent, date?: Date) => {
    setOpenIssueDate(false);
    // On Android, if the user dismisses the picker, date is undefined
    if (date) setIssueDate(date);
  };

  const onDueDateChange = (event: DateTimePickerEvent, date?: Date) => {
    setOpenDueDate(false);
    if (date) setDueDate(date);
  };

  const handleSubmit = async (status: InvoiceStatus = "pending") => {
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      await createInvoice({
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim(),
        amount: itemsTotal,
        currency: currency || "USD",
        description: description.trim(),
        additionalNotes: additionalNotes.trim(),
        items: items.map((item) => ({
          name: item.name.trim(),
          price: Number.parseFloat(item.price),
          qty: Number.parseInt(item.qty, 10),
          total: item.total,
        })),
        dueDate, // TypeScript expects Date, which these are
        issueDate,
        status,
        stripePaymentLink: "",
      });

      Alert.alert(
        "Success",
        `Invoice saved as ${status === "draft" ? "draft" : "pending"} successfully!`,
        [
          {
            text: "OK",
            onPress: () => {
              setClientName("");
              setClientEmail("");
              setCurrency(defaultCurrency || "USD");
              setDescription("");
              setAdditionalNotes("");
              setDueDate(new Date());
              setIssueDate(new Date());
              setItems([{ id: "item-1", name: "", price: "", qty: "1", total: 0 }]);
              router.replace("/(tabs)/invoices");
            },
          },
        ]
      );
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? error.response?.data?.message ?? error.message
          : "Something went wrong. Please try again.";
      Alert.alert("Error", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      <PageHeader title="New Invoice" onBack={() => router.replace("/(tabs)")} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Client details
            </Text>
            <Pressable
              disabled={!isValid}
              onPress={() => setIsPreviewOpen(true)}
              style={({ pressed }) => [
                styles.previewLink,
                { opacity: pressed || !isValid ? 0.6 : 1 },
              ]}
            >
              <Ionicons name="eye-outline" size={16} color={colors.tint} />
              <Text style={[styles.previewLinkText, { color: colors.tint }]}>
                Preview
              </Text>
            </Pressable>
          </View>

          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Client name *
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surfaceSecondary,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={clientName}
            onChangeText={setClientName}
            placeholder="e.g. John Doe"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="words"
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Client email *
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surfaceSecondary,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={clientEmail}
            onChangeText={setClientEmail}
            placeholder="e.g. john@example.com"
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Invoice details
          </Text>

          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Items *
          </Text>
          {items.map((item, index) => (
            <View key={item.id} style={styles.itemCard}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surfaceSecondary,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                value={item.name}
                onChangeText={(text) => updateItem(index, "name", text)}
                placeholder="Item name"
                placeholderTextColor={colors.textMuted}
              />
              <View style={styles.splitRow}>
                <TextInput
                  style={[
                    styles.input,
                    styles.itemInput,
                    {
                      backgroundColor: colors.surfaceSecondary,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  value={item.price}
                  onChangeText={(text) => updateItem(index, "price", text)}
                  placeholder="Price"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="decimal-pad"
                />
                <TextInput
                  style={[
                    styles.input,
                    styles.itemInput,
                    {
                      backgroundColor: colors.surfaceSecondary,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  value={item.qty}
                  onChangeText={(text) => updateItem(index, "qty", text)}
                  placeholder="Qty"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                />
                <View
                  style={[
                    styles.itemTotal,
                    {
                      backgroundColor: colors.surfaceSecondary,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.itemTotalText,
                      { color: colors.text },
                    ]}
                  >
                    {Number(item.total)}
                  </Text>
                </View>
                {items.length > 1 ? (
                  <Pressable
                    onPress={() => removeItem(index)}
                    style={styles.removeItemButton}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={20}
                      color={colors.textSecondary}
                    />
                  </Pressable>
                ) : null}
              </View>
            </View>
          ))}

          <Button
            style={[
              styles.addItemButton,
              { backgroundColor: colors.tint, marginBottom: 16 },
            ]}
            mode="contained"
            onPress={addItem}
          >
            Add item
          </Button>

          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Currency
          </Text>
          <Pressable
            onPress={() => setIsCurrencyModalOpen(true)}
            style={[
              styles.currencySelector,
              {
                backgroundColor: colors.surfaceSecondary,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.currencySelectorText, { color: colors.text }]}>
              {currency}
            </Text>
            <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
          </Pressable>

          <View style={[styles.totalsRow, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
            <Text style={[styles.totalsLabel, { color: colors.textSecondary }]}>Total amount</Text>
            <Text style={[styles.totalsValue, { color: colors.text }]}>
              {currency} {amount}
            </Text>
          </View>

          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Description
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              {
                backgroundColor: colors.surfaceSecondary,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="What is this invoice for?"
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Additional notes
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              {
                backgroundColor: colors.surfaceSecondary,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={additionalNotes}
            onChangeText={setAdditionalNotes}
            placeholder="Thank you for your business."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <View style={styles.row}>
            <View style={styles.flex}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Issue Date</Text>
              <Button
                style={{ borderRadius: 5, backgroundColor: colors.surfaceSecondary }}
                labelStyle={{ color: colors.text }}
                mode="contained"
                onPress={() => setOpenIssueDate(true)}
                icon="calendar-outline"
              >
                {formatDisplayDate(issueDate.toISOString())}
              </Button>
              {openIssueDate && (
                <DateTimePicker
                  value={issueDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onIssueDateChange}
                />
              )}
            </View>
            <View style={styles.flex}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Due Date</Text>
              <Button
                style={{ borderRadius: 5, backgroundColor: colors.surfaceSecondary }}
                labelStyle={{ color: colors.text }}
                mode="contained"
                onPress={() => setOpenDueDate(true)}
                icon="calendar-outline"
              >
                {formatDisplayDate(dueDate.toISOString())}
              </Button>
              {openDueDate && (
                <DateTimePicker
                  value={dueDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onDueDateChange}
                />
              )}
            </View>
          </View>
        </View>

        <View style={[styles.row, { paddingBottom: 20 }]}>
          <View style={styles.flex}>
            <Button
              style={{ borderRadius: 5, borderColor: colors.tint }}
              mode="outlined"
              onPress={() => handleSubmit("draft")}
              disabled={!clientName.trim() || isSubmitting}
            >
              {isSubmitting ? "..." : "Save Draft"}
            </Button>
          </View>
          <View style={styles.flex}>
            <Button
              style={{ borderRadius: 5, backgroundColor: colors.tint }}
              mode="contained"
              onPress={() => handleSubmit("pending")}
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send Invoice"}
            </Button>
          </View>
        </View>
      </ScrollView>

      {/* Sliding bottom sheet currency selection modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isCurrencyModalOpen}
        onRequestClose={() => setIsCurrencyModalOpen(false)}
      >
        <View
          style={[
            styles.modalOverlay,
            {
              backgroundColor: isDark
                ? "rgba(0,0,0,0.85)"
                : "rgba(15, 23, 42, 0.4)",
            },
          ]}
        >
          <Pressable style={styles.modalDismiss} onPress={() => setIsCurrencyModalOpen(false)} />
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Currency</Text>
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
                    onPress={() => {
                      setCurrency(c.symbol);
                      setIsCurrencyModalOpen(false);
                    }}
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

      <Modal
        animationType="slide"
        transparent={true}
        visible={isPreviewOpen}
        onRequestClose={() => setIsPreviewOpen(false)}
      >
        <View
          style={[
            styles.modalOverlay,
            {
              backgroundColor: isDark
                ? "rgba(0,0,0,0.85)"
                : "rgba(15, 23, 42, 0.4)",
            },
          ]}
        >
          <View
            style={[styles.previewCard, { backgroundColor: colors.surface }]}
          >
            <View style={styles.previewHeader}>
              <Text style={[styles.previewTitle, { color: colors.text }]}>
                Interactive Preview
              </Text>
              <Pressable onPress={() => setIsPreviewOpen(false)}>
                <Ionicons
                  name="close"
                  size={24}
                  color={colors.textSecondary}
                />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View
                style={[styles.previewContent, { backgroundColor: colors.surfaceSecondary }]}
              >
                <View style={styles.previewRow}>
                  <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>
                    CLIENT NAME
                  </Text>
                  <TextInput
                    style={[styles.previewInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                    value={clientName}
                    onChangeText={setClientName}
                    placeholder="Client Name"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
                <View style={styles.previewRow}>
                  <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>
                    CLIENT EMAIL
                  </Text>
                  <TextInput
                    style={[styles.previewInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                    value={clientEmail}
                    onChangeText={setClientEmail}
                    placeholder="Client Email"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                <View style={[styles.previewDivider, { backgroundColor: colors.border }]} />
                <View style={styles.previewRow}>
                  <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>
                    TOTAL AMOUNT
                  </Text>
                  <Text style={[styles.previewAmount, { color: colors.tint }]}>
                    {currency} {amount}
                  </Text>
                </View>
                <View style={styles.previewRow}>
                  <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>
                    DUE DATE
                  </Text>
                  <Text style={[styles.previewValue, { color: colors.text }]}>
                    {formatDisplayDate(dueDate.toISOString())}
                  </Text>
                </View>
                <View style={[styles.previewDivider, { backgroundColor: colors.border }]} />

                <Text style={[styles.previewLabel, { color: colors.textSecondary, marginBottom: 4 }]}>
                  INVOICE ITEMS
                </Text>
                {items.map((item, index) => (
                  <View key={item.id} style={styles.previewItemBlock}>
                    <View style={styles.previewItemHeader}>
                      <TextInput
                        style={[styles.previewItemInputName, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                        value={item.name}
                        onChangeText={(text) => updateItem(index, "name", text)}
                        placeholder="Item name"
                        placeholderTextColor={colors.textMuted}
                      />
                      {items.length > 1 && (
                        <Pressable onPress={() => removeItem(index)} style={styles.previewItemDelete}>
                          <Ionicons name="trash-outline" size={16} color={colors.error} />
                        </Pressable>
                      )}
                    </View>
                    <View style={styles.previewItemRow}>
                      <View style={styles.previewItemQtyWrap}>
                        <Text style={[styles.previewSubLabel, { color: colors.textSecondary }]}>QTY</Text>
                        <TextInput
                          style={[styles.previewItemInputSmall, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                          value={item.qty}
                          onChangeText={(text) => updateItem(index, "qty", text)}
                          keyboardType="number-pad"
                        />
                      </View>
                      <View style={styles.previewItemPriceWrap}>
                        <Text style={[styles.previewSubLabel, { color: colors.textSecondary }]}>PRICE (${currency})</Text>
                        <TextInput
                          style={[styles.previewItemInputSmall, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                          value={item.price}
                          onChangeText={(text) => updateItem(index, "price", text)}
                          keyboardType="decimal-pad"
                          placeholder="0.00"
                          placeholderTextColor={colors.textMuted}
                        />
                      </View>
                      <View style={styles.previewItemTotalWrap}>
                        <Text style={[styles.previewSubLabel, { color: colors.textSecondary }]}>TOTAL</Text>
                        <Text style={[styles.previewItemTotalText, { color: colors.text }]}>
                          {Number(item.total).toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}

                <View style={[styles.previewDivider, { backgroundColor: colors.border }]} />
                <View style={styles.previewRow}>
                  <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>
                    DESCRIPTION
                  </Text>
                  <TextInput
                    style={[styles.previewInput, styles.previewInputMultiline, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Add description..."
                    placeholderTextColor={colors.textMuted}
                    multiline
                  />
                </View>

                <View style={[styles.previewDivider, { backgroundColor: colors.border }]} />
                <View style={styles.previewRow}>
                  <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>
                    ADDITIONAL NOTES
                  </Text>
                  <TextInput
                    style={[styles.previewInput, styles.previewInputMultiline, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                    value={additionalNotes}
                    onChangeText={setAdditionalNotes}
                    placeholder="Add notes..."
                    placeholderTextColor={colors.textMuted}
                    multiline
                  />
                </View>
              </View>

              <Text style={[styles.previewNotice, { color: colors.textMuted }]}>
                Edits made in this preview instantly sync to your invoice form.
              </Text>
            </ScrollView>

            <View style={styles.previewActionsContainer}>
              <View style={styles.previewActionsRow}>
                <Pressable
                  disabled={!clientName.trim() || isSubmitting}
                  onPress={async () => {
                    setIsPreviewOpen(false);
                    await handleSubmit("draft");
                  }}
                  style={[
                    styles.previewActionButton,
                    { borderColor: colors.tint, borderWidth: 1.5 },
                    (!clientName.trim() || isSubmitting) && { opacity: 0.5 }
                  ]}
                >
                  <Ionicons name="document-text-outline" size={16} color={colors.tint} />
                  <Text style={[styles.previewActionButtonText, { color: colors.tint }]}>
                    Save Draft
                  </Text>
                </Pressable>

                <Pressable
                  disabled={!isValid || isSubmitting}
                  onPress={async () => {
                    setIsPreviewOpen(false);
                    await handleSubmit("pending");
                  }}
                  style={[
                    styles.previewActionButton,
                    { backgroundColor: colors.tint },
                    (!isValid || isSubmitting) && { opacity: 0.5 }
                  ]}
                >
                  <Ionicons name="paper-plane-outline" size={16} color="#FFFFFF" />
                  <Text style={[styles.previewActionButtonText, { color: "#FFFFFF" }]}>
                    Send Invoice
                  </Text>
                </Pressable>
              </View>

              <Pressable
                onPress={() => setIsPreviewOpen(false)}
                style={[styles.closePreviewButton, { backgroundColor: colors.surfaceSecondary }]}
              >
                <Text style={[styles.closePreviewText, { color: colors.text }]}>
                  Keep Editing
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { flex: 1 },
  content: { paddingHorizontal: 10, paddingTop: 12, paddingBottom: 40 },
  card: {
    borderRadius: 5,
    padding: 20,
    marginBottom: 16,
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
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
  },
  previewLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: 4,
  },
  previewLinkText: {
    fontSize: 13,
    fontWeight: "700",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    borderRadius: 5,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 16,
  },
  textArea: { minHeight: 80 },
  row: { flexDirection: "row", gap: 12 },
  splitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  flex: { flex: 1 },
  buttonStack: { gap: 12, marginTop: 10 },
  submitButton: {
    borderRadius: 5,
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  draftButton: {
    borderRadius: 5,
    minHeight: 56,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  submitButtonDisabled: { opacity: 0.5 },
  submitButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  draftButtonText: { fontSize: 16, fontWeight: "700" },

  itemCard: { marginBottom: 12 },
  itemInput: { flex: 1 },
  itemTotal: {
    marginBottom: 16,
    borderRadius: 5,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minWidth: 90,
    justifyContent: "center",
  },
  itemTotalText: { fontSize: 15, fontWeight: "700", textAlign: "center" },
  removeItemButton: {
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  addItemButton: { borderRadius: 5 },
  amountDisplay: { fontSize: 18, fontWeight: "700" },

  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  previewCard: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  previewContent: {
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  previewRow: {
    gap: 4,
  },
  previewLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  previewValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  previewAmount: {
    fontSize: 28,
    fontWeight: "900",
  },
  previewDivider: {
    height: 1,
    marginVertical: 4,
  },
  previewNotice: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 20,
    lineHeight: 18,
  },
  closePreviewButton: {
    marginTop: 24,
    borderRadius: 999,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  closePreviewText: {
    fontSize: 15,
    fontWeight: "700",
  },
  previewInput: {
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 15,
    fontWeight: "600",
    borderWidth: 1,
  },
  previewInputMultiline: {
    minHeight: 60,
    textAlignVertical: "top",
  },
  previewItemBlock: {
    gap: 8,
    marginBottom: 12,
  },
  previewItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  previewItemInputName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
  },
  previewItemDelete: {
    padding: 4,
  },
  previewItemRow: {
    flexDirection: "row",
    gap: 10,
  },
  previewItemQtyWrap: {
    width: 50,
    gap: 4,
  },
  previewItemPriceWrap: {
    flex: 1,
    gap: 4,
  },
  previewItemTotalWrap: {
    width: 90,
    gap: 4,
    alignItems: "flex-end",
  },
  previewSubLabel: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  previewItemInputSmall: {
    fontSize: 13,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    textAlign: "center",
  },
  previewItemTotalText: {
    fontSize: 13,
    fontWeight: "700",
    marginTop: 8,
  },
  previewActionsContainer: {
    marginTop: 18,
    gap: 10,
  },
  previewActionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  previewActionButton: {
    flex: 1,
    height: 48,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  previewActionButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
  currencySelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 5,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  currencySelectorText: {
    fontSize: 15,
    fontWeight: "700",
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginVertical: 16,
  },
  totalsLabel: {
    fontSize: 15,
    fontWeight: "700",
  },
  totalsValue: {
    fontSize: 20,
    fontWeight: "900",
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
