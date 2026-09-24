import { NextResponse } from "next/server";
import {
  CONSENT_TEXT,
  createTestimonial,
  getApprovedTestimonials,
  MAX_QUOTE,
  recentSubmissionCount,
  validateSubmission,
} from "@/lib/testimonials";
import { clientIp, hashIp } from "@/lib/request-meta";
import { rateLimit, sweepRateLimits } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_HOUR = 3;

/** Public: the approved wall. Never returns an email or any moderation field. */
export async function GET() {
  const rows = await getApprovedTestimonials();
  return NextResponse.json({ ok: true, testimonials: rows });
}

export async function POST(request: Request) {
  sweepRateLimits();

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }

  // Honeypot. A real person never fills a field they cannot see; most naive
  // bots fill every input they find. Answer 200 so the bot learns nothing.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true, status: "pending" });
  }

  const ip = clientIp(request);
  const ipHash = hashIp(ip);

  const limited = rateLimit(`testimonial:${ipHash ?? "unknown"}`, MAX_PER_HOUR, WINDOW_MS);
  if (!limited.ok) {
    return NextResponse.json(
      { ok: false, error: "You have sent a few of these already. Try again a bit later." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } }
    );
  }

  // The in-memory limiter does not survive a cold start, so the database gets
  // the final say on how many submissions one source has actually made.
  if (ipHash) {
    const recent = await recentSubmissionCount(ipHash, WINDOW_MS);
    if (recent >= MAX_PER_HOUR) {
      return NextResponse.json(
        { ok: false, error: "You have sent a few of these already. Try again a bit later." },
        { status: 429 }
      );
    }
  }

  const result = validateSubmission({
    quote: body.quote,
    name: body.name,
    email: body.email,
    consent: body.consent,
  });
  if (!result.ok) {
    return NextResponse.json({ ok: false, errors: result.errors }, { status: 400 });
  }

  const quote = (body.quote as string).trim().slice(0, MAX_QUOTE);
  const name = (body.name as string).trim().slice(0, 80);
  const role = typeof body.role === "string" && body.role.trim() ? body.role.trim().slice(0, 120) : null;
  const usedFor =
    typeof body.usedFor === "string" && body.usedFor.trim() ? body.usedFor.trim().slice(0, 60) : null;
  const email = (body.email as string).trim().toLowerCase();

  await createTestimonial({
    quote,
    originalQuote: quote,
    name,
    role,
    usedFor,
    email,
    consentText: CONSENT_TEXT,
    consentAt: new Date(),
    status: "pending",
    ipHash,
    userAgent: request.headers.get("user-agent")?.slice(0, 500) ?? null,
    sourcePath: typeof body.sourcePath === "string" ? body.sourcePath.slice(0, 200) : null,
  });

  // Confirmation Messages (ux, severity Medium): say what happens next rather
  // than closing silently. Nothing appears on the site until it is reviewed,
  // and the submitter needs to know that before they go looking for it.
  return NextResponse.json({
    ok: true,
    status: "pending",
    message: "Thanks. We read every one, and yours goes live once we have checked it.",
  });
}
