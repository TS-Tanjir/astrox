import { describe, it, expect } from "vitest";
import {
  pathaoAdapter,
  steadfastAdapter,
  getCourierAdapter,
} from "../../src/server/adapters/couriers";
import { OrderStatus } from "@prisma/client";

describe("Phase 2 — Courier Booking & Webhook Dispatch", () => {
  it("resolves the correct courier adapter by name", () => {
    expect(getCourierAdapter("PATHAO")).toBe(pathaoAdapter);
    expect(getCourierAdapter("STEADFAST")).toBe(steadfastAdapter);
    expect(getCourierAdapter("Steadfast Courier")).toBe(steadfastAdapter);
    expect(getCourierAdapter()).toBe(pathaoAdapter); // default
  });

  describe("Pathao Express Adapter", () => {
    it("books a consignment and returns PTH consignment ID and air waybill", async () => {
      const res = await pathaoAdapter.book({
        orderNumber: "AX-2026-1001",
        customerName: "Sadia Rahman",
        customerPhone: "01711223344",
        district: "Dhaka",
        area: "Gulshan-2",
        street: "House 12, Road 45",
        amountToCollectPaisa: 0, // Prepaid
        itemSummary: "Muslin Jamdani Saree (x1)",
      });

      expect(res.consignmentId).toMatch(/^PTH-2026-\d+$/);
      expect(res.trackingCode).toMatch(/^PTH\d+$/);
      expect(res.labelUrl).toContain("orderNumber=AX-2026-1001");
      expect(res.feePaisa).toBe(7000);
    });

    it("parses Pathao status webhooks into OrderStatus", async () => {
      const webhook1 = await pathaoAdapter.parseWebhook({
        consignment_id: "PTH-2026-123456",
        event_name: "Picked",
        hub_name: "Tejgaon Sorting Center",
      });
      expect(webhook1.status).toBe(OrderStatus.SHIPPED);

      const webhook2 = await pathaoAdapter.parseWebhook({
        consignment_id: "PTH-2026-123456",
        event_name: "Out_for_Delivery",
      });
      expect(webhook2.status).toBe(OrderStatus.OUT_FOR_DELIVERY);

      const webhook3 = await pathaoAdapter.parseWebhook({
        consignment_id: "PTH-2026-123456",
        event_name: "Delivered",
      });
      expect(webhook3.status).toBe(OrderStatus.DELIVERED);
    });
  });

  describe("Steadfast Courier Adapter", () => {
    it("books nationwide 64-district COD parcel with STF reference", async () => {
      const res = await steadfastAdapter.book({
        orderNumber: "AX-2026-1002",
        customerName: "Imran Khan",
        customerPhone: "01811223344",
        district: "Chattogram",
        area: "Agrabad",
        street: "Road 3",
        amountToCollectPaisa: 1250000,
        itemSummary: "Obsidian Gold Jacquard Panjabi (x1)",
      });

      expect(res.consignmentId).toMatch(/^STF-2026-\d+$/);
      expect(res.trackingUrl).toContain("steadfast.com.bd");
      expect(res.feePaisa).toBe(13000);
    });
  });
});
