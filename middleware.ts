import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "./src/lib/auth";

const protectedRoutes = [
  { prefix: "/admin", roles: ["ADMIN"] },
  { prefix: "/staff", roles: ["ADMIN", "STAFF"] },
  { prefix: "/customer", roles: ["CUSTOMER"] },
];

function decodeBase64Url(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  return Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
}

async function verifySessionRole(token: string): Promise<string | null> {
  try {
    const [encodedHeader, encodedPayload, encodedSignature] = token.split(".");
    if (!encodedHeader || !encodedPayload || !encodedSignature) return null;

    const secret = process.env.AUTH_SECRET;
    if (!secret) return null;

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      decodeBase64Url(encodedSignature).buffer as ArrayBuffer,
      new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`)
    );
    if (!valid) return null;

    const payload = JSON.parse(new TextDecoder().decode(decodeBase64Url(encodedPayload))) as {
      role?: string;
      exp?: number;
    };
    if (!payload.role || (payload.exp !== undefined && payload.exp <= Math.floor(Date.now() / 1000))) {
      return null;
    }

    return payload.role;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const protectedRoute = protectedRoutes.find(({ prefix }) => pathname.startsWith(prefix));

  if (!protectedRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("returnTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = await verifySessionRole(token);
  if (!role || !protectedRoute.roles.includes(role)) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/staff/:path*", "/customer/:path*"],
};
