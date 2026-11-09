import { describe, it, expect } from "vitest";
import { formatMoney, toBengaliNumeral, paisaToBdt, bdtToPaisa } from "@/lib/money";

describe("Astrox Money & Currency Formatting (Bangladesh)", () => {
  it("converts BDT to paisa and vice versa without rounding error", () => {
    expect(bdtToPaisa(18500)).toBe(1850000);
    expect(paisaToBdt(1850000)).toBe(18500);
  });

  it("formats English currency correctly with ৳ symbol", () => {
    const formatted = formatMoney(1850000, "en");
    expect(formatted).toContain("৳");
    expect(formatted).toContain("18,500");
  });

  it("formats Bengali currency with native Bengali numerals", () => {
    const bengaliNum = toBengaliNumeral(18500);
    expect(bengaliNum).toBe("১৮৫০০");

    const formattedBn = formatMoney(1850000, "bn");
    expect(formattedBn).toContain("৳");
    expect(formattedBn).toContain("১৮,৫০০");
  });
});
