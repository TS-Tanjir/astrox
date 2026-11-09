import { OrderStatus } from "@prisma/client";

export interface CourierQuote {
  feePaisa: number;
  transitHours: number;
  partnerName: string;
  serviceType: string;
  estimatedDeliveryText: string;
}

export interface CourierBookingResult {
  consignmentId: string;
  trackingCode: string;
  trackingUrl: string;
  labelUrl: string;
  feePaisa: number;
  carrierName: string;
}

export interface CourierStatusUpdate {
  consignmentId: string;
  status: OrderStatus;
  statusNote: string;
  location?: string;
  timestamp: string;
}

export interface CourierProvider {
  id: string; // "PATHAO" | "STEADFAST" | "REDX"
  name: string;
  quote(params: {
    district: string;
    weightGrams?: number;
    subtotalPaisa?: number;
  }): Promise<CourierQuote>;

  book(params: {
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    district: string;
    area: string;
    street: string;
    amountToCollectPaisa: number; // 0 if paid online, order.total if COD
    weightGrams?: number;
    itemSummary: string;
  }): Promise<CourierBookingResult>;

  parseWebhook(payload: any): Promise<CourierStatusUpdate>;
}
