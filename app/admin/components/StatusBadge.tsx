"use client";

import type { Post } from "@/db/schema";

// Formatting scheduledAt must happen client-side: the dashboard page itself
// is a Server Component, and `toLocaleString()` there would run on Vercel's
// server (UTC), not the admin's browser — showing a different time than what
// was actually picked in the (browser-local) datetime-local input.
export function StatusBadge({ status, scheduledAt }: { status: Post["status"]; scheduledAt: Date | string | null }) {
  const label =
    status === "scheduled" && scheduledAt ? `scheduled · ${new Date(scheduledAt).toLocaleString()}` : status;

  return (
    <span
      className="pixel-tag"
      style={{
        background: status === "published" ? "var(--black)" : "var(--yellow)",
        color: status === "published" ? "var(--yellow)" : "var(--black)",
      }}
    >
      {label}
    </span>
  );
}
