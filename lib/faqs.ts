import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { faqs, type Faq, type NewFaq } from "@/db/schema";

export async function getPublishedFaqs(): Promise<Faq[]> {
  return db.select().from(faqs).where(eq(faqs.published, 1)).orderBy(asc(faqs.displayOrder));
}

export async function getAllFaqs(): Promise<Faq[]> {
  return db.select().from(faqs).orderBy(asc(faqs.displayOrder));
}

export async function createFaq(input: NewFaq): Promise<Faq> {
  const rows = await db.insert(faqs).values(input).returning();
  return rows[0]!;
}

export async function updateFaq(id: string, patch: Partial<NewFaq>): Promise<Faq | null> {
  const rows = await db
    .update(faqs)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(faqs.id, id))
    .returning();
  return rows[0] ?? null;
}

export async function deleteFaq(id: string): Promise<void> {
  await db.delete(faqs).where(eq(faqs.id, id));
}

/**
 * Swaps one row with its neighbour. Dragging Movements (ux, WCAG 2.2 AA,
 * severity High): reordering must not require a drag, so ordering is exposed
 * as discrete Move up / Move down actions rather than only a drag handle.
 */
export async function moveFaq(id: string, direction: -1 | 1): Promise<boolean> {
  const all = await getAllFaqs();
  const index = all.findIndex((f) => f.id === id);
  if (index === -1) return false;
  const target = index + direction;
  if (target < 0 || target >= all.length) return false;

  const a = all[index]!;
  const b = all[target]!;
  await updateFaq(a.id, { displayOrder: b.displayOrder });
  await updateFaq(b.id, { displayOrder: a.displayOrder });
  return true;
}

/** Normalises display_order to 0..n-1 so swaps stay meaningful after deletes. */
export async function resequenceFaqs(): Promise<void> {
  const all = await getAllFaqs();
  for (let i = 0; i < all.length; i++) {
    if (all[i]!.displayOrder !== i) await updateFaq(all[i]!.id, { displayOrder: i });
  }
}

export const _internal = { and };
