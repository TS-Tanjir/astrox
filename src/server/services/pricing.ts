import { db } from "../db";

export interface PricingLineItem {
  variantId: string;
  qty: number;
  unitPricePaisa: number;
}

export interface PricingContext {
  lines: PricingLineItem[];
  district?: string; // "Dhaka" vs outside
  couponCode?: string | null;
}

export interface PricingResult {
  subtotal: number; // in paisa
  discount: number; // in paisa
  shippingFee: number; // in paisa
  total: number; // in paisa
  freeShippingThreshold: number; // in paisa
  freeShippingRemaining: number; // in paisa
  appliedCoupon: {
    code: string;
    discountType: string;
    discountValue: number;
    titleEn: string;
  } | null;
}

const INSIDE_DHAKA_FEE = 7000; // ৳70 in paisa
const OUTSIDE_DHAKA_FEE = 13000; // ৳130 in paisa
const FREE_SHIPPING_THRESHOLD = 250000; // ৳2500 in paisa

export async function calculateCartPricing(ctx: PricingContext): Promise<PricingResult> {
  const subtotal = ctx.lines.reduce((acc, item) => acc + item.unitPricePaisa * item.qty, 0);

  let discount = 0;
  let appliedCoupon: PricingResult["appliedCoupon"] = null;
  let isFreeShippingCoupon = false;

  if (ctx.couponCode) {
    const coupon = await db.coupon.findUnique({
      where: { code: ctx.couponCode.toUpperCase().trim(), isActive: true },
    });

    if (coupon && subtotal >= coupon.minSubtotal) {
      if (coupon.discountType === "PERCENT") {
        discount = Math.round((subtotal * coupon.discountValue) / 100);
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
          discount = coupon.maxDiscount;
        }
      } else if (coupon.discountType === "FIXED") {
        discount = coupon.discountValue;
      } else if (coupon.discountType === "FREE_SHIPPING") {
        isFreeShippingCoupon = true;
      }

      appliedCoupon = {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        titleEn: coupon.titleEn,
      };
    }
  }

  // Delivery calculation
  const isDhaka = ctx.district ? ctx.district.toLowerCase() === "dhaka" : true;
  let baseShippingFee = isDhaka ? INSIDE_DHAKA_FEE : OUTSIDE_DHAKA_FEE;

  if (subtotal >= FREE_SHIPPING_THRESHOLD || isFreeShippingCoupon) {
    baseShippingFee = 0;
  }

  const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const total = Math.max(0, subtotal - discount + baseShippingFee);

  return {
    subtotal,
    discount,
    shippingFee: baseShippingFee,
    total,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    freeShippingRemaining,
    appliedCoupon,
  };
}
