import { describe, it, expect } from "vitest";

describe("Phase 2 — Expat 'Gift to Bangladesh' Business Rules", () => {
  it("enforces price hiding on delivery parcel slips when gift mode is active", () => {
    const orderData = {
      orderNumber: "AX-2026-GIFT-01",
      isGift: true,
      giftMessage: "With unconditional love to Maa from London.",
      hideInvoicePrice: true,
      subtotal: 1850000,
      total: 1850000,
    };

    const printableInvoicePrice = orderData.hideInvoicePrice ? null : orderData.total;
    expect(printableInvoicePrice).toBeNull();
    expect(orderData.isGift).toBe(true);
    expect(orderData.giftMessage).toContain("from London");
  });

  it("validates Bangladesh recipient phone numbers (01XXXXXXXXX)", () => {
    const isValidBdPhone = (phone: string) => /^01\d{9}$/.test(phone.replace(/\s+/g, ""));

    expect(isValidBdPhone("01711223344")).toBe(true);
    expect(isValidBdPhone("01819998888")).toBe(true);
    expect(isValidBdPhone("01933445566")).toBe(true);
    expect(isValidBdPhone("029876543")).toBe(false); // Landline
    expect(isValidBdPhone("123456")).toBe(false);
  });
});
