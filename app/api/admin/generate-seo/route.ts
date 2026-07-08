import { NextResponse } from "next/server";
import { generateSeoMetadata } from "@/lib/anthropic";
import { getOtherPublishedPosts } from "@/lib/posts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title : "";
  const content = typeof body.content === "string" ? body.content : "";
  const coverImageUrl = typeof body.coverImageUrl === "string" ? body.coverImageUrl : null;
  const postId = typeof body.postId === "string" ? body.postId : undefined;

  if (!title.trim() || !content.trim()) {
    return NextResponse.json(
      { ok: false, error: "Title and content are required to generate SEO metadata" },
      { status: 400 }
    );
  }

  try {
    const otherPosts = await getOtherPublishedPosts(postId);
    const result = await generateSeoMetadata({ title, content, coverImageUrl, otherPosts });
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    console.error("SEO generation failed:", err);
    return NextResponse.json({ ok: false, error: "Failed to generate SEO metadata" }, { status: 500 });
  }
}
