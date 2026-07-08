import Link from "next/link";
import { LogoutButton } from "../components/LogoutButton";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh" }}>
      <header
        className="pixel-border-heavy"
        style={{
          borderTop: "none",
          borderLeft: "none",
          borderRight: "none",
          background: "var(--black)",
          color: "var(--yellow)",
          padding: "1rem 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <nav style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <Link href="/admin" className="display-font" style={{ fontSize: "0.8rem", color: "var(--yellow)" }}>
            TimeBud Admin
          </Link>
          <Link href="/admin" style={{ color: "var(--yellow)", fontSize: "0.9rem" }}>
            Posts
          </Link>
          <Link href="/admin/new" style={{ color: "var(--yellow)", fontSize: "0.9rem" }}>
            + New post
          </Link>
          <Link href="/blog" style={{ color: "var(--yellow)", fontSize: "0.9rem", opacity: 0.7 }} target="_blank">
            View blog ↗
          </Link>
        </nav>
        <LogoutButton />
      </header>
      <main style={{ padding: "2rem 1.5rem", maxWidth: "1000px", margin: "0 auto" }}>{children}</main>
    </div>
  );
}
