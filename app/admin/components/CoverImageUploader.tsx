"use client";

import { useRef, useState } from "react";

export function CoverImageUploader({
  url,
  alt,
  onUploaded,
}: {
  url: string;
  alt: string;
  onUploaded: (data: { url: string; ogUrl?: string }) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("kind", "cover");
      const res = await fetch("/api/admin/upload-image", { method: "POST", body: form });
      const data = await res.json();
      if (data.ok) {
        onUploaded({ url: data.url, ogUrl: data.ogUrl });
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
    <div>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={alt}
          style={{
            width: "100%",
            height: "140px",
            objectFit: "cover",
            border: "3px solid var(--black)",
            marginBottom: "0.75rem",
          }}
        />
      ) : null}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        disabled={uploading}
        style={{ fontSize: "0.75rem", width: "100%" }}
      />
      {uploading && <p style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>Uploading &amp; resizing…</p>}
      {error && (
        <p
          className="error-msg"
          style={{ fontSize: "0.8rem", borderLeft: "4px solid #000", paddingLeft: "0.5rem", marginTop: "0.5rem" }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
