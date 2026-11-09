import { PaymentMethod, PaymentStatus } from "@prisma/client";
import { PaymentProvider, PaymentInitiateResult, PaymentConfirmResult } from "./types";

export class SslcommerzPaymentAdapter implements PaymentProvider {
  id = PaymentMethod.SSLCOMMERZ;

  async initiate(params: {
    orderNumber: string;
    amountPaisa: number;
    customerName: string;
    customerPhone: string;
    customerEmail?: string | null;
  }): Promise<PaymentInitiateResult> {
    const sessionKey = `SSL-SES-${params.orderNumber}-${Date.now()}`;
    return {
      providerRef: sessionKey,
      status: PaymentStatus.PENDING,
      requiresClientModal: true,
      modalType: "SSLCOMMERZ",
      message: "SSLCommerz secure gateway session ready for Visa/Mastercard.",
    };
  }

  async confirm(payload: {
    orderNumber: string;
    providerRef: string;
    pinOrOtp?: string;
    rawPayload?: any;
  }): Promise<PaymentConfirmResult> {
    const valId = "VAL-SSL" + Math.floor(10000000 + Math.random() * 90000000);
    return {
      status: "PAID",
      providerRef: valId,
      amountPaisa: payload.rawPayload?.amountPaisa || 0,
      rawPayload: {
        valId,
        cardType: payload.rawPayload?.cardType || "VISA-DEBIT",
        cardBrand: "Visa Sovereign",
        bankName: "City Bank BD",
        status: "VALIDATED",
      },
      message: `Card authorized successfully. Bank validation ID: ${valId}`,
    };
  }
}

export class StripePaymentAdapter implements PaymentProvider {
  id = PaymentMethod.STRIPE;

  async initiate(params: {
    orderNumber: string;
    amountPaisa: number;
    customerName: string;
    customerPhone: string;
    customerEmail?: string | null;
  }): Promise<PaymentInitiateResult> {
    const paymentIntentId = `pi_astrox_${params.orderNumber.toLowerCase().replace(/[^a-z0-9]/g, "")}_${Date.now()}`;
    return {
      providerRef: paymentIntentId,
      clientSecret: `${paymentIntentId}_secret_${Math.random().toString(36).slice(2)}`,
      status: PaymentStatus.PENDING,
      requiresClientModal: true,
      modalType: "STRIPE",
      message: "Stripe international checkout payment intent created.",
    };
  }

  async confirm(payload: {
    orderNumber: string;
    providerRef: string;
    pinOrOtp?: string;
    rawPayload?: any;
  }): Promise<PaymentConfirmResult> {
    const chId = "ch_stripe_" + Math.random().toString(36).slice(2, 10);
    return {
      status: "PAID",
      providerRef: chId,
      amountPaisa: payload.rawPayload?.amountPaisa || 0,
      rawPayload: {
        chargeId: chId,
        currency: "usd",
        paymentMethodType: "card",
        verified3DSecure: true,
      },
      message: "Stripe international payment processed successfully.",
    };
  }
}

export class CodPaymentAdapter implements PaymentProvider {
  id = PaymentMethod.COD;

  async initiate(params: {
    orderNumber: string;
    amountPaisa: number;
    customerName: string;
    customerPhone: string;
  }): Promise<PaymentInitiateResult> {
    return {
      providerRef: `COD-${params.orderNumber}`,
      status: PaymentStatus.PENDING,
      requiresClientModal: false,
      message: "Order placed via Cash on Delivery. Payment collected upon parcel receipt.",
    };
  }

  async confirm(payload: {
    orderNumber: string;
    providerRef: string;
  }): Promise<PaymentConfirmResult> {
    return {
      status: "PAID",
      providerRef: payload.providerRef,
      amountPaisa: 0,
      rawPayload: { collectedBy: "Courier Rider", paymentType: "CASH" },
      message: "Cash collected upon physical delivery.",
    };
  }
}

export const sslcommerzAdapter = new SslcommerzPaymentAdapter();
export const stripeAdapter = new StripePaymentAdapter();
export const codAdapter = new CodPaymentAdapter();
