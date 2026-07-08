"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      style={{
        background: "none",
        border: "2px solid var(--yellow)",
        color: "var(--yellow)",
        padding: "0.5rem 1rem",
        fontSize: "0.8rem",
        fontFamily: "var(--font-body), sans-serif",
        cursor: "pointer",
      }}
    >
      Log out
    </button>
  );
}
