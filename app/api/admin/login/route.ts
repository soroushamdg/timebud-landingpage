import { NextResponse } from "next/server";
import { verifyAdminPassword } from "@/lib/password";
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/session";
import { rateLimit, sweepRateLimits } from "@/lib/rate-limit";
import { clientIp, hashIp } from "@/lib/request-meta";

export const runtime = "nodejs";

// One shared password guards everything behind /admin, and that area now holds
// other people's names and email addresses. An unthrottled password endpoint is
// an open invitation to guess, so attempts are capped per source.
const MAX_ATTEMPTS = 5;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: Request) {
  sweepRateLimits();

  const attemptKey = `login:${hashIp(clientIp(request)) ?? "unknown"}`;
  const limited = rateLimit(attemptKey, MAX_ATTEMPTS, ATTEMPT_WINDOW_MS);
  if (!limited.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Try again in a few minutes." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } }
    );
  }

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
