"use client";

import { useState, useRef } from "react";
import { useLanguage } from "./LanguageProvider";
import { translations } from "@/app/i18n/translations";

type State = "idle" | "loading" | "success" | "error";

export default function WaitlistForm() {
  const { lang } = useLanguage();
  const s = translations[lang];
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const email = inputRef.current?.value.trim() ?? "";
    if (!email) return;

    setState("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.ok) {
        setState("success");
        if (inputRef.current) inputRef.current.value = "";
      } else {
        setState("error");
        setErrorMsg(data.error ?? "Something went wrong.");
      }
    } catch {
      setState("error");
      setErrorMsg("Network error. Please try again.");
    }
  }

  if (state === "success") {
    return (
      <div
        className="pixel-border inline-block px-6 py-4 bg-black text-yellow"
        style={{ fontFamily: "var(--font-pixel), monospace", fontSize: "0.7rem", lineHeight: 1.8 }}
      >
        {s.successMsg}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div style={{ display: "flex", gap: "0" }}>
        <input
          ref={inputRef}
          type="email"
          placeholder={s.emailPlaceholder}
          required
          disabled={state === "loading"}
          className="pixel-input"
          style={{ flex: 1, minWidth: 0 }}
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="pixel-btn"
          style={{ whiteSpace: "nowrap", fontSize: "0.9rem", fontFamily: "var(--font-body), sans-serif", fontWeight: 700, padding: "0 1.25rem" }}
        >
          {state === "loading" ? "..." : "→"}
        </button>
      </div>

      {state === "error" && (
        <p
          className="error-msg"
          style={{
            fontFamily: "var(--font-body), sans-serif",
            fontSize: "0.875rem",
            fontWeight: 700,
            color: "#000",
            borderLeft: "4px solid #000",
            paddingLeft: "0.75rem",
          }}
        >
          {errorMsg}
        </p>
      )}
    </form>
  );
}
