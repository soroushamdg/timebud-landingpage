import Link from "next/link";
import { LogoutButton } from "../components/LogoutButton";
import { AdminNav } from "../components/AdminNav";
import { countPendingTestimonials } from "@/lib/testimonials";
import "../admin.css";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  // Surfaced in the nav so a submission cannot sit unreviewed just because
  // nobody thought to open that page.
  let pending = 0;
  try {
    pending = await countPendingTestimonials();
  } catch {
    // The testimonials table may not exist yet on a database that has not been
    // migrated. A missing count must not take the whole admin down.
    pending = 0;
  }

  return (
    <div className="tbadm">
      {/* The public site ships Geist; the admin's Blockwork styling wants the
          display and mono faces too. A plain link rather than next/font so a
          build with no network still succeeds — it just falls back. */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=Nunito:wght@500;600;700;800;900&family=IBM+Plex+Mono:wght@500;600&display=swap"
      />
      <header className="tbadm-bar">
        <Link href="/admin" className="tbadm-brand" style={{ color: "inherit", textDecoration: "none" }}>
          <span className="tbadm-logo" aria-hidden="true">T</span>
          TimeBud Admin
        </Link>
        <AdminNav pendingTestimonials={pending} />
        <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
          <Link
            href="/blog"
            target="_blank"
            style={{ color: "var(--dim)", fontSize: 14, fontWeight: 700, textDecoration: "none" }}
          >
            View blog ↗
          </Link>
          <LogoutButton />
        </div>
      </header>
      <main className="tbadm-main">{children}</main>
    </div>
  );
}
