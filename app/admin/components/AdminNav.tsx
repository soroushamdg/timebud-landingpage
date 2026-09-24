"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Posts", exact: true },
  { href: "/admin/testimonials", label: "Opinions" },
  { href: "/admin/faq", label: "FAQ" },
  { href: "/admin/pages", label: "Pages" },
];

export function AdminNav({ pendingTestimonials }: { pendingTestimonials: number }) {
  const pathname = usePathname();

  return (
    <nav className="tbadm-nav" aria-label="Admin sections">
      {LINKS.map((link) => {
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined}>
            {link.label}
            {link.href === "/admin/testimonials" && pendingTestimonials > 0 ? (
              <span className="tbadm-count" aria-label={`${pendingTestimonials} waiting for review`}>
                {pendingTestimonials}
              </span>
            ) : null}
          </Link>
        );
      })}
      <Link href="/admin/new">+ New post</Link>
    </nav>
  );
}
