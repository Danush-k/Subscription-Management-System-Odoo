import { cookies } from "next/headers";
import jwt, { JwtPayload } from "jsonwebtoken";

export const AUTH_COOKIE_NAME = "brightloop_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type AuthRole = "ADMIN" | "STAFF" | "CUSTOMER";

export interface AuthSession {
  userId: string;
  email: string;
  name: string;
  role: AuthRole;
  customerId?: string;
}

interface SessionToken extends JwtPayload {
  userId: string;
  email: string;
  name: string;
  role: AuthRole;
  customerId?: string;
}

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not configured");
  }
  return secret;
}

export function createSessionToken(session: AuthSession): string {
  return jwt.sign(session, getAuthSecret(), {
    expiresIn: SESSION_MAX_AGE_SECONDS,
  });
}

export function verifySessionToken(token: string): AuthSession | null {
  try {
    const payload = jwt.verify(token, getAuthSecret()) as SessionToken;

    if (
      typeof payload.userId !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.name !== "string" ||
      !["ADMIN", "STAFF", "CUSTOMER"].includes(payload.role)
    ) {
      return null;
    }

    return {
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      customerId: typeof payload.customerId === "string" ? payload.customerId : undefined,
    };
  } catch {
    return null;
  }
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

export async function getServerSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  return token ? verifySessionToken(token) : null;
}
