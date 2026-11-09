import { describe, it, expect } from "vitest";

function calculateDeliveryFee(params: {
  district: string;
  orderTotalPaisa: number;
}) {
  const insideDhakaDistricts = ["Dhaka", "Gazipur", "Narayanganj"];
  const isInsideDhaka = insideDhakaDistricts.includes(params.district);

  const freeThreshold = isInsideDhaka ? 250000 : 500000; // ৳2,500 inside, ৳5,000 outside
  if (params.orderTotalPaisa >= freeThreshold) {
    return {
      feePaisa: 0,
      isFree: true,
      partner: isInsideDhaka ? "Pathao Express" : "Steadfast Courier",
    };
  }

  return {
    feePaisa: isInsideDhaka ? 7000 : 13000, // ৳70 vs ৳130
    isFree: false,
    partner: isInsideDhaka ? "Pathao Express" : "Steadfast Courier",
  };
}

describe("Bangladesh Courier Fee & Allocation Logic", () => {
  it("charges ৳70 for inside Dhaka when order is below ৳2,500", () => {
    const res = calculateDeliveryFee({ district: "Dhaka", orderTotalPaisa: 150000 });
    expect(res.feePaisa).toBe(7000);
    expect(res.isFree).toBe(false);
    expect(res.partner).toBe("Pathao Express");
  });

  it("qualifies for FREE delivery inside Dhaka when order is >= ৳2,500", () => {
    const res = calculateDeliveryFee({ district: "Dhaka", orderTotalPaisa: 250000 });
    expect(res.feePaisa).toBe(0);
    expect(res.isFree).toBe(true);
    expect(res.partner).toBe("Pathao Express");
  });

  it("charges ৳130 for outside Dhaka (e.g. Chattogram) below ৳5,000", () => {
    const res = calculateDeliveryFee({ district: "Chattogram", orderTotalPaisa: 350000 });
    expect(res.feePaisa).toBe(13000);
    expect(res.isFree).toBe(false);
    expect(res.partner).toBe("Steadfast Courier");
  });

  it("qualifies for FREE delivery outside Dhaka for luxury orders >= ৳5,000", () => {
    const res = calculateDeliveryFee({ district: "Sylhet", orderTotalPaisa: 550000 });
    expect(res.feePaisa).toBe(0);
    expect(res.isFree).toBe(true);
    expect(res.partner).toBe("Steadfast Courier");
  });
});
