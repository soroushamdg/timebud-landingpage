import { NextResponse } from "next/server";
import { deletePost, getOtherPublishedPosts, getPostById, getPostBySlugExcludingId, updatePost } from "@/lib/posts";
import { slugify } from "@/lib/slug";
import { generateSeoMetadata } from "@/lib/anthropic";

export const dynamic = "force-dynamic";

const VALID_STATUSES = ["draft", "scheduled", "published", "hidden"] as const;

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const post = await getPostById(params.id);
  if (!post) {
    return NextResponse.json({ ok: false, error: "Post not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, post });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const existing = await getPostById(params.id);
  if (!existing) {
    return NextResponse.json({ ok: false, error: "Post not found" }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};

  if (typeof body.title === "string") {
    const title = body.title.trim();
    if (!title) {
      return NextResponse.json({ ok: false, error: "Title cannot be empty" }, { status: 400 });
    }
    updates.title = title;
  }

  if (typeof body.content === "string") {
    if (!body.content.trim()) {
      return NextResponse.json({ ok: false, error: "Content cannot be empty" }, { status: 400 });
    }
    updates.content = body.content;
  }

  if (typeof body.slug === "string" && body.slug.trim()) {
    const slug = slugify(body.slug);
    if (!slug) {
      return NextResponse.json({ ok: false, error: "Could not derive a valid slug" }, { status: 400 });
    }
    const conflict = await getPostBySlugExcludingId(slug, params.id);
    if (conflict) {
      return NextResponse.json(
        { ok: false, error: `Slug "${slug}" is already in use` },
        { status: 409 }
      );
    }
    updates.slug = slug;
  }

  if (typeof body.excerpt === "string") updates.excerpt = body.excerpt;
  if (typeof body.seoTitle === "string") updates.seoTitle = body.seoTitle;
  if (typeof body.description === "string") updates.description = body.description;
  if (typeof body.ogDescription === "string") updates.ogDescription = body.ogDescription;
  if (typeof body.coverImageUrl === "string") updates.coverImageUrl = body.coverImageUrl;
  if (typeof body.coverImageAlt === "string") updates.coverImageAlt = body.coverImageAlt;
  if (typeof body.ogImageUrl === "string") updates.ogImageUrl = body.ogImageUrl;
  if (Array.isArray(body.tags)) {
    updates.tags = body.tags.filter((t): t is string => typeof t === "string");
  }
  if (Array.isArray(body.relatedSlugs)) {
    updates.relatedSlugs = body.relatedSlugs.filter((s): s is string => typeof s === "string");
  }
  if (Array.isArray(body.internalLinkSuggestions)) {
    updates.internalLinkSuggestions = body.internalLinkSuggestions;
  }
  if ((VALID_STATUSES as readonly string[]).includes(body.status as string)) {
    updates.status = body.status;
  }
  if (typeof body.scheduledAt === "string" && body.scheduledAt) {
    updates.scheduledAt = new Date(body.scheduledAt);
  } else if (body.scheduledAt === null) {
    updates.scheduledAt = null;
  }

  const finalStatus = (updates.status as string | undefined) ?? existing.status;
  if (finalStatus === "scheduled" && !((updates.scheduledAt as Date | null | undefined) ?? existing.scheduledAt)) {
    return NextResponse.json({ ok: false, error: "scheduledAt is required for scheduled posts" }, { status: 400 });
  }

  const finalSeoTitle = (updates.seoTitle as string | undefined) ?? existing.seoTitle;
  const finalDescription = (updates.description as string | undefined) ?? existing.description;

  // Going live (published or scheduled) without SEO fields filled in triggers
  // AI generation automatically — non-fatal: if the AI call fails, the save
  // still succeeds.
  if ((finalStatus === "published" || finalStatus === "scheduled") && (!finalSeoTitle || !finalDescription)) {
    try {
      const otherPosts = await getOtherPublishedPosts(existing.id);
      const result = await generateSeoMetadata({
        title: (updates.title as string | undefined) ?? existing.title,
        content: (updates.content as string | undefined) ?? existing.content,
        coverImageUrl: (updates.coverImageUrl as string | undefined) ?? existing.coverImageUrl,
        otherPosts,
      });
      updates.seoTitle = finalSeoTitle ?? result.seoTitle;
      updates.description = finalDescription ?? result.metaDescription;
      updates.ogDescription = (updates.ogDescription as string | undefined) ?? existing.ogDescription ?? result.ogDescription;
      updates.excerpt = (updates.excerpt as string | undefined) ?? existing.excerpt ?? result.excerpt;
      updates.coverImageAlt =
        (updates.coverImageAlt as string | undefined) ?? existing.coverImageAlt ?? (result.coverImageAlt || null);
      const finalTags = (updates.tags as string[] | undefined) ?? existing.tags;
      if (finalTags.length === 0) updates.tags = result.tags;
      const finalRelatedSlugs = (updates.relatedSlugs as string[] | undefined) ?? existing.relatedSlugs;
      if (finalRelatedSlugs.length === 0) updates.relatedSlugs = result.relatedSlugs;
      const finalLinkSuggestions =
        (updates.internalLinkSuggestions as unknown[] | undefined) ?? existing.internalLinkSuggestions;
      if (finalLinkSuggestions.length === 0) updates.internalLinkSuggestions = result.internalLinkSuggestions;
      updates.aiMeta = result;
    } catch (err) {
      console.error("Auto SEO generation failed, saving without it:", err);
    }
  }

  try {
    const post = await updatePost(params.id, updates);
    return NextResponse.json({ ok: true, post });
  } catch (err) {
    console.error("Failed to update post:", err);
    return NextResponse.json({ ok: false, error: "Failed to update post" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const existing = await getPostById(params.id);
  if (!existing) {
    return NextResponse.json({ ok: false, error: "Post not found" }, { status: 404 });
  }

  try {
    await deletePost(params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to delete post:", err);
    return NextResponse.json({ ok: false, error: "Failed to delete post" }, { status: 500 });
  }
}
