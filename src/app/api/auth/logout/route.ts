import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, getSessionCookieOptions } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ success: true, data: null });
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    ...getSessionCookieOptions(),
    maxAge: 0,
  });
  return response;
}
