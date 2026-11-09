import { OrderStatus } from "@prisma/client";
import { CourierProvider, CourierQuote, CourierBookingResult, CourierStatusUpdate } from "./types";

export class PathaoCourierAdapter implements CourierProvider {
  id = "PATHAO";
  name = "Pathao Express";

  async quote(params: {
    district: string;
    weightGrams?: number;
    subtotalPaisa?: number;
  }): Promise<CourierQuote> {
    const isDhakaMetro = ["Dhaka", "Gazipur", "Narayanganj"].includes(params.district);
    const weight = params.weightGrams || 500;
    const baseFee = isDhakaMetro ? 7000 : 13000;
    const extraWeightFee = weight > 1000 ? Math.ceil((weight - 1000) / 1000) * 2000 : 0;
    const isFree = (params.subtotalPaisa || 0) >= (isDhakaMetro ? 250000 : 500000);

    return {
      feePaisa: isFree ? 0 : baseFee + extraWeightFee,
      transitHours: isDhakaMetro ? 24 : 48,
      partnerName: "Pathao Express",
      serviceType: isDhakaMetro ? "Same-Day / Next-Day Express" : "Metropolitan Transit",
      estimatedDeliveryText: isDhakaMetro ? "Guaranteed Within 24 Hours" : "24–48 Hours",
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
    const consignmentId = `PTH-2026-${randomSuffix}`;
    const trackingCode = `PTH${params.orderNumber.replace(/[^0-9]/g, "")}`;

    return {
      consignmentId,
      trackingCode,
      trackingUrl: `https://pathao.com/courier/track?tracking_code=${trackingCode}`,
      labelUrl: `/studio/orders/label?orderNumber=${params.orderNumber}&consignmentId=${consignmentId}`,
      feePaisa: ["Dhaka", "Gazipur", "Narayanganj"].includes(params.district) ? 7000 : 13000,
      carrierName: "Pathao Express",
    };
  }

  async parseWebhook(payload: any): Promise<CourierStatusUpdate> {
    // Map Pathao webhook events to OrderStatus
    const statusMap: Record<string, OrderStatus> = {
      Order_Created: OrderStatus.PACKED,
      Pickup_Requested: OrderStatus.PACKED,
      Picked: OrderStatus.SHIPPED,
      In_Transit: OrderStatus.SHIPPED,
      Out_for_Delivery: OrderStatus.OUT_FOR_DELIVERY,
      Delivered: OrderStatus.DELIVERED,
      Returned: OrderStatus.RETURNED,
    };

    const courierStatus = payload.event_name || payload.status || "In_Transit";
    const mappedStatus = statusMap[courierStatus] || OrderStatus.SHIPPED;

    return {
      consignmentId: payload.consignment_id || payload.merchant_order_id,
      status: mappedStatus,
      statusNote: payload.reason || `Pathao Status Update: ${courierStatus}`,
      location: payload.hub_name || "Dhaka Sorting Hub",
      timestamp: new Date().toISOString(),
    };
  }
}

export const pathaoAdapter = new PathaoCourierAdapter();
