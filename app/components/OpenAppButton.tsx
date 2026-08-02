"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { APP_LOGIN_COOKIE_NAME, APP_URL } from "@/lib/site";

function readCookie(name: string): string | undefined {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
}

export default function OpenAppButton() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(readCookie(APP_LOGIN_COOKIE_NAME) === "1");
  }, []);

  if (!isLoggedIn || pathname?.startsWith("/admin")) return null;

  return (
    <a
      href={`${APP_URL}/`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
        background: "#000",
        color: "#FDC800",
        border: "3px solid #000",
        borderRadius: 0,
        padding: "0.5rem 0.75rem",
        fontFamily: "var(--font-pixel), monospace",
        fontSize: "0.6rem",
        lineHeight: 1,
        boxShadow: "3px 3px 0 rgba(0,0,0,0.25)",
        whiteSpace: "nowrap",
        textDecoration: "none",
      }}
    >
      Open App →
    </a>
  );
}
