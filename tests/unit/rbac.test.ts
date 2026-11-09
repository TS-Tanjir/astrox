import { describe, it, expect } from "vitest";
import { hasPermission, canAccessStudio } from "@/server/auth/rbac";
import { Role } from "@prisma/client";

describe("Astrox RBAC Security Matrix", () => {
  it("allows OWNER universal permissions (*)", () => {
    expect(hasPermission(Role.OWNER, "*")).toBe(true);
    expect(hasPermission(Role.OWNER, "catalog:delete")).toBe(true);
    expect(hasPermission(Role.OWNER, "staff:manage")).toBe(true);
    expect(canAccessStudio(Role.OWNER)).toBe(true);
  });

  it("restricts MANAGER from deleting catalog and managing staff", () => {
    expect(hasPermission(Role.MANAGER, "studio:access")).toBe(true);
    expect(hasPermission(Role.MANAGER, "catalog:read")).toBe(true);
    expect(hasPermission(Role.MANAGER, "catalog:write")).toBe(true);
    expect(hasPermission(Role.MANAGER, "staff:manage")).toBe(false);
    expect(hasPermission(Role.MANAGER, "catalog:delete")).toBe(false);
  });

  it("restricts STAFF to reading and updating orders only", () => {
    expect(hasPermission(Role.STAFF, "orders:update_status")).toBe(true);
    expect(hasPermission(Role.STAFF, "catalog:write")).toBe(false);
    expect(canAccessStudio(Role.STAFF)).toBe(true);
  });

  it("blocks CUSTOMER role from accessing studio", () => {
    expect(canAccessStudio(Role.CUSTOMER)).toBe(false);
    expect(hasPermission(Role.CUSTOMER, "orders:update_status")).toBe(false);
  });
});
