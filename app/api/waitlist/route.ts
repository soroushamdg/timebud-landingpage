import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars not set");
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  let email: string;

  try {
    const body = await req.json();
    email = (body.email ?? "").toString().trim().toLowerCase();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  // Basic email validation
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "Invalid email address" }, { status: 400 });
  }

  // 1. Insert into Supabase first — this is the critical step
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("waitlist")
      .insert({ email, source: "landing_ios" });

    if (error) {
      // Duplicate email — treat as success so UX isn't confusing
      if (error.code === "23505") {
        return NextResponse.json({ ok: true });
      }
      throw error;
    }
  } catch (err) {
    console.error("[waitlist] Supabase insert failed:", err);
    return NextResponse.json({ ok: false, error: "Could not save your email. Please try again." }, { status: 500 });
  }

  // 2. Send confirmation email — best-effort, never fail the request over this
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL ?? "noreply@timebud.app";

    if (apiKey) {
      const resend = new Resend(apiKey);
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
              <a href="https://app.timebud.app" style="color:#000;">app.timebud.app</a>.
            </p>
            <p style="color:#000;font-size:12px;margin-top:32px;">— TimeBud</p>
          </div>
        `,
      });
    }
  } catch (err) {
    // Log but don't surface — email is bonus, not critical
    console.error("[waitlist] Resend failed (non-fatal):", err);
  }

  return NextResponse.json({ ok: true });
}
