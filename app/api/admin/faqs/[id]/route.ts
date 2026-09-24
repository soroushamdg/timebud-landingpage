import { NextResponse } from "next/server";
import { deleteFaq, moveFaq, resequenceFaqs, updateFaq } from "@/lib/faqs";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }

  // Move up / Move down, the keyboard-and-touch reachable alternative to a drag.
  if (body.move === "up" || body.move === "down") {
    const moved = await moveFaq(params.id, body.move === "up" ? -1 : 1);
    if (!moved) return NextResponse.json({ ok: false, error: "Cannot move any further" }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  const patch: Record<string, unknown> = {};
  if (typeof body.question === "string" && body.question.trim()) patch.question = body.question.trim();
  if (typeof body.answer === "string" && body.answer.trim()) patch.answer = body.answer.trim();
  if (typeof body.published === "boolean") patch.published = body.published ? 1 : 0;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ ok: false, error: "Nothing to update" }, { status: 400 });
  }
  const faq = await updateFaq(params.id, patch);
  if (!faq) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, faq });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  await deleteFaq(params.id);
  await resequenceFaqs();
  return NextResponse.json({ ok: true });
}
