import Link from "next/link";
import { getTestimonialsForAdmin } from "@/lib/testimonials";
import { TestimonialCard } from "../../components/TestimonialCard";
import type { Testimonial } from "@/db/schema";

export const dynamic = "force-dynamic";

const TABS = [
  { key: "pending", label: "Waiting" },
  { key: "approved", label: "On the site" },
  { key: "rejected", label: "Turned down" },
  { key: "spam", label: "Spam" },
] as const;

export default async function TestimonialsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const status = (TABS.find((t) => t.key === searchParams.status)?.key ??
    "pending") as Testimonial["status"];
  const rows = await getTestimonialsForAdmin(status);

  return (
    <div>
      <h1>Opinions</h1>
      <p className="sub">
        Everything here was typed by a member of the public and is invisible on the site until you
        approve it. Each card carries the consent they gave and the words they actually wrote.
      </p>

      <div className="filters">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={`/admin/testimonials?status=${tab.key}`}
            aria-current={status === tab.key ? "page" : undefined}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="empty">
          {status === "pending" ? "Nothing waiting. The queue is clear." : "Nothing here."}
        </p>
      ) : (
        <div className="stack">
          {rows.map((row) => (
            <TestimonialCard key={row.id} testimonial={row} />
          ))}
        </div>
      )}
    </div>
  );
}
