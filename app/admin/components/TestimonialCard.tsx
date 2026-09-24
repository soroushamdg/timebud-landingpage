"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Testimonial } from "@/db/schema";

function formatDate(value: Date | string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [quote, setQuote] = useState(testimonial.quote);
  const [role, setRole] = useState(testimonial.role ?? "");

  const wasEdited = testimonial.quote !== testimonial.originalQuote;

  async function send(patch: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/testimonials/${testimonial.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error ?? "That did not save.");
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "That did not save.");
    } finally {
      setBusy(false);
    }
  }

  async function erase() {
    // Confirmation Dialogs (ux, severity High): destructive and irreversible,
    // so it asks first and says exactly what will happen.
    const ok = window.confirm(
      `Permanently delete ${testimonial.name}'s submission, including their email address? This cannot be undone. Use "Turn down" instead if you only want to keep it off the site.`
    );
    if (!ok) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/testimonials/${testimonial.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Could not delete that.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete that.");
      setBusy(false);
    }
  }

  return (
    <article className="card">
      <div className="spread">
        <div className="row">
          <span className="chip" data-s={testimonial.status}>
            {testimonial.status}
          </span>
          {testimonial.featured === 1 ? (
            <span className="chip" data-s="featured">
              Featured
            </span>
          ) : null}
        </div>
        <p className="lbl">{formatDate(testimonial.createdAt)}</p>
      </div>

      {editing ? (
        <div className="stack">
          <div className="fld">
            <label htmlFor={`q-${testimonial.id}`}>Quote as published</label>
            <textarea
              id={`q-${testimonial.id}`}
              value={quote}
              maxLength={280}
              onChange={(e) => setQuote(e.target.value)}
            />
            <p className="muted">{quote.length} / 280</p>
          </div>
          <div className="fld">
            <label htmlFor={`r-${testimonial.id}`}>Role as published</label>
            <input id={`r-${testimonial.id}`} value={role} onChange={(e) => setRole(e.target.value)} />
          </div>
          <div className="row">
            <button className="key key--sm" disabled={busy} onClick={() => send({ quote, role })}>
              Save edit
            </button>
            <button
              className="key key--ghost key--sm"
              disabled={busy}
              onClick={() => {
                setQuote(testimonial.quote);
                setRole(testimonial.role ?? "");
                setEditing(false);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <blockquote>&ldquo;{testimonial.quote}&rdquo;</blockquote>
      )}

      <p className="muted">
        <strong style={{ color: "var(--ink)" }}>{testimonial.name}</strong>
        {testimonial.role ? ` · ${testimonial.role}` : ""}
        {testimonial.usedFor ? ` · used it ${testimonial.usedFor}` : ""}
      </p>

      {wasEdited && !editing ? (
        <div className="edited">
          <p className="lbl" style={{ marginBottom: 4 }}>Their original wording</p>
          {testimonial.originalQuote}
        </div>
      ) : null}

      {error ? <p style={{ color: "var(--pk)", fontWeight: 700, margin: 0 }}>{error}</p> : null}

      <div className="row">
        {testimonial.status !== "approved" ? (
          <button className="key key--good key--sm" disabled={busy} onClick={() => send({ status: "approved" })}>
            Put it on the site
          </button>
        ) : (
          <button className="key key--ghost key--sm" disabled={busy} onClick={() => send({ status: "pending" })}>
            Take it down
          </button>
        )}
        <button className="key key--ghost key--sm" disabled={busy} onClick={() => setEditing((v) => !v)}>
          {editing ? "Stop editing" : "Edit wording"}
        </button>
        <button
          className="key key--ghost key--sm"
          disabled={busy}
          onClick={() => send({ featured: testimonial.featured !== 1 })}
        >
          {testimonial.featured === 1 ? "Unfeature" : "Feature"}
        </button>
        {testimonial.status !== "rejected" ? (
          <button className="key key--ghost key--sm" disabled={busy} onClick={() => send({ status: "rejected" })}>
            Turn down
          </button>
        ) : null}
        {testimonial.status !== "spam" ? (
          <button className="key key--ghost key--sm" disabled={busy} onClick={() => send({ status: "spam" })}>
            Spam
          </button>
        ) : null}
        <button className="key key--danger key--sm" disabled={busy} onClick={erase}>
          Delete for good
        </button>
      </div>

      <details>
        <summary className="lbl" style={{ cursor: "pointer", padding: "6px 0" }}>
          Consent and provenance
        </summary>
        <div className="provenance">
          <span>email · {testimonial.email}</span>
          <span>consented · {formatDate(testimonial.consentAt)}</span>
          <span>agreed to · {testimonial.consentText}</span>
          <span>submitted from · {testimonial.sourcePath ?? "unknown"}</span>
          <span>ip hash · {testimonial.ipHash ? `${testimonial.ipHash.slice(0, 16)}…` : "not recorded"}</span>
          <span>reviewed · {formatDate(testimonial.reviewedAt)}</span>
        </div>
      </details>
    </article>
  );
}
