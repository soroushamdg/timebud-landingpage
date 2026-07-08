import {
  pgTable,
  uuid,
  text,
  varchar,
  jsonb,
  integer,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

export const postStatusEnum = pgEnum("post_status", ["draft", "scheduled", "published", "hidden"]);

export interface InternalLinkSuggestion {
  anchorText: string;
  targetSlug: string;
}

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),

  slug: varchar("slug", { length: 200 }).notNull().unique(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),

  // SEO / meta — AI-generated but human-editable
  seoTitle: varchar("seo_title", { length: 70 }),
  description: varchar("description", { length: 200 }),
  ogDescription: varchar("og_description", { length: 200 }),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),

  coverImageUrl: text("cover_image_url"),
  coverImageAlt: text("cover_image_alt"),
  ogImageUrl: text("og_image_url"),

  status: postStatusEnum("status").notNull().default("hidden"),
  authorName: varchar("author_name", { length: 100 }).notNull().default("TimeBud"),

  readingTimeMinutes: integer("reading_time_minutes").notNull().default(1),

  // Raw AI response payload, kept for audit/debugging — never shown to end users.
  aiMeta: jsonb("ai_meta"),

  // AI-suggested related posts (slugs, must reference existing posts) and
  // internal-link suggestions (anchor text + target slug) — surfaced in the
  // admin UI for the human to apply; never auto-inserted into content.
  relatedSlugs: jsonb("related_slugs").$type<string[]>().notNull().default([]),
  internalLinkSuggestions: jsonb("internal_link_suggestions")
    .$type<InternalLinkSuggestion[]>()
    .notNull()
    .default([]),

  // Previous slugs this post has had — checked on a lookup miss so an old
  // URL 301-redirects to the current slug instead of 404ing.
  previousSlugs: jsonb("previous_slugs").$type<string[]>().notNull().default([]),

  // When status = 'scheduled', the post becomes publicly visible once this
  // passes (checked at read time — see lib/posts.ts — no cron job needed).
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
});

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
