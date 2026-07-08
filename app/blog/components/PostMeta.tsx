function formatDate(date: Date | string | null): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function PostMeta({
  publishedAt,
  updatedAt,
  readingTimeMinutes,
}: {
  publishedAt: Date | string | null;
  updatedAt: Date | string | null;
  readingTimeMinutes: number;
}) {
  const published = formatDate(publishedAt);
  const updated = formatDate(updatedAt);
  const showUpdated = updated && updated !== published;

  return (
    <p style={{ fontSize: "0.875rem", opacity: 0.75, margin: 0 }}>
      {published}
      {showUpdated ? ` · Updated ${updated}` : ""}
      {" · "}
      {readingTimeMinutes} min read
    </p>
  );
}
