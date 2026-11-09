import { PaymentMethod, PaymentStatus, Order } from "@prisma/client";

export interface PaymentInitiateResult {
  redirectUrl?: string;
  clientSecret?: string;
  providerRef: string;
  status: PaymentStatus;
  message?: string;
  requiresClientModal?: boolean;
  modalType?: "BKASH" | "NAGAD" | "SSLCOMMERZ" | "STRIPE";
}

export interface PaymentConfirmResult {
  status: "PAID" | "FAILED" | "CANCELLED";
  providerRef: string;
  amountPaisa: number;
  rawPayload: any;
  message?: string;
}

export interface PaymentProvider {
  id: PaymentMethod;
  initiate(params: {
    orderNumber: string;
    amountPaisa: number;
    customerName: string;
    customerPhone: string;
    customerEmail?: string | null;
  }): Promise<PaymentInitiateResult>;

  confirm(payload: {
    orderNumber: string;
    providerRef: string;
    pinOrOtp?: string;
    rawPayload?: any;
  }): Promise<PaymentConfirmResult>;

  refund?(params: {
    providerRef: string;
    amountPaisa: number;
    reason?: string;
  }): Promise<{ success: boolean; refundRef: string }>;
}
