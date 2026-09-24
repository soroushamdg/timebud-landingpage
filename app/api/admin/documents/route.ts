import { NextResponse } from "next/server";
import { createDocument, getAllDocuments, getDocumentBySlug } from "@/lib/documents";
import { slugify } from "@/lib/slug";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ ok: true, documents: await getAllDocuments() });
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const bodyText = typeof body.body === "string" ? body.body : "";
  if (!title) return NextResponse.json({ ok: false, error: "Title is required" }, { status: 400 });
  if (!bodyText.trim()) return NextResponse.json({ ok: false, error: "Body is required" }, { status: 400 });

  const slug = slugify(typeof body.slug === "string" && body.slug.trim() ? body.slug : title);
  if (!slug) return NextResponse.json({ ok: false, error: "Could not derive a slug" }, { status: 400 });
  if (await getDocumentBySlug(slug)) {
    return NextResponse.json({ ok: false, error: `Slug "${slug}" is already in use` }, { status: 409 });
  }

  const existing = await getAllDocuments();
  const doc = await createDocument({
    slug,
    title,
    body: bodyText,
    published: body.published === false ? 0 : 1,
    displayOrder: existing.length,
    effectiveDate: typeof body.effectiveDate === "string" ? new Date(body.effectiveDate) : new Date(),
  });
  return NextResponse.json({ ok: true, document: doc }, { status: 201 });
}
