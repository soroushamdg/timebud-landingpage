import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  let email: string;

  try {
    const body = await req.json();
    email = (body.email ?? "").toString().trim().toLowerCase();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "Invalid email address" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "noreply@timebud.app";

  if (!apiKey || !audienceId) {
    console.error("[waitlist] Missing RESEND_API_KEY or RESEND_AUDIENCE_ID");
    return NextResponse.json({ ok: false, error: "Server configuration error" }, { status: 500 });
  }

  const resend = new Resend(apiKey);

  // 1. Add to Resend Audience — the persistent store, replaces Supabase
  try {
    const { error } = await resend.contacts.create({
      email,
      audienceId,
      unsubscribed: false,
    });

    if (error) {
      // 409 = contact already exists — treat as success so UX isn't confusing
      const isDuplicate =
        (error as { statusCode?: number }).statusCode === 409 ||
        (error as { message?: string }).message?.toLowerCase().includes("already");
      if (!isDuplicate) throw error;
    }
  } catch (err) {
    console.error("[waitlist] Resend contacts.create failed:", err);
    return NextResponse.json(
      { ok: false, error: "Could not save your email. Please try again." },
      { status: 500 }
    );
  }

  // 2. Send confirmation email — best-effort, never fail the request over this
  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: "You're on the TimeBud iOS waitlist!",
      html: `
        <div style="background:#FDC800;padding:40px;font-family:monospace;">
          <h1 style="font-size:20px;color:#000;margin:0 0 16px;">You're in.</h1>
          <p style="color:#000;font-size:14px;line-height:1.6;">
            We'll let you know the moment TimeBud lands on iOS.<br><br>
            In the meantime, the web version is live — give it a try at
            <a href="https://i.usetimebud.app/" style="color:#000;">i.usetimebud.app</a>.
          </p>
          <p style="color:#000;font-size:12px;margin-top:32px;">— TimeBud</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("[waitlist] Resend email failed (non-fatal):", err);
  }

  return NextResponse.json({ ok: true });
}
