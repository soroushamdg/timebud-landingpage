import Link from "next/link";
import type { Post } from "@/db/schema";
import { PostMeta } from "./PostMeta";

export function PostCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="pixel-card"
      style={{
        display: "flex",
        flexDirection: "column",
        textDecoration: "none",
        color: "var(--black)",
        overflow: "hidden",
      }}
    >
      {post.coverImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.coverImageUrl}
          alt={post.coverImageAlt ?? ""}
          style={{
            width: "100%",
            height: "180px",
            objectFit: "cover",
            borderBottom: "4px solid var(--black)",
          }}
        />
      ) : null}
      <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <h2 className="display-font" style={{ fontSize: "0.9375rem", lineHeight: 1.6, margin: 0 }}>
          {post.title}
        </h2>
        {post.excerpt ? (
          <p style={{ fontSize: "0.9375rem", lineHeight: 1.6, margin: 0, opacity: 0.85 }}>
            {post.excerpt}
          </p>
        ) : null}
        <PostMeta
          publishedAt={post.publishedAt}
          updatedAt={post.updatedAt}
          readingTimeMinutes={post.readingTimeMinutes}
        />
        {post.tags.length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
            {post.tags.map((tag) => (
              <span key={tag} className="pixel-tag">
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </Link>
  );
}
