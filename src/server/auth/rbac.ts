import { Role } from "@prisma/client";

export type Permission =
  | "*"
  | "studio:access"
  | "catalog:read"
  | "catalog:write"
  | "catalog:delete"
  | "orders:read"
  | "orders:update_status"
  | "orders:delete"
  | "banners:manage"
  | "categories:manage"
  | "settings:manage"
  | "staff:manage";

const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  OWNER: ["*"],
  MANAGER: [
    "studio:access",
    "catalog:read",
    "catalog:write",
    "orders:read",
    "orders:update_status",
    "banners:manage",
    "categories:manage",
  ],
  STAFF: [
    "studio:access",
    "catalog:read",
    "orders:read",
    "orders:update_status",
  ],
  CUSTOMER: [],
};

export function hasPermission(role: Role, required: Permission): boolean {
  const perms = ROLE_PERMISSIONS[role] || [];
  if (perms.includes("*")) return true;
  return perms.includes(required);
}

export function canAccessStudio(role: Role): boolean {
  return role === Role.OWNER || role === Role.MANAGER || role === Role.STAFF;
}
