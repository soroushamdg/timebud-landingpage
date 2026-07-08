"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Post } from "@/db/schema";

export function PostRowActions({
  postId,
  status,
}: {
  postId: string;
  status: Post["status"];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function setStatus(newStatus: Post["status"]) {
    setBusy(true);
    try {
      await fetch(`/api/admin/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this post? This can't be undone.")) return;
    setBusy(true);
    try {
      await fetch(`/api/admin/posts/${postId}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0, flexWrap: "wrap" }}>
      <Link href={`/admin/${postId}/edit`} className="pixel-btn-outline" style={{ fontSize: "0.8rem", padding: "0.5rem 0.9rem" }}>
        Edit
      </Link>

      {status === "published" ? (
        <button
          onClick={() => setStatus("hidden")}
          disabled={busy}
          className="pixel-btn-outline"
          style={{ fontSize: "0.8rem", padding: "0.5rem 0.9rem", cursor: "pointer" }}
        >
          Hide
        </button>
      ) : (
        <button
          onClick={() => setStatus("published")}
          disabled={busy}
          className="pixel-btn-outline"
          style={{ fontSize: "0.8rem", padding: "0.5rem 0.9rem", cursor: "pointer" }}
        >
          {status === "hidden" ? "Publish" : "Publish now"}
        </button>
      )}

      <button
        onClick={handleDelete}
        disabled={busy}
        style={{
          fontSize: "0.8rem",
          padding: "0.5rem 0.9rem",
          border: "3px solid var(--black)",
          background: "var(--yellow)",
          color: "#b91c1c",
          cursor: "pointer",
          fontFamily: "var(--font-body), sans-serif",
          fontWeight: 700,
        }}
      >
        Delete
      </button>
    </div>
  );
}
