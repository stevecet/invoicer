import { api } from "@/src/services/api";

export type CreateCheckoutSessionPayload = {
  invoiceId: string;
};

export type CreateCheckoutSessionResponse = {
  checkoutUrl: string;
};

export async function createCheckoutSession(payload: CreateCheckoutSessionPayload) {
  const response = await api.post<CreateCheckoutSessionResponse>(
    "/payments/create-checkout-session",
    payload
  );

  return response.data;
}
