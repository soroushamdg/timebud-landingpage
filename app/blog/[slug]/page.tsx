import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getPublishedPostByPreviousSlug, getPublishedPostBySlug, getRelatedPosts } from "@/lib/posts";
import { mdxComponents } from "@/lib/mdx-components";
import { injectInternalLinks } from "@/lib/internal-links";
import { SITE_URL } from "@/lib/site";
import { PostMeta } from "../components/PostMeta";
import { RelatedPosts } from "../components/RelatedPosts";

// Dynamic (not ISR/SSG) so admin publish/edit/hide changes show up immediately,
// and so `next build` never needs a live DB connection at build time.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPublishedPostBySlug(params.slug);
  if (!post) return {};

  const title = post.seoTitle || post.title;
  const description = post.description || post.excerpt || undefined;
  const ogImage = post.ogImageUrl || post.coverImageUrl || "/og-default.png";

  return {
    title,
    description,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title,
      description: post.ogDescription || description,
      type: "article",
      url: `/blog/${post.slug}`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.coverImageAlt ?? title }],
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: post.ogDescription || description,
      images: [ogImage],
    },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPublishedPostBySlug(params.slug);

  if (!post) {
    // The slug may have changed since this URL was indexed/bookmarked —
    // 301-redirect to the current slug instead of 404ing and losing SEO value.
    const redirected = await getPublishedPostByPreviousSlug(params.slug);
    if (redirected) permanentRedirect(`/blog/${redirected.slug}`);
    notFound();
  }

  const relatedPosts = await getRelatedPosts(post);
  const renderedContent = injectInternalLinks(post.content, post.internalLinkSuggestions);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description || post.excerpt || undefined,
    image: post.ogImageUrl || post.coverImageUrl || undefined,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Organization", name: post.authorName },
    publisher: { "@type": "Organization", name: "TimeBud" },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/blog/${post.slug}` },
  };

  return (
    <main className="section-padding" style={{ maxWidth: "800px", margin: "0 auto" }}>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link href="/blog" style={{ fontSize: "0.875rem", textDecoration: "underline" }}>
        ← All posts
      </Link>

      <header style={{ margin: "1.5rem 0 2rem" }}>
        <h1 className="display-font" style={{ fontSize: "1.75rem", lineHeight: 1.6 }}>
          {post.title}
        </h1>
        <div style={{ marginTop: "1rem" }}>
          <PostMeta
            publishedAt={post.publishedAt}
            updatedAt={post.updatedAt}
            readingTimeMinutes={post.readingTimeMinutes}
          />
        </div>
        {post.tags.length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "1rem" }}>
            {post.tags.map((tag) => (
              <span key={tag} className="pixel-tag">
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </header>

      {post.coverImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.coverImageUrl}
          alt={post.coverImageAlt ?? ""}
          style={{
            width: "100%",
            border: "4px solid var(--black)",
            boxShadow: "4px 4px 0 var(--black)",
            marginBottom: "2.5rem",
          }}
        />
      ) : null}

      <article className="blog-prose">
        <MDXRemote source={renderedContent} components={mdxComponents} />
      </article>

      <RelatedPosts posts={relatedPosts} />
    </main>
  );
}
