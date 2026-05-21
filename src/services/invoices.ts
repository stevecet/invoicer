import { api } from "@/src/services/api";

export type InvoiceStatus = "paid" | "pending" | "overdue" | "draft";

export type Invoice = {
  _id: string;
  userId: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  currency: string;
  description: string;
  additionalNotes: string;
  items: { name: string; qty: number; price: number; total: number }[];
  status: InvoiceStatus;
  stripePaymentLink: string | null;
  issueDate: string | null;
  dueDate: string | null;
  paidAt: string | null;
  invoiceName: string;
  createdAt: string;
  updatedAt: string;
};

export async function getInvoices(): Promise<Invoice[]> {
  const response = await api.get<any>("/invoices");
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.data?.invoices)) return response.data.invoices;
  if (Array.isArray(response.data?.data)) return response.data.data;
  return [];
}

export async function getInvoiceById(
  invoiceId: string,
): Promise<Invoice | null> {
  const response = await api.get<any>(`/invoices/${invoiceId}`);
  if (response.data?.invoice) return response.data.invoice;
  if (response.data?.data) return response.data.data;
  return response.data;
}

export type CreateInvoicePayload = {
  clientName: string;
  clientEmail: string;
  amount: number;
  currency: string;
  description: string;
  dueDate: Date;
  additionalNotes: string;
  items: { name: string; qty: number; price: number; total: number }[];
  stripePaymentLink?: string | null;
  issueDate: Date;
  status?: InvoiceStatus;
};

export async function createInvoice(
  payload: CreateInvoicePayload,
): Promise<Invoice> {
  const serializedPayload = {
    ...payload,
  };
  const response = await api.post<Invoice>("/invoices", serializedPayload);
  return response.data;
}

export async function sendReminder(invoiceId: string): Promise<void> {
  await api.post("/notifications/reminders/send", { invoiceId });
}
