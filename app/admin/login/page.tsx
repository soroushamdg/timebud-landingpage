"use client";

import { useRef, useState } from "react";

type State = "idle" | "loading" | "error";

export default function AdminLoginPage() {
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const password = inputRef.current?.value ?? "";
    if (!password) return;

    setState("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (data.ok) {
        // Hard navigation — see PostEditor.tsx for why push()+refresh() is avoided.
        window.location.href = "/admin";
      } else {
        setState("error");
        setErrorMsg(data.error ?? "Something went wrong.");
      }
    } catch {
      setState("error");
      setErrorMsg("Network error. Please try again.");
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="pixel-border"
        style={{
          background: "var(--yellow)",
          padding: "2.5rem",
          width: "100%",
          maxWidth: "360px",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
        }}
      >
        <h1 className="display-font" style={{ fontSize: "1rem" }}>
          TimeBud Admin
        </h1>

        <input
          ref={inputRef}
          type="password"
          placeholder="Password"
          required
          autoFocus
          disabled={state === "loading"}
          className="pixel-input"
        />

        <button type="submit" disabled={state === "loading"} className="pixel-btn">
          {state === "loading" ? "..." : "Log in"}
        </button>

        {state === "error" && (
          <p
            className="error-msg"
            style={{
              fontFamily: "var(--font-body), sans-serif",
              fontSize: "0.875rem",
              fontWeight: 700,
              borderLeft: "4px solid #000",
              paddingLeft: "0.75rem",
            }}
          >
            {errorMsg}
          </p>
        )}
      </form>
    </main>
  );
}
