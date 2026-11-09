import { PaymentMethod, PaymentStatus } from "@prisma/client";
import { PaymentProvider, PaymentInitiateResult, PaymentConfirmResult } from "./types";

export class NagadPaymentAdapter implements PaymentProvider {
  id = PaymentMethod.NAGAD;

  async initiate(params: {
    orderNumber: string;
    amountPaisa: number;
    customerName: string;
    customerPhone: string;
    customerEmail?: string | null;
  }): Promise<PaymentInitiateResult> {
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const providerRef = `NG-PAY-${params.orderNumber}-${randomSuffix}`;

    return {
      providerRef,
      status: PaymentStatus.PENDING,
      requiresClientModal: true,
      modalType: "NAGAD",
      message: "Nagad digital payment gateway initialized.",
    };
  }

  async confirm(payload: {
    orderNumber: string;
    providerRef: string;
    pinOrOtp?: string;
    rawPayload?: any;
  }): Promise<PaymentConfirmResult> {
    if (payload.pinOrOtp === "0000") {
      return {
        status: "FAILED",
        providerRef: payload.providerRef,
        amountPaisa: 0,
        rawPayload: { error: "Invalid Nagad secret PIN" },
        message: "Payment failed: Incorrect PIN entered.",
      };
    }

    const randomTrx = "TRX-NG" + Math.floor(10000000 + Math.random() * 90000000);

    return {
      status: "PAID",
      providerRef: randomTrx,
      amountPaisa: payload.rawPayload?.amountPaisa || 0,
      rawPayload: {
        trxId: randomTrx,
        provider: "NAGAD_POST_OFFICE",
        verifiedAt: new Date().toISOString(),
      },
      message: `Nagad payment completed. Transaction ID: ${randomTrx}`,
    };
  }

  async refund(params: {
    providerRef: string;
    amountPaisa: number;
    reason?: string;
  }): Promise<{ success: boolean; refundRef: string }> {
    const refundRef = "RF-NG" + Math.floor(10000000 + Math.random() * 90000000);
    return { success: true, refundRef };
  }
}

export const nagadAdapter = new NagadPaymentAdapter();
