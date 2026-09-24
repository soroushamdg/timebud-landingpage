import { NextResponse } from "next/server";
import { deleteTestimonial, updateTestimonial } from "@/lib/testimonials";
import type { Testimonial } from "@/db/schema";

export const dynamic = "force-dynamic";

const STATUSES = ["pending", "approved", "rejected", "spam"] as const;

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};

  if (typeof body.status === "string") {
    if (!STATUSES.includes(body.status as Testimonial["status"])) {
      return NextResponse.json({ ok: false, error: "Unknown status" }, { status: 400 });
    }
    patch.status = body.status;
    patch.reviewedAt = new Date();
  }

  // Light copy-editing is normal and allowed. `originalQuote` is never touched,
  // so what the person actually wrote stays recoverable.
  if (typeof body.quote === "string" && body.quote.trim()) patch.quote = body.quote.trim().slice(0, 280);
  if (typeof body.name === "string" && body.name.trim()) patch.name = body.name.trim().slice(0, 80);
  if (typeof body.role === "string") patch.role = body.role.trim().slice(0, 120) || null;
  if (typeof body.reviewNote === "string") patch.reviewNote = body.reviewNote.trim() || null;
  if (typeof body.featured === "boolean") patch.featured = body.featured ? 1 : 0;
  if (typeof body.displayOrder === "number") patch.displayOrder = body.displayOrder;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ ok: false, error: "Nothing to update" }, { status: 400 });
  }

  const row = await updateTestimonial(params.id, patch);
  if (!row) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, testimonial: row });
}

/**
 * Erasure. Moderation uses status changes; this actually removes the row and
 * is what to call when someone asks to be taken down.
 */
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  await deleteTestimonial(params.id);
  return NextResponse.json({ ok: true });
}
