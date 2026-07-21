"use client";

// Same reasoning as StatusBadge: format client-side so the date matches the
// admin's own browser timezone instead of Vercel's server clock (UTC).
export function PublishedDate({ publishedAt }: { publishedAt: Date | string | null }) {
  if (!publishedAt) return null;
  return <>Published {new Date(publishedAt).toLocaleString()}</>;
}
