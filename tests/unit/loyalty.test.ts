import { describe, it, expect } from "vitest";
import {
  calculateStarsEarned,
  getTierFromPoints,
  calculateStarsDiscountPaisa,
  TIER_CONFIG,
} from "../../src/server/services/loyalty";

describe("Phase 3 — Astrox Stars Loyalty Engine", () => {
  describe("Tier Progression", () => {
    it("assigns NOVA for under 1,000 points", () => {
      expect(getTierFromPoints(0)).toBe("NOVA");
      expect(getTierFromPoints(999)).toBe("NOVA");
    });

    it("elevates to STELLAR at 1,000 points", () => {
      expect(getTierFromPoints(1000)).toBe("STELLAR");
      expect(getTierFromPoints(4999)).toBe("STELLAR");
    });

    it("elevates to GALAXY Sovereign at 5,000+ points", () => {
      expect(getTierFromPoints(5000)).toBe("GALAXY");
      expect(getTierFromPoints(15000)).toBe("GALAXY");
    });
  });

  describe("Stars Calculation & Multipliers", () => {
    it("awards 1 Star per ৳100 spent for Nova patrons", () => {
      // ৳10,000 spent = 1,000,000 paisa -> 100 stars
      const stars = calculateStarsEarned(1000000, "NOVA");
      expect(stars).toBe(100);
    });

    it("awards 1.5x Stars for Stellar tier", () => {
      // ৳10,000 spent = 100 base stars * 1.5 = 150 stars
      const stars = calculateStarsEarned(1000000, "STELLAR");
      expect(stars).toBe(150);
    });

    it("awards 2.0x Stars for Galaxy Sovereigns", () => {
      // ৳10,000 spent = 100 base stars * 2.0 = 200 stars
      const stars = calculateStarsEarned(1000000, "GALAXY");
      expect(stars).toBe(200);
    });
  });

  describe("Point Redemption at Checkout", () => {
    it("converts 350 Stars into ৳350 discount (35,000 paisa)", () => {
      // Order subtotal = ৳5,000 (500,000 paisa)
      const discount = calculateStarsDiscountPaisa(350, 500000);
      expect(discount).toBe(35000); // ৳350
    });

    it("caps maximum stars discount at 30% of order subtotal", () => {
      // Order subtotal = ৳1,000 (100,000 paisa). Max 30% = ৳300 (30,000 paisa)
      // Patron tries to redeem 500 stars (৳500)
      const discount = calculateStarsDiscountPaisa(500, 100000);
      expect(discount).toBe(30000); // capped at ৳300
    });
  });
});
