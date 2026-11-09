import { describe, it, expect } from "vitest";
import {
  bkashAdapter,
  nagadAdapter,
  sslcommerzAdapter,
  stripeAdapter,
  codAdapter,
  getPaymentAdapter,
} from "../../src/server/adapters/payments";
import { PaymentMethod } from "@prisma/client";

describe("Phase 2 — Payment Adapters & Webhooks", () => {
  it("resolves the correct adapter for each PaymentMethod enum", () => {
    expect(getPaymentAdapter(PaymentMethod.BKASH)).toBe(bkashAdapter);
    expect(getPaymentAdapter(PaymentMethod.NAGAD)).toBe(nagadAdapter);
    expect(getPaymentAdapter(PaymentMethod.SSLCOMMERZ)).toBe(sslcommerzAdapter);
    expect(getPaymentAdapter(PaymentMethod.STRIPE)).toBe(stripeAdapter);
    expect(getPaymentAdapter(PaymentMethod.COD)).toBe(codAdapter);
  });

  describe("bKash Direct MFS Adapter", () => {
    it("initializes checkout and returns bKash modal requirement", async () => {
      const res = await bkashAdapter.initiate({
        orderNumber: "AX-2026-1042",
        amountPaisa: 1850000,
        customerName: "Farhan Ahmed",
        customerPhone: "01711223344",
      });

      expect(res.requiresClientModal).toBe(true);
      expect(res.modalType).toBe("BKASH");
      expect(res.providerRef).toContain("BK-PAY-AX-2026-1042");
    });

    it("confirms payment successfully with valid PIN and generates TRX-BK ID", async () => {
      const res = await bkashAdapter.confirm({
        orderNumber: "AX-2026-1042",
        providerRef: "BK-PAY-AX-2026-1042-9999",
        pinOrOtp: "12345",
        rawPayload: { amountPaisa: 1850000 },
      });

      expect(res.status).toBe("PAID");
      expect(res.providerRef).toMatch(/^TRX-BK\d+$/);
      expect(res.rawPayload.provider).toBe("BKASH_MFS");
    });

    it("fails authorization when PIN is 0000", async () => {
      const res = await bkashAdapter.confirm({
        orderNumber: "AX-2026-1042",
        providerRef: "BK-PAY-AX-2026-1042-9999",
        pinOrOtp: "0000",
      });

      expect(res.status).toBe("FAILED");
      expect(res.message).toContain("Incorrect PIN");
    });
  });

  describe("Nagad Digital Adapter", () => {
    it("confirms Nagad payment and generates TRX-NG transaction ref", async () => {
      const res = await nagadAdapter.confirm({
        orderNumber: "AX-2026-2001",
        providerRef: "NG-PAY-2001",
        pinOrOtp: "8888",
        rawPayload: { amountPaisa: 950000 },
      });

      expect(res.status).toBe("PAID");
      expect(res.providerRef).toMatch(/^TRX-NG\d+$/);
    });
  });

  describe("Stripe & International Card Adapter", () => {
    it("initializes Stripe payment intent with client secret", async () => {
      const res = await stripeAdapter.initiate({
        orderNumber: "AX-2026-GIFT-99",
        amountPaisa: 2500000,
        customerName: "London Expat Patron",
        customerPhone: "01812345678",
      });

      expect(res.clientSecret).toBeDefined();
      expect(res.providerRef).toContain("pi_astrox");
    });
  });
});
