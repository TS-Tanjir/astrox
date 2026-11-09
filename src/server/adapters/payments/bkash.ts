import { PaymentMethod, PaymentStatus } from "@prisma/client";
import { PaymentProvider, PaymentInitiateResult, PaymentConfirmResult } from "./types";

export class BkashPaymentAdapter implements PaymentProvider {
  id = PaymentMethod.BKASH;

  async initiate(params: {
    orderNumber: string;
    amountPaisa: number;
    customerName: string;
    customerPhone: string;
    customerEmail?: string | null;
  }): Promise<PaymentInitiateResult> {
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const providerRef = `BK-PAY-${params.orderNumber}-${randomSuffix}`;

    return {
      providerRef,
      status: PaymentStatus.PENDING,
      requiresClientModal: true,
      modalType: "BKASH",
      message: "bKash checkout session initialized. Enter OTP and PIN to complete payment.",
    };
  }

  async confirm(payload: {
    orderNumber: string;
    providerRef: string;
    pinOrOtp?: string;
    rawPayload?: any;
  }): Promise<PaymentConfirmResult> {
    // In mock/sandbox mode: if pin is '0000' fail it, otherwise success
    if (payload.pinOrOtp === "0000") {
      return {
        status: "FAILED",
        providerRef: payload.providerRef,
        amountPaisa: 0,
        rawPayload: { error: "Invalid bKash PIN provided by patron" },
        message: "Payment failed: Incorrect PIN entered.",
      };
    }

    const randomTrx = "TRX-BK" + Math.floor(10000000 + Math.random() * 90000000);

    return {
      status: "PAID",
      providerRef: randomTrx,
      amountPaisa: payload.rawPayload?.amountPaisa || 0,
      rawPayload: {
        trxId: randomTrx,
        provider: "BKASH_MFS",
        verifiedAt: new Date().toISOString(),
        customerPhone: payload.rawPayload?.customerPhone || "017XXXXXXXX",
      },
      message: `bKash payment successful. Transaction ID: ${randomTrx}`,
    };
  }

  async refund(params: {
    providerRef: string;
    amountPaisa: number;
    reason?: string;
  }): Promise<{ success: boolean; refundRef: string }> {
    const refundRef = "RF-BK" + Math.floor(10000000 + Math.random() * 90000000);
    return { success: true, refundRef };
  }
}

export const bkashAdapter = new BkashPaymentAdapter();
