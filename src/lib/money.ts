const BENGALI_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

export function toBengaliNumeral(num: number | string): string {
  return num
    .toString()
    .split("")
    .map((char) => {
      const parsed = parseInt(char, 10);
      return !isNaN(parsed) ? BENGALI_DIGITS[parsed] : char;
    })
    .join("");
}

export function formatMoney(paisa: number, locale: "en" | "bn" = "en"): string {
  const bdtAmount = Math.round(paisa / 100);
  const formattedEn = new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(bdtAmount)
    .replace("BDT", "৳")
    .trim();

  if (locale === "bn") {
    // Replace English digits with Bengali digits
    return formattedEn
      .split("")
      .map((c) => {
        const digit = parseInt(c, 10);
        return !isNaN(digit) ? BENGALI_DIGITS[digit] : c;
      })
      .join("");
  }

  return formattedEn;
}

export function paisaToBdt(paisa: number): number {
  return Math.round(paisa / 100);
}

export function bdtToPaisa(bdt: number): number {
  return Math.round(bdt * 100);
}
