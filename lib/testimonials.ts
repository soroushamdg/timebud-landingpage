import "server-only";
import { and, asc, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db/client";
import {
  testimonials,
  type NewTestimonial,
  type PublicTestimonial,
  type Testimonial,
} from "@/db/schema";

export const CONSENT_TEXT =
  "I used TimeBud, this is my own opinion, and TimeBud may publish it with my first name and role.";

export const MAX_QUOTE = 280;
export const MIN_QUOTE = 40;

/**
 * Public read. Selects an explicit column list rather than the whole row so a
 * later schema change can never quietly start leaking the email or the IP hash
 * into a public response.
 */
export async function getApprovedTestimonials(): Promise<PublicTestimonial[]> {
  return db
    .select({
      id: testimonials.id,
      quote: testimonials.quote,
      name: testimonials.name,
      role: testimonials.role,
      usedFor: testimonials.usedFor,
      featured: testimonials.featured,
      displayOrder: testimonials.displayOrder,
    })
    .from(testimonials)
    .where(eq(testimonials.status, "approved"))
    .orderBy(desc(testimonials.featured), asc(testimonials.displayOrder), desc(testimonials.createdAt));
}

export async function getTestimonialsForAdmin(status?: Testimonial["status"]): Promise<Testimonial[]> {
  const q = db.select().from(testimonials);
  const rows = status
    ? await q.where(eq(testimonials.status, status)).orderBy(desc(testimonials.createdAt))
    : await q.orderBy(desc(testimonials.createdAt));
  return rows;
}

export async function countPendingTestimonials(): Promise<number> {
  const rows = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(testimonials)
    .where(eq(testimonials.status, "pending"));
  return rows[0]?.n ?? 0;
}

export async function createTestimonial(input: NewTestimonial): Promise<Testimonial> {
  const rows = await db.insert(testimonials).values(input).returning();
  return rows[0]!;
}

export async function updateTestimonial(
  id: string,
  patch: Partial<NewTestimonial>
): Promise<Testimonial | null> {
  const rows = await db
    .update(testimonials)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(testimonials.id, id))
    .returning();
  return rows[0] ?? null;
}

/**
 * Hard delete, for a person exercising their right to erasure. Moderation uses
 * status changes; this is the only path that actually removes the row, and it
 * is the one to call when someone emails asking to be taken down.
 */
export async function deleteTestimonial(id: string): Promise<void> {
  await db.delete(testimonials).where(eq(testimonials.id, id));
}

/**
 * Retention. Rejected and spam rows still hold a name and an email, and there
 * is no reason to keep them once the decision is made. Call from a cron route
 * or run by hand; either way the policy lives in one place.
 */
export async function purgeOldRejected(olderThanDays = 90): Promise<number> {
  const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
  const rows = await db
    .delete(testimonials)
    .where(
      and(
        sql`${testimonials.status} in ('rejected','spam')`,
        sql`${testimonials.updatedAt} < ${cutoff.toISOString()}`
      )
    )
    .returning({ id: testimonials.id });
  return rows.length;
}

/** How many submissions this hashed IP has made inside the window. */
export async function recentSubmissionCount(ipHash: string, windowMs: number): Promise<number> {
  const since = new Date(Date.now() - windowMs);
  const rows = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(testimonials)
    .where(and(eq(testimonials.ipHash, ipHash), gte(testimonials.createdAt, since)));
  return rows[0]?.n ?? 0;
}

export type ValidationResult = { ok: true } | { ok: false; errors: Record<string, string> };

/** Server-side mirror of the dialog's rules. The browser copy is a convenience. */
export function validateSubmission(input: {
  quote?: unknown;
  name?: unknown;
  email?: unknown;
  consent?: unknown;
}): ValidationResult {
  const errors: Record<string, string> = {};
  const quote = typeof input.quote === "string" ? input.quote.trim() : "";
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";

  if (quote.length < MIN_QUOTE) errors.quote = `Tell us a bit more — at least ${MIN_QUOTE} characters.`;
  else if (quote.length > MAX_QUOTE) errors.quote = `Keep it under ${MAX_QUOTE} characters.`;
  if (!name) errors.name = "Add the name you want shown.";
  else if (name.length > 80) errors.name = "That name is too long.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "That email address does not look right.";
  if (input.consent !== true) errors.consent = "We can only publish this with your permission.";

  return Object.keys(errors).length ? { ok: false, errors } : { ok: true };
}
