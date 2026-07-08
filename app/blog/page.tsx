import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedPosts } from "@/lib/posts";
import { PostCard } from "./components/PostCard";

export const metadata: Metadata = {
  title: "Blog — TimeBud",
  description:
    "Practical, no-nonsense writing on ADHD, focus, and getting started on the task in front of you — from the team building TimeBud.",
  openGraph: {
    title: "Blog — TimeBud",
    description:
      "Practical, no-nonsense writing on ADHD, focus, and getting started on the task in front of you — from the team building TimeBud.",
    type: "website",
    url: "/blog",
  },
};

// Dynamic (not ISR) so admin publish/hide changes show up immediately.
export const dynamic = "force-dynamic";

export default async function BlogIndexPage() {
  const posts = await getPublishedPosts();

  return (
    <main className="section-padding" style={{ maxWidth: "1100px", margin: "0 auto" }}>
      <div style={{ marginBottom: "3rem" }}>
        <Link href="/" style={{ fontSize: "0.875rem", textDecoration: "underline" }}>
          ← Back to TimeBud
        </Link>
        <h1 className="display-font" style={{ fontSize: "1.5rem", marginTop: "1.5rem" }}>
          The TimeBud Blog
        </h1>
        <p style={{ marginTop: "1rem", maxWidth: "60ch", lineHeight: 1.6 }}>
          Practical, no-nonsense writing on ADHD, focus, and getting started on the task in front of
          you.
        </p>
      </div>

      {posts.length === 0 ? (
        <p>No posts yet — check back soon.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "2rem",
          }}
        >
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </main>
  );
}
