import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { SEO_SYSTEM_PROMPT } from "./seo-prompt";
import type { InternalLinkSuggestion } from "@/db/schema";

export interface SeoMetadataResult {
  seoTitle: string;
  metaDescription: string;
  ogDescription: string;
  slug: string;
  tags: string[];
  coverImageAlt: string;
  relatedSlugs: string[];
  internalLinkSuggestions: InternalLinkSuggestion[];
}

export interface OtherPost {
  slug: string;
  title: string;
  excerpt: string | null;
}

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (client) return client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set — see .env.local.example");
  }
  client = new Anthropic({ apiKey });
  return client;
}

const GENERATE_SEO_TOOL: Anthropic.Tool = {
  name: "generate_seo_metadata",
  description:
    "Generate SEO metadata, a slug, tags, cover image alt text, and internal-linking suggestions for a TimeBud blog post.",
  input_schema: {
    type: "object",
    properties: {
      seoTitle: {
        type: "string",
        description:
          "The page <title>. 50-60 characters including spaces. Primary keyword near the front. Specific and click-worthy, never clickbait. Do not append the brand name — it is not shown in the browser tab for blog posts.",
      },
      metaDescription: {
        type: "string",
        description:
          "150-160 characters including spaces. Includes the primary keyword naturally (not stuffed). States the concrete takeaway or value of the post and ends with a soft call to action. Must be true to the post content — no invented claims.",
      },
      ogDescription: {
        type: "string",
        description:
          "150-160 characters including spaces. Used for social share cards (Open Graph/Twitter). Similar to metaDescription but can read slightly more conversational, written for someone scrolling a feed rather than scanning a search result.",
      },
      slug: {
        type: "string",
        description:
          "URL slug: lowercase, hyphen-separated, 3-6 words, no stopwords (a, the, of, to, and, in, for), no dates, no special characters. Mirrors the seoTitle's intent rather than repeating it verbatim.",
      },
      tags: {
        type: "array",
        items: { type: "string" },
        description: "3 to 6 lowercase topical tags a reader would recognize (e.g. \"adhd\", \"focus\", \"habits\"). No hashtags, no punctuation.",
      },
      coverImageAlt: {
        type: "string",
        description:
          "Only fill this in if a cover image was provided in this request. Descriptive, accessibility-focused alt text describing what is literally depicted in the image — not a keyword-stuffed caption. If no image was provided, return an empty string.",
      },
      relatedSlugs: {
        type: "array",
        items: { type: "string" },
        description:
          "0 to 4 slugs of the most topically related posts, chosen ONLY from the 'Other published posts' list provided in the request — never invent a slug that isn't in that list. Empty array if none are genuinely related.",
      },
      internalLinkSuggestions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            anchorText: {
              type: "string",
              description: "A short phrase (2-6 words) that plausibly appears in or fits naturally into the post's body copy.",
            },
            targetSlug: {
              type: "string",
              description: "The slug to link that phrase to — must be one of the slugs from the 'Other published posts' list.",
            },
          },
          required: ["anchorText", "targetSlug"],
        },
        description:
          "0 to 3 internal-linking suggestions: a natural anchor phrase paired with which existing post it could link to. These are shown to the human editor to manually add — never fabricate a targetSlug outside the provided list. Empty array if nothing fits naturally.",
      },
    },
    required: [
      "seoTitle",
      "metaDescription",
      "ogDescription",
      "slug",
      "tags",
      "coverImageAlt",
      "relatedSlugs",
      "internalLinkSuggestions",
    ],
  },
};

async function fetchImageAsBase64(url: string): Promise<{ data: string; mediaType: string } | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") ?? "image/webp";
    const buffer = Buffer.from(await res.arrayBuffer());
    return { data: buffer.toString("base64"), mediaType: contentType };
  } catch {
    return null;
  }
}

export async function generateSeoMetadata({
  title,
  content,
  coverImageUrl,
  otherPosts = [],
}: {
  title: string;
  content: string;
  coverImageUrl?: string | null;
  otherPosts?: OtherPost[];
}): Promise<SeoMetadataResult> {
  const anthropic = getClient();
  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

  const image = coverImageUrl ? await fetchImageAsBase64(coverImageUrl) : null;

  const otherPostsBlock =
    otherPosts.length > 0
      ? `\n\nOther published posts (for relatedSlugs / internalLinkSuggestions — only reference slugs from this list):\n${otherPosts
          .map((p) => `- slug: ${p.slug} | title: ${p.title}${p.excerpt ? ` | excerpt: ${p.excerpt}` : ""}`)
          .join("\n")}`
      : "\n\nNo other published posts exist yet, so relatedSlugs and internalLinkSuggestions must both be empty arrays.";

  const userContent: Anthropic.MessageParam["content"] = [
    {
      type: "text",
      text: `Post title: ${title}\n\nPost content (Markdown/MDX):\n\n${content}${otherPostsBlock}${
        image ? "\n\nThe post's cover image is attached — describe it accurately for coverImageAlt." : ""
      }`,
    },
  ];

  if (image) {
    userContent.push({
      type: "image",
      source: {
        type: "base64",
        media_type: image.mediaType as "image/jpeg" | "image/png" | "image/webp" | "image/gif",
        data: image.data,
      },
    });
  }

  const response = await anthropic.messages.create({
    model,
    max_tokens: 1536,
    system: SEO_SYSTEM_PROMPT,
    tools: [GENERATE_SEO_TOOL],
    tool_choice: { type: "tool", name: "generate_seo_metadata" },
    messages: [{ role: "user", content: userContent }],
  });

  const toolUse = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
  );

  if (!toolUse) {
    throw new Error("Anthropic did not return a tool_use block for generate_seo_metadata");
  }

  const result = toolUse.input as SeoMetadataResult;

  // Defensive: the model is instructed to only reference provided slugs, but
  // since these become real links on the live site, filter out anything it
  // hallucinated rather than trusting the instruction alone.
  const validSlugs = new Set(otherPosts.map((p) => p.slug));
  result.relatedSlugs = (result.relatedSlugs ?? []).filter((s) => validSlugs.has(s));
  result.internalLinkSuggestions = (result.internalLinkSuggestions ?? []).filter((s) =>
    validSlugs.has(s.targetSlug)
  );

  return result;
}
