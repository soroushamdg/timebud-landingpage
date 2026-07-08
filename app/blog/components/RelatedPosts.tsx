import Link from "next/link";
import type { Post } from "@/db/schema";

export function RelatedPosts({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;

  return (
    <section style={{ marginTop: "3.5rem" }}>
      <h2 className="display-font" style={{ fontSize: "1rem", marginBottom: "1.25rem" }}>
        Related posts
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="pixel-border"
            style={{
              display: "block",
              padding: "1rem",
              background: "var(--yellow)",
              textDecoration: "none",
              color: "var(--black)",
              fontSize: "0.9rem",
              lineHeight: 1.5,
            }}
          >
            {post.title}
          </Link>
        ))}
      </div>
    </section>
  );
}
