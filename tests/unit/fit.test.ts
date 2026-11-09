import { describe, it, expect } from "vitest";

function predictTailoredSize(params: {
  weightKg: number;
  fitStyle: "SLIM" | "REGULAR" | "RELAXED";
}) {
  let recommended = "40 (M)";
  if (params.weightKg < 63) {
    recommended = "38 (S)";
  } else if (params.weightKg <= 74) {
    recommended = "40 (M)";
  } else if (params.weightKg <= 84) {
    recommended = "42 (L)";
  } else {
    recommended = "44 (XL)";
  }

  if (params.fitStyle === "RELAXED") {
    if (recommended === "38 (S)") recommended = "40 (M)";
    else if (recommended === "40 (M)") recommended = "42 (L)";
    else if (recommended === "42 (L)") recommended = "44 (XL)";
  } else if (params.fitStyle === "SLIM") {
    if (recommended === "44 (XL)") recommended = "42 (L)";
    else if (recommended === "42 (L)") recommended = "40 (M)";
  }

  return recommended;
}

describe("Tailored Fit & Drape Advisor Engine", () => {
  it("predicts Size 38 (S) for slender frames under 63kg in classic fit", () => {
    expect(predictTailoredSize({ weightKg: 58, fitStyle: "REGULAR" })).toBe("38 (S)");
  });

  it("predicts Size 40 (M) for medium frames (63-74kg)", () => {
    expect(predictTailoredSize({ weightKg: 70, fitStyle: "REGULAR" })).toBe("40 (M)");
  });

  it("bumps up size when patron prefers Comfort Relaxed Drape", () => {
    expect(predictTailoredSize({ weightKg: 70, fitStyle: "RELAXED" })).toBe("42 (L)");
  });

  it("adjusts down when patron prefers Slim Tailored silhouette", () => {
    expect(predictTailoredSize({ weightKg: 80, fitStyle: "SLIM" })).toBe("40 (M)");
  });

  it("predicts Size 44 (XL) for robust frames over 84kg", () => {
    expect(predictTailoredSize({ weightKg: 92, fitStyle: "REGULAR" })).toBe("44 (XL)");
  });
});
