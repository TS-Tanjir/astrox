import { db } from "../db";

export type NotificationType =
  | "ORDER_PLACED"
  | "PAYMENT_RECEIVED"
  | "CONSIGNMENT_DISPATCHED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED";

export interface NotificationPayload {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  totalPaisa: number;
  courierName?: string;
  trackingCode?: string;
  trackingUrl?: string;
  locale?: string;
}

export async function sendNotification(
  type: NotificationType,
  payload: NotificationPayload
) {
  const isBn = payload.locale === "bn";
  let smsMessage = "";
  let emailSubject = "";

  switch (type) {
    case "ORDER_PLACED":
      smsMessage = isBn
        ? `[Astrox] ধন্যবাদ ${payload.customerName}! আপনার অর্ডার ${payload.orderNumber} গ্রহণ করা হয়েছে। বিস্তারিত: astrox.com/track`
        : `[Astrox] Thank you ${payload.customerName}! Your order ${payload.orderNumber} is confirmed. Track at astrox.com/track`;
      emailSubject = `Astrox Order Confirmation — ${payload.orderNumber}`;
      break;

    case "PAYMENT_RECEIVED":
      smsMessage = isBn
        ? `[Astrox] আপনার অর্ডার ${payload.orderNumber}-এর পেমেন্ট সফলভাবে গ্রহণ করা হয়েছে।`
        : `[Astrox] Payment verified for order ${payload.orderNumber}. Thank you for choosing Astrox Luxe.`;
      emailSubject = `Astrox Payment Receipt — ${payload.orderNumber}`;
      break;

    case "CONSIGNMENT_DISPATCHED":
      smsMessage = isBn
        ? `[Astrox] আপনার পার্সেল (${payload.orderNumber}) ${payload.courierName || "কুরিয়ার"}-এ হস্তান্তর করা হয়েছে। ট্র্যাকিং কোড: ${payload.trackingCode}।`
        : `[Astrox] Parcel for order ${payload.orderNumber} handed over to ${payload.courierName || "Courier"}. Tracking: ${payload.trackingCode}.`;
      emailSubject = `Astrox Consignment Dispatched — ${payload.orderNumber}`;
      break;

    case "OUT_FOR_DELIVERY":
      smsMessage = isBn
        ? `[Astrox] আপনার পার্সেল (${payload.orderNumber}) আজ ডেলিভারি হবে। রাইডার আপনাকে কল করবেন।`
        : `[Astrox] Your consignment ${payload.orderNumber} is out for delivery today. Please keep your phone reachable.`;
      emailSubject = `Out for Delivery Today — ${payload.orderNumber}`;
      break;

    case "DELIVERED":
      smsMessage = isBn
        ? `[Astrox] অর্ডার ${payload.orderNumber} সফলভাবে ডেলিভারি হয়েছে। আমাদের সেবার মান মূল্যায়নে রিভিউ শেয়ার করুন: astrox.com`
        : `[Astrox] Order ${payload.orderNumber} delivered. Share your atelier experience with us: astrox.com`;
      emailSubject = `Delivered With Honor — ${payload.orderNumber}`;
      break;
  }

  // Record dispatch in ActivityLog for auditability
  await db.activityLog.create({
    data: {
      actorEmail: "notifications@astrox.com",
      actorRole: "STAFF",
      action: `SEND_NOTIFICATION_${type}`,
      entityType: "ORDER",
      entityId: payload.orderNumber,
      summary: `SMS to ${payload.customerPhone}: "${smsMessage}"`,
      diffJson: {
        type,
        customerPhone: payload.customerPhone,
        customerEmail: payload.customerEmail,
        smsMessage,
        emailSubject,
        dispatchedAt: new Date().toISOString(),
      },
    },
  });

  return { success: true, smsMessage, emailSubject };
}
