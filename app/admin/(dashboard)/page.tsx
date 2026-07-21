import { getAllPostsForAdmin, getEffectiveStatus } from "@/lib/posts";
import { PostRowActions } from "../components/PostRowActions";
import { PublishedDate } from "../components/PublishedDate";
import { StatusBadge } from "../components/StatusBadge";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const posts = await getAllPostsForAdmin();

  return (
    <div>
      <h1 className="display-font" style={{ fontSize: "1.25rem", marginBottom: "2rem" }}>
        Posts
      </h1>

      {posts.length === 0 ? (
        <p>No posts yet. Create your first one.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {posts.map((post) => {
            const effectiveStatus = getEffectiveStatus(post);
            return (
              <div
                key={post.id}
                className="pixel-border"
                style={{
                  background: "var(--yellow)",
                  padding: "1.25rem 1.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "1rem",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                    <strong style={{ fontSize: "1rem" }}>{post.title}</strong>
                    <StatusBadge status={effectiveStatus} scheduledAt={post.scheduledAt} />
                  </div>
                  <p style={{ fontSize: "0.85rem", opacity: 0.75, margin: "0.4rem 0 0" }}>
                    /blog/{post.slug} · {post.readingTimeMinutes} min read
                    {(effectiveStatus === "published" || effectiveStatus === "hidden") && post.publishedAt ? (
                      <>
                        {" "}
                        · <PublishedDate publishedAt={post.publishedAt} />
                      </>
                    ) : null}
                  </p>
                </div>
                <PostRowActions postId={post.id} status={effectiveStatus} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
