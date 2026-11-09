import { OrderStatus } from "@prisma/client";
import { CourierProvider, CourierQuote, CourierBookingResult, CourierStatusUpdate } from "./types";

export class SteadfastCourierAdapter implements CourierProvider {
  id = "STEADFAST";
  name = "Steadfast Courier";

  async quote(params: {
    district: string;
    weightGrams?: number;
    subtotalPaisa?: number;
  }): Promise<CourierQuote> {
    const isDhaka = params.district.toLowerCase() === "dhaka";
    const weight = params.weightGrams || 500;
    const baseFee = isDhaka ? 7000 : 13000;
    const extraWeight = weight > 1000 ? Math.ceil((weight - 1000) / 1000) * 2500 : 0;
    const isFree = (params.subtotalPaisa || 0) >= (isDhaka ? 250000 : 500000);

    return {
      feePaisa: isFree ? 0 : baseFee + extraWeight,
      transitHours: isDhaka ? 24 : 48,
      partnerName: "Steadfast Courier",
      serviceType: "Nationwide Doorstep Delivery",
      estimatedDeliveryText: isDhaka ? "24–36 Hours" : "48–72 Hours (64 Districts)",
    };
  }

  async book(params: {
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    district: string;
    area: string;
    street: string;
    amountToCollectPaisa: number;
    weightGrams?: number;
    itemSummary: string;
  }): Promise<CourierBookingResult> {
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const consignmentId = `STF-2026-${randomSuffix}`;
    const trackingCode = `STF${params.orderNumber.replace(/[^0-9]/g, "")}`;

    return {
      consignmentId,
      trackingCode,
      trackingUrl: `https://steadfast.com.bd/t/${trackingCode}`,
      labelUrl: `/studio/orders/label?orderNumber=${params.orderNumber}&consignmentId=${consignmentId}`,
      feePaisa: params.district.toLowerCase() === "dhaka" ? 7000 : 13000,
      carrierName: "Steadfast Courier",
    };
  }

  async parseWebhook(payload: any): Promise<CourierStatusUpdate> {
    const statusMap: Record<string, OrderStatus> = {
      pending: OrderStatus.PACKED,
      in_transit: OrderStatus.SHIPPED,
      out_for_delivery: OrderStatus.OUT_FOR_DELIVERY,
      delivered: OrderStatus.DELIVERED,
      cancelled: OrderStatus.CANCELLED,
      returned: OrderStatus.RETURNED,
    };

    const courierStatus = (payload.status || "in_transit").toLowerCase();
    const mappedStatus = statusMap[courierStatus] || OrderStatus.SHIPPED;

    return {
      consignmentId: payload.consignment_id || payload.invoice || "STF-UNKNOWN",
      status: mappedStatus,
      statusNote: payload.tracking_message || `Steadfast update: ${courierStatus}`,
      location: payload.district || "Steadfast Regional Hub",
      timestamp: new Date().toISOString(),
    };
  }
}

export const steadfastAdapter = new SteadfastCourierAdapter();
