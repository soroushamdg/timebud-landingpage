"use client";

import { useEffect, useRef, useState } from "react";

interface MediaItem {
  url: string;
  uploadedAt: string;
  size: number;
}

export function MediaPanel({ onInsert }: { onInsert: (markdownSnippet: string) => void }) {
  const [images, setImages] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function loadImages() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/media");
      const data = await res.json();
      if (data.ok) setImages(data.images);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadImages();
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("kind", "content");
      const res = await fetch("/api/admin/upload-image", { method: "POST", body: form });
      const data = await res.json();
      if (data.ok) {
        onInsert(`\n\n![](${data.url})\n\n`);
        await loadImages();
      } else {
        setError(data.error ?? "Upload failed");
      }
    } catch {
      setError("Network error during upload");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="pixel-border" style={{ padding: "1.25rem", background: "var(--yellow)" }}>
      <p className="display-font" style={{ fontSize: "0.7rem", marginBottom: "1rem" }}>
        Media
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
        style={{ fontSize: "0.75rem", width: "100%", marginBottom: "0.75rem" }}
      />
      {uploading && <p style={{ fontSize: "0.8rem" }}>Uploading &amp; resizing…</p>}
      {error && (
        <p
          className="error-msg"
          style={{ fontSize: "0.8rem", borderLeft: "4px solid #000", paddingLeft: "0.5rem" }}
        >
          {error}
        </p>
      )}

      <p style={{ fontSize: "0.7rem", opacity: 0.7, margin: "0.5rem 0" }}>
        Click an image to insert it into the post.
      </p>

      {loading ? (
        <p style={{ fontSize: "0.8rem" }}>Loading…</p>
      ) : images.length === 0 ? (
        <p style={{ fontSize: "0.8rem", opacity: 0.7 }}>No images uploaded yet.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.5rem",
            maxHeight: "360px",
            overflowY: "auto",
          }}
        >
          {images.map((img) => (
            <button
              key={img.url}
              onClick={() => onInsert(`\n\n![](${img.url})\n\n`)}
              title="Insert into post"
              style={{ padding: 0, border: "2px solid var(--black)", cursor: "pointer", background: "none" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" style={{ width: "100%", height: "70px", objectFit: "cover", display: "block" }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
