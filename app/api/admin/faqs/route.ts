import { NextResponse } from "next/server";
import { createFaq, getAllFaqs, resequenceFaqs } from "@/lib/faqs";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ ok: true, faqs: await getAllFaqs() });
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }

  const question = typeof body.question === "string" ? body.question.trim() : "";
  const answer = typeof body.answer === "string" ? body.answer.trim() : "";
  if (!question) return NextResponse.json({ ok: false, error: "Question is required" }, { status: 400 });
  if (!answer) return NextResponse.json({ ok: false, error: "Answer is required" }, { status: 400 });

  const existing = await getAllFaqs();
  const faq = await createFaq({
    question,
    answer,
    displayOrder: existing.length,
    published: body.published === false ? 0 : 1,
  });
  await resequenceFaqs();
  return NextResponse.json({ ok: true, faq }, { status: 201 });
}
