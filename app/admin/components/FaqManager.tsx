"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Faq } from "@/db/schema";

export function FaqManager({ initial }: { initial: Faq[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ question: "", answer: "" });

  async function call(url: string, init: RequestInit) {
    setBusy(true);
    setError(null);
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

  async function add() {
    if (!question.trim() || !answer.trim()) {
      setError("A question and an answer are both needed.");
      return;
    }
    const ok = await call("/api/admin/faqs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, answer }),
    });
    if (ok) {
      setQuestion("");
      setAnswer("");
    }
  }

  return (
    <div className="stack">
      {error ? <p style={{ color: "var(--pk)", fontWeight: 700 }}>{error}</p> : null}

      {initial.length === 0 ? (
        <p className="empty">No questions yet. Add the first one below.</p>
      ) : (
        initial.map((faq, index) => (
          <article className="card" key={faq.id}>
            {editingId === faq.id ? (
              <div className="stack">
                <div className="fld">
                  <label htmlFor={`fq-${faq.id}`}>Question</label>
                  <input
                    id={`fq-${faq.id}`}
                    value={draft.question}
                    onChange={(e) => setDraft((d) => ({ ...d, question: e.target.value }))}
                  />
                </div>
                <div className="fld">
                  <label htmlFor={`fa-${faq.id}`}>Answer</label>
                  <textarea
                    id={`fa-${faq.id}`}
                    value={draft.answer}
                    onChange={(e) => setDraft((d) => ({ ...d, answer: e.target.value }))}
                  />
                </div>
                <div className="row">
                  <button
                    className="key key--sm"
                    disabled={busy}
                    onClick={async () => {
                      const ok = await call(`/api/admin/faqs/${faq.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(draft),
                      });
                      if (ok) setEditingId(null);
                    }}
                  >
                    Save
                  </button>
                  <button className="key key--ghost key--sm" onClick={() => setEditingId(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="spread">
                  <strong style={{ fontSize: 17 }}>{faq.question}</strong>
                  <span className="chip" data-s={faq.published === 1 ? "approved" : "rejected"}>
                    {faq.published === 1 ? "Live" : "Hidden"}
                  </span>
                </div>
                <p className="muted">{faq.answer}</p>
              </>
            )}

            <div className="row">
              {/* Dragging Movements (ux, WCAG 2.2 AA, High): a drag handle can
                  never be the only way to reorder, so ordering lives here. */}
              <button
                className="key key--ghost key--sm"
                disabled={busy || index === 0}
                onClick={() =>
                  call(`/api/admin/faqs/${faq.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ move: "up" }),
                  })
                }
              >
                ↑ Move up
              </button>
              <button
                className="key key--ghost key--sm"
                disabled={busy || index === initial.length - 1}
                onClick={() =>
                  call(`/api/admin/faqs/${faq.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ move: "down" }),
                  })
                }
              >
                ↓ Move down
              </button>
              <button
                className="key key--ghost key--sm"
                disabled={busy}
                onClick={() => {
                  setEditingId(faq.id);
                  setDraft({ question: faq.question, answer: faq.answer });
                }}
              >
                Edit
              </button>
              <button
                className="key key--ghost key--sm"
                disabled={busy}
                onClick={() =>
                  call(`/api/admin/faqs/${faq.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ published: faq.published !== 1 }),
                  })
                }
              >
                {faq.published === 1 ? "Hide" : "Publish"}
              </button>
              <button
                className="key key--danger key--sm"
                disabled={busy}
                onClick={() => {
                  if (!window.confirm(`Delete "${faq.question}"? This cannot be undone.`)) return;
                  call(`/api/admin/faqs/${faq.id}`, { method: "DELETE" });
                }}
              >
                Delete
              </button>
            </div>
          </article>
        ))
      )}

      <article className="card">
        <p className="lbl">Add a question</p>
        <div className="fld">
          <label htmlFor="new-q">Question</label>
          <input
            id="new-q"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Is this another to-do app?"
          />
        </div>
        <div className="fld">
          <label htmlFor="new-a">Answer</label>
          <textarea id="new-a" value={answer} onChange={(e) => setAnswer(e.target.value)} />
        </div>
        <div className="row">
          <button className="key" disabled={busy} onClick={add}>
            Add question
          </button>
        </div>
      </article>
    </div>
  );
}
