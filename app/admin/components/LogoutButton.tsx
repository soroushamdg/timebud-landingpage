"use client";

export function LogoutButton() {
  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    // Hard navigation — see PostEditor.tsx for why push()+refresh() is avoided;
    // it also ensures no cached authenticated page is reachable via back button.
    window.location.href = "/admin/login";
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
