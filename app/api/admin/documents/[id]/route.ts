import { NextResponse } from "next/server";
import { deleteDocument, updateDocument } from "@/lib/documents";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (typeof body.title === "string" && body.title.trim()) patch.title = body.title.trim();
  if (typeof body.body === "string" && body.body.trim()) patch.body = body.body;
  if (typeof body.published === "boolean") patch.published = body.published ? 1 : 0;
  if (typeof body.effectiveDate === "string") patch.effectiveDate = new Date(body.effectiveDate);

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ ok: false, error: "Nothing to update" }, { status: 400 });
  }
  const doc = await updateDocument(params.id, patch);
  if (!doc) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, document: doc });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  await deleteDocument(params.id);
  return NextResponse.json({ ok: true });
}
