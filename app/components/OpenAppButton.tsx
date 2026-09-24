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
    <a href={`${APP_URL}/`} className="nav-pill">
      Open App →
    </a>
  );
}
