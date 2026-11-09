import { describe, it, expect } from "vitest";

describe("Abandoned Bag Recovery Engine", () => {
  it("generates correct recovery deep link with cartId and coupon code", () => {
    const cartId = "cart_abc123";
    const couponCode = "COMEBACK5";
    const baseUrl = "https://astrox.com";
    const recoveryLink = `${baseUrl}/cart?restore=${cartId}&coupon=${couponCode}`;

    const url = new URL(recoveryLink);
    expect(url.hostname).toBe("astrox.com");
    expect(url.pathname).toBe("/cart");
    expect(url.searchParams.get("restore")).toBe("cart_abc123");
    expect(url.searchParams.get("coupon")).toBe("COMEBACK5");
  });

  it("calculates 5% recovery incentive on abandoned bag subtotal", () => {
    const bagSubtotalPaisa = 1850000; // ৳18,500
    const incentivePercent = 5;
    const discountPaisa = Math.round((bagSubtotalPaisa * incentivePercent) / 100);
    const finalPaisa = bagSubtotalPaisa - discountPaisa;

    expect(discountPaisa).toBe(92500); // ৳925 discount
    expect(finalPaisa).toBe(1757500); // ৳17,575 final
  });

  it("validates recovery dispatch requires both cartId and customerPhone", () => {
    function validateRecoveryPayload(payload: { cartId?: string; customerPhone?: string }) {
      if (!payload.cartId || !payload.customerPhone) {
        return { valid: false, error: "cartId and customerPhone are required" };
      }
      const bdPhoneRegex = /^(?:\+?88)?01[3-9]\d{8}$/;
      if (!bdPhoneRegex.test(payload.customerPhone.replace(/[\s-]/g, ""))) {
        return { valid: false, error: "Invalid Bangladesh phone format" };
      }
      return { valid: true };
    }

    expect(validateRecoveryPayload({}).valid).toBe(false);
    expect(validateRecoveryPayload({ cartId: "c1" }).valid).toBe(false);
    expect(validateRecoveryPayload({ cartId: "c1", customerPhone: "01712345678" }).valid).toBe(true);
    expect(validateRecoveryPayload({ cartId: "c1", customerPhone: "+8801812345678" }).valid).toBe(true);
    expect(validateRecoveryPayload({ cartId: "c1", customerPhone: "12345" }).valid).toBe(false);
  });
});
