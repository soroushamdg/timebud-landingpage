import { NextResponse } from "next/server";
import { generateFieldSuggestion, type FieldName } from "@/lib/anthropic";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_FIELDS: FieldName[] = ["slug", "tags", "excerpt"];

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }

  const field = body.field as FieldName;
  const title = typeof body.title === "string" ? body.title : "";
  const content = typeof body.content === "string" ? body.content : "";

  if (!VALID_FIELDS.includes(field)) {
    return NextResponse.json({ ok: false, error: "Invalid field" }, { status: 400 });
  }
  if (!title.trim() || !content.trim()) {
    return NextResponse.json(
      { ok: false, error: "Title and content are required to generate a suggestion" },
      { status: 400 }
    );
  }

  try {
    const value = await generateFieldSuggestion(field, { title, content });
    return NextResponse.json({ ok: true, value });
  } catch (err) {
    console.error(`Field generation failed for "${field}":`, err);
    return NextResponse.json({ ok: false, error: "Failed to generate a suggestion" }, { status: 500 });
  }
}
