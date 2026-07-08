import { NextResponse } from "next/server";
import { verifyAdminPassword } from "@/lib/password";
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let password: unknown;
  try {
    const body = await request.json();
    password = body.password;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }

  if (typeof password !== "string" || password.length === 0) {
    return NextResponse.json({ ok: false, error: "Password is required" }, { status: 400 });
  }

  let isValid: boolean;
  try {
    isValid = verifyAdminPassword(password);
  } catch (err) {
    console.error("Admin login misconfigured:", err);
    return NextResponse.json({ ok: false, error: "Server misconfigured" }, { status: 500 });
  }

  if (!isValid) {
    return NextResponse.json({ ok: false, error: "Incorrect password" }, { status: 401 });
  }

  const token = await createSessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
