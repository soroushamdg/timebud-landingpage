import { getPublishedPosts } from "@/lib/posts";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function GET() {
  const posts = await getPublishedPosts();

  const postLines = posts
    .map((post) => `- [${post.title}](${SITE_URL}/blog/${post.slug}): ${post.excerpt ?? post.description ?? ""}`)
    .join("\n");

  const body = `# TimeBud

> TimeBud is a task and time-management app built for ADHD and focus struggles. It decides what to work on next — you tell it how much time you have, it picks your tasks in order, you just start.

## Key pages
- [Homepage](${SITE_URL}): product overview and waitlist signup
- [Blog](${SITE_URL}/blog): articles on ADHD, focus, and getting started on tasks

## Blog posts
${postLines || "(no posts published yet)"}
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
