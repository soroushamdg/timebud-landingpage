import { NextResponse } from "next/server";
import { createPost, getAllPostsForAdmin, getOtherPublishedPosts, getPostBySlugExcludingId } from "@/lib/posts";
import { slugify } from "@/lib/slug";
import { generateSeoMetadata } from "@/lib/anthropic";

export const dynamic = "force-dynamic";

const VALID_STATUSES = ["draft", "scheduled", "published", "hidden"] as const;
type PostStatus = (typeof VALID_STATUSES)[number];

export async function GET() {
  const posts = await getAllPostsForAdmin();
  return NextResponse.json({ ok: true, posts });
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const content = typeof body.content === "string" ? body.content : "";
  const status: PostStatus = VALID_STATUSES.includes(body.status as PostStatus)
    ? (body.status as PostStatus)
    : "draft";

  if (!title) {
    return NextResponse.json({ ok: false, error: "Title is required" }, { status: 400 });
  }
  if (!content.trim()) {
    return NextResponse.json({ ok: false, error: "Content is required" }, { status: 400 });
  }

  const scheduledAt = typeof body.scheduledAt === "string" && body.scheduledAt ? new Date(body.scheduledAt) : null;
  if (status === "scheduled" && !scheduledAt) {
    return NextResponse.json({ ok: false, error: "scheduledAt is required for scheduled posts" }, { status: 400 });
  }

  const requestedSlug = typeof body.slug === "string" && body.slug.trim() ? body.slug : title;
  const slug = slugify(requestedSlug);
  if (!slug) {
    return NextResponse.json({ ok: false, error: "Could not derive a valid slug" }, { status: 400 });
  }

  const existing = await getPostBySlugExcludingId(slug);
  if (existing) {
    return NextResponse.json(
      { ok: false, error: `Slug "${slug}" is already in use` },
      { status: 409 }
    );
  }

  let tags = Array.isArray(body.tags) ? body.tags.filter((t): t is string => typeof t === "string") : [];
  const coverImageUrl = typeof body.coverImageUrl === "string" ? body.coverImageUrl : null;

  let seoTitle = typeof body.seoTitle === "string" && body.seoTitle.trim() ? body.seoTitle : null;
  let description = typeof body.description === "string" && body.description.trim() ? body.description : null;
  let ogDescription =
    typeof body.ogDescription === "string" && body.ogDescription.trim() ? body.ogDescription : null;
  let coverImageAlt =
    typeof body.coverImageAlt === "string" && body.coverImageAlt.trim() ? body.coverImageAlt : null;
  let relatedSlugs = Array.isArray(body.relatedSlugs)
    ? body.relatedSlugs.filter((s): s is string => typeof s === "string")
    : [];
  let internalLinkSuggestions = Array.isArray(body.internalLinkSuggestions) ? body.internalLinkSuggestions : [];
  let aiMeta: unknown = null;

  // Going live (published or scheduled — a scheduled post goes live with no
  // further admin action) without SEO fields filled in triggers AI generation
  // automatically. Non-fatal: if the AI call fails, the post still saves.
  if ((status === "published" || status === "scheduled") && (!seoTitle || !description)) {
    try {
      const otherPosts = await getOtherPublishedPosts();
      const result = await generateSeoMetadata({ title, content, coverImageUrl, otherPosts });
      seoTitle = seoTitle ?? result.seoTitle;
      description = description ?? result.metaDescription;
      ogDescription = ogDescription ?? result.ogDescription;
      coverImageAlt = coverImageAlt ?? (result.coverImageAlt || null);
      if (tags.length === 0) tags = result.tags;
      if (relatedSlugs.length === 0) relatedSlugs = result.relatedSlugs;
      if (internalLinkSuggestions.length === 0) internalLinkSuggestions = result.internalLinkSuggestions;
      aiMeta = result;
    } catch (err) {
      console.error("Auto SEO generation failed, publishing without it:", err);
    }
  }

  try {
    const post = await createPost({
      slug,
      title,
      content,
      excerpt: typeof body.excerpt === "string" ? body.excerpt : null,
      seoTitle,
      description,
      ogDescription,
      tags,
      coverImageUrl,
      coverImageAlt,
      ogImageUrl: typeof body.ogImageUrl === "string" ? body.ogImageUrl : null,
      status,
      scheduledAt,
      relatedSlugs,
      internalLinkSuggestions,
      aiMeta,
    });
    return NextResponse.json({ ok: true, post });
  } catch (err) {
    console.error("Failed to create post:", err);
    return NextResponse.json({ ok: false, error: "Failed to create post" }, { status: 500 });
  }
}
