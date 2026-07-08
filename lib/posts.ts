import "server-only";
import { and, desc, eq, inArray, lte, ne, or, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { posts, type NewPost, type Post } from "@/db/schema";
import { computeReadingTimeMinutes } from "./reading-time";

// A post is publicly visible if it's explicitly published, or scheduled and
// its scheduled time has passed — checked at read time so no cron job is
// needed to flip status='scheduled' to 'published' in the background.
const isEffectivelyLive = or(
  eq(posts.status, "published"),
  and(eq(posts.status, "scheduled"), lte(posts.scheduledAt, new Date()))
);

export async function getPublishedPosts(): Promise<Post[]> {
  return db.select().from(posts).where(isEffectivelyLive).orderBy(desc(posts.publishedAt));
}

export async function getPublishedPostBySlug(slug: string): Promise<Post | null> {
  const rows = await db
    .select()
    .from(posts)
    .where(and(eq(posts.slug, slug), isEffectivelyLive))
    .limit(1);
  return rows[0] ?? null;
}

/** Looks up a live post by a slug it *used* to have, for 301-redirecting old URLs. */
export async function getPublishedPostByPreviousSlug(slug: string): Promise<Post | null> {
  const rows = await db
    .select()
    .from(posts)
    .where(and(isEffectivelyLive, sql`${posts.previousSlugs} @> ${JSON.stringify([slug])}::jsonb`))
    .limit(1);
  return rows[0] ?? null;
}

export async function getRelatedPosts(post: Post): Promise<Post[]> {
  if (post.relatedSlugs.length === 0) return [];
  const rows = await db
    .select()
    .from(posts)
    .where(and(isEffectivelyLive, inArray(posts.slug, post.relatedSlugs)));
  // Preserve the AI's relevance ordering rather than the DB's arbitrary order.
  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  return post.relatedSlugs.map((slug) => bySlug.get(slug)).filter((p): p is Post => Boolean(p));
}

/** Other live posts, for giving the AI SEO step candidates to relate/link to. */
export async function getOtherPublishedPosts(
  excludeId?: string
): Promise<Array<{ slug: string; title: string; excerpt: string | null }>> {
  const rows = await db
    .select({ slug: posts.slug, title: posts.title, excerpt: posts.excerpt })
    .from(posts)
    .where(excludeId ? and(isEffectivelyLive, ne(posts.id, excludeId)) : isEffectivelyLive);
  return rows;
}

export async function getAllPostsForAdmin(): Promise<Post[]> {
  return db.select().from(posts).orderBy(desc(posts.createdAt));
}

export async function getPostById(id: string): Promise<Post | null> {
  const rows = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getPostBySlugExcludingId(
  slug: string,
  excludeId?: string
): Promise<Post | null> {
  const rows = await db
    .select()
    .from(posts)
    .where(excludeId ? and(eq(posts.slug, slug), ne(posts.id, excludeId)) : eq(posts.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

function computePublishedAtForCreate(status: string, scheduledAt: Date | null | undefined): Date | null {
  if (status === "published") return new Date();
  if (status === "scheduled") return scheduledAt ?? null;
  return null;
}

export async function createPost(data: Omit<NewPost, "id" | "readingTimeMinutes">): Promise<Post> {
  const [row] = await db
    .insert(posts)
    .values({
      ...data,
      readingTimeMinutes: computeReadingTimeMinutes(data.content),
      publishedAt: computePublishedAtForCreate(data.status ?? "hidden", data.scheduledAt),
    })
    .returning();
  return row;
}

export async function updatePost(
  id: string,
  data: Partial<Omit<NewPost, "id">>
): Promise<Post | null> {
  const existing = await getPostById(id);
  if (!existing) return null;

  // Track slug history so old URLs can 301-redirect instead of 404ing.
  if (data.slug && data.slug !== existing.slug) {
    const history = new Set(existing.previousSlugs);
    history.add(existing.slug);
    data.previousSlugs = Array.from(history);
  }

  let publishedAt: Date | null | undefined;
  if (data.status === "scheduled") {
    publishedAt = (data.scheduledAt as Date | null | undefined) ?? existing.scheduledAt ?? null;
  } else if (data.status === "published" && existing.status !== "published" && existing.status !== "hidden") {
    // draft -> published, or scheduled -> published (manual "publish now" override).
    publishedAt = new Date();
  }
  // hidden -> published (unhide) intentionally leaves publishedAt untouched,
  // preserving the original publish date instead of resetting it to now.

  const [row] = await db
    .update(posts)
    .set({
      ...data,
      readingTimeMinutes:
        data.content !== undefined ? computeReadingTimeMinutes(data.content) : undefined,
      updatedAt: new Date(),
      publishedAt,
    })
    .where(eq(posts.id, id))
    .returning();
  return row ?? null;
}

export async function deletePost(id: string): Promise<void> {
  await db.delete(posts).where(eq(posts.id, id));
}
