"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TbDocument } from "@/db/schema";

export function DocumentManager({ initial }: { initial: TbDocument[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ title: "", body: "" });
  const [creating, setCreating] = useState({ title: "", body: "" });

  async function call(url: string, init: RequestInit) {
    setBusy(true);
    setError(null);
    setSaved(null);
    try {
      const res = await fetch(url, init);
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.ok === false) throw new Error(data.error ?? "That did not save.");
      router.refresh();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "That did not save.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="stack">
      {error ? <p style={{ color: "var(--pk)", fontWeight: 700 }}>{error}</p> : null}
      {/* Confirmation Messages (ux, Medium): a silent save leaves you wondering. */}
      {saved ? <p style={{ color: "var(--gr-d)", fontWeight: 700 }}>{saved}</p> : null}

      {initial.length === 0 ? (
        <p className="empty">No pages yet. Add privacy, terms and the rest below.</p>
      ) : (
        initial.map((doc) => (
          <article className="card" key={doc.id}>
            <div className="spread">
              <div>
                <strong style={{ fontSize: 17 }}>{doc.title}</strong>
                <p className="muted" style={{ marginTop: 4 }}>/{doc.slug}</p>
              </div>
              <span className="chip" data-s={doc.published === 1 ? "approved" : "rejected"}>
                {doc.published === 1 ? "Live" : "Hidden"}
              </span>
            </div>

            {openId === doc.id ? (
              <div className="stack">
                <div className="fld">
                  <label htmlFor={`dt-${doc.id}`}>Title</label>
                  <input
                    id={`dt-${doc.id}`}
                    value={draft.title}
                    onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                  />
                </div>
                <div className="fld">
                  <label htmlFor={`db-${doc.id}`}>Body (markdown)</label>
                  <textarea
                    id={`db-${doc.id}`}
                    style={{ minHeight: 300, fontFamily: "var(--font-mono), ui-monospace, monospace" }}
                    value={draft.body}
                    onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
                  />
                </div>
                <div className="row">
                  <button
                    className="key key--sm"
                    disabled={busy}
                    onClick={async () => {
                      const ok = await call(`/api/admin/documents/${doc.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(draft),
                      });
                      if (ok) {
                        setOpenId(null);
                        setSaved(`Saved “${draft.title}”.`);
                      }
                    }}
                  >
                    Save page
                  </button>
                  <button className="key key--ghost key--sm" onClick={() => setOpenId(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="row">
                <button
                  className="key key--ghost key--sm"
                  onClick={() => {
                    setOpenId(doc.id);
                    setDraft({ title: doc.title, body: doc.body });
                  }}
                >
                  Edit
                </button>
                <button
                  className="key key--ghost key--sm"
                  disabled={busy}
                  onClick={() =>
                    call(`/api/admin/documents/${doc.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ published: doc.published !== 1 }),
                    })
                  }
                >
                  {doc.published === 1 ? "Hide" : "Publish"}
                </button>
                <button
                  className="key key--danger key--sm"
                  disabled={busy}
                  onClick={() => {
                    if (!window.confirm(`Delete "${doc.title}"? This cannot be undone.`)) return;
                    call(`/api/admin/documents/${doc.id}`, { method: "DELETE" });
                  }}
                >
                  Delete
                </button>
              </div>
            )}
          </article>
        ))
      )}

      <article className="card">
        <p className="lbl">Add a page</p>
        <div className="fld">
          <label htmlFor="nd-title">Title</label>
          <input
            id="nd-title"
            value={creating.title}
            onChange={(e) => setCreating((c) => ({ ...c, title: e.target.value }))}
            placeholder="Privacy policy"
          />
        </div>
        <div className="fld">
          <label htmlFor="nd-body">Body (markdown)</label>
          <textarea
            id="nd-body"
            style={{ minHeight: 180, fontFamily: "var(--font-mono), ui-monospace, monospace" }}
            value={creating.body}
            onChange={(e) => setCreating((c) => ({ ...c, body: e.target.value }))}
          />
        </div>
        <div className="row">
          <button
            className="key"
            disabled={busy}
            onClick={async () => {
              if (!creating.title.trim() || !creating.body.trim()) {
                setError("A title and a body are both needed.");
                return;
              }
              const ok = await call("/api/admin/documents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(creating),
              });
              if (ok) {
                setSaved(`Created “${creating.title}”.`);
                setCreating({ title: "", body: "" });
              }
            }}
          >
            Add page
          </button>
        </div>
      </article>
    </div>
  );
}
