import { NextResponse } from "next/server";
import { getTestimonialsForAdmin } from "@/lib/testimonials";
import type { Testimonial } from "@/db/schema";

export const dynamic = "force-dynamic";

const STATUSES = ["pending", "approved", "rejected", "spam"] as const;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const raw = url.searchParams.get("status");
  const status = STATUSES.includes(raw as Testimonial["status"])
    ? (raw as Testimonial["status"])
    : undefined;
  const rows = await getTestimonialsForAdmin(status);
  return NextResponse.json({ ok: true, testimonials: rows });
}
