import { cookies } from "next/headers";
import { db } from "../db";
import { Role } from "@prisma/client";

const SESSION_COOKIE_NAME = "astrox_session";

export interface SessionUser {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: Role;
  avatarUrl: string | null;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const rawSession = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!rawSession) return null;

  try {
    const parsed = JSON.parse(Buffer.from(rawSession, "base64url").toString("utf8"));
    if (!parsed?.userId) return null;

    const user = await db.user.findUnique({
      where: { id: parsed.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatarUrl: true,
      },
    });

    return user;
  } catch {
    return null;
  }
}

export async function setSessionUser(userId: string): Promise<void> {
  const payload = Buffer.from(JSON.stringify({ userId, iat: Date.now() }), "utf8").toString("base64url");
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, payload, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function clearSessionUser(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
