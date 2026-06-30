"use client";

import { useState, useEffect, useRef } from "react";
import { LANGUAGES, type LangCode } from "@/app/i18n/translations";
import { useLanguage } from "./LanguageProvider";

const LANG_NAMES: Record<LangCode, string> = {
  en: "English",
  fr: "Français",
  de: "Deutsch",
  fa: "فارسی",
  ar: "العربية",
  es: "Español",
  zh: "中文",
  ja: "日本語",
};

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find((l) => l.code === lang)!;

  // Close on click outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  function choose(code: LangCode) {
    setLang(code);
    setOpen(false);
  }

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        top: "1.25rem",
        right: "1.25rem",
        zIndex: 9999,
      }}
    >
      {/* Trigger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Select language"
        aria-expanded={open}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          background: "#000",
          color: "#FDC800",
          border: "3px solid #000",
          borderRadius: 0,
          padding: "0.5rem 0.75rem",
          cursor: "pointer",
          fontFamily: "var(--font-pixel), monospace",
          fontSize: "0.6rem",
          lineHeight: 1,
          boxShadow: "3px 3px 0 rgba(0,0,0,0.25)",
          whiteSpace: "nowrap",
          userSelect: "none",
        }}
      >
        <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>{current.flag}</span>
        <span>{current.label}</span>
        <span style={{ fontSize: "0.55rem", opacity: 0.7 }}>{open ? "▲" : "▼"}</span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            right: 0,
            background: "#FDC800",
            border: "3px solid #000",
            boxShadow: "4px 4px 0 #000",
            minWidth: "170px",
            overflow: "hidden",
          }}
        >
          {LANGUAGES.map(({ code, flag }) => {
            const active = code === lang;
            return (
              <button
                key={code}
                onClick={() => choose(code)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  width: "100%",
                  padding: "0.6rem 0.85rem",
                  background: active ? "#000" : "transparent",
                  color: active ? "#FDC800" : "#000",
                  border: "none",
                  borderBottom: "2px solid #000",
                  borderRadius: 0,
                  cursor: "pointer",
                  fontFamily: "var(--font-body), sans-serif",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  textAlign: "left",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.08)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  }
                }}
              >
                <span style={{ fontSize: "1.15rem" }}>{flag}</span>
                <span>{LANG_NAMES[code]}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
