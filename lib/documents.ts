import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { documents, type NewTbDocument, type TbDocument } from "@/db/schema";

export async function getPublishedDocuments(): Promise<TbDocument[]> {
  return db.select().from(documents).where(eq(documents.published, 1)).orderBy(asc(documents.displayOrder));
}

export async function getDocumentBySlug(slug: string): Promise<TbDocument | null> {
  const rows = await db.select().from(documents).where(eq(documents.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function getAllDocuments(): Promise<TbDocument[]> {
  return db.select().from(documents).orderBy(asc(documents.displayOrder));
}

export async function createDocument(input: NewTbDocument): Promise<TbDocument> {
  const rows = await db.insert(documents).values(input).returning();
  return rows[0]!;
}

export async function updateDocument(
  id: string,
  patch: Partial<NewTbDocument>
): Promise<TbDocument | null> {
  const rows = await db
    .update(documents)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(documents.id, id))
    .returning();
  return rows[0] ?? null;
}

export async function deleteDocument(id: string): Promise<void> {
  await db.delete(documents).where(eq(documents.id, id));
}
