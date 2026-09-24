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
  // internal-link suggestions (anchor text + target slug). Both are rendered
  // automatically on the public post page (RelatedPosts widget, and
  // lib/internal-links.ts splices internalLinkSuggestions into the body at
  // request time) — content here is never mutated, injection is display-only.
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

/* ============================================================
   TESTIMONIALS
   Submitted by the public through an unauthenticated endpoint, so this table
   holds other people's personal data. Three consequences are baked into the
   shape below: consent is recorded (text + timestamp), not merely checked in
   the browser; the email is never exposed by any public read; and every row
   carries enough provenance to defend a published quote later.
   ============================================================ */
export const testimonialStatusEnum = pgEnum("testimonial_status", [
  "pending",
  "approved",
  "rejected",
  "spam",
]);

export const testimonials = pgTable("testimonials", {
  id: uuid("id").primaryKey().defaultRandom(),

  quote: text("quote").notNull(),
  // The submitter's words exactly as received. `quote` may be lightly edited
  // for length or typos; this is what they actually wrote, so a dispute about
  // "I never said that" can be answered.
  originalQuote: text("original_quote").notNull(),

  name: varchar("name", { length: 80 }).notNull(),
  role: varchar("role", { length: 120 }),
  usedFor: varchar("used_for", { length: 60 }),

  // Contact details. Never selected by any public query.
  email: varchar("email", { length: 254 }).notNull(),

  // Consent record. Storing the exact wording shown at the time matters: the
  // consent text will change, and an old row has to prove what was agreed to.
  consentText: text("consent_text").notNull(),
  consentAt: timestamp("consent_at", { withTimezone: true }).notNull().defaultNow(),

  status: testimonialStatusEnum("status").notNull().default("pending"),
  featured: integer("featured").notNull().default(0),
  displayOrder: integer("display_order").notNull().default(0),

  // Moderation trail.
  reviewNote: text("review_note"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),

  // Provenance and abuse defence. The IP is stored hashed with a server-side
  // pepper: enough to rate-limit and spot floods, not enough to be a stored
  // identifier on its own.
  ipHash: varchar("ip_hash", { length: 64 }),
  userAgent: text("user_agent"),
  sourcePath: varchar("source_path", { length: 200 }),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Testimonial = typeof testimonials.$inferSelect;
export type NewTestimonial = typeof testimonials.$inferInsert;

/** The only shape a public read may ever return: no email, no IP, no trail. */
export type PublicTestimonial = Pick<
  Testimonial,
  "id" | "quote" | "name" | "role" | "usedFor" | "featured" | "displayOrder"
>;

/* ============================================================
   FAQ
   ============================================================ */
export const faqs = pgTable("faqs", {
  id: uuid("id").primaryKey().defaultRandom(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  published: integer("published").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Faq = typeof faqs.$inferSelect;
export type NewFaq = typeof faqs.$inferInsert;

/* ============================================================
   DOCUMENTS — the footer and legal pages (privacy, terms, and the rest).
   Markdown bodies, edited with the same editor the blog uses.
   ============================================================ */
export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  // Shown under the title on the public page, e.g. "Last updated 28 August 2026".
  effectiveDate: timestamp("effective_date", { withTimezone: true }),
  published: integer("published").notNull().default(1),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type TbDocument = typeof documents.$inferSelect;
export type NewTbDocument = typeof documents.$inferInsert;
