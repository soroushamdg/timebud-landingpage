-- Reference SQL for the testimonials / faqs / documents tables.
--
-- This file is NOT part of the drizzle migration chain. Generate the real
-- migration on your own machine so the snapshot in db/migrations/meta stays
-- consistent:
--
--     npm run db:generate && npm run db:migrate
--
-- It is kept here so the exact intended shape is reviewable, and so the tables
-- can be created by hand against a branch database if drizzle-kit is unhappy.

CREATE TYPE "public"."testimonial_status" AS ENUM('pending', 'approved', 'rejected', 'spam');

CREATE TABLE IF NOT EXISTS "testimonials" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "quote" text NOT NULL,
  "original_quote" text NOT NULL,
  "name" varchar(80) NOT NULL,
  "role" varchar(120),
  "used_for" varchar(60),
  "email" varchar(254) NOT NULL,
  "consent_text" text NOT NULL,
  "consent_at" timestamp with time zone DEFAULT now() NOT NULL,
  "status" "testimonial_status" DEFAULT 'pending' NOT NULL,
  "featured" integer DEFAULT 0 NOT NULL,
  "display_order" integer DEFAULT 0 NOT NULL,
  "review_note" text,
  "reviewed_at" timestamp with time zone,
  "ip_hash" varchar(64),
  "user_agent" text,
  "source_path" varchar(200),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "testimonials_status_idx" ON "testimonials" ("status");
CREATE INDEX IF NOT EXISTS "testimonials_iphash_created_idx" ON "testimonials" ("ip_hash", "created_at");

CREATE TABLE IF NOT EXISTS "faqs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "question" text NOT NULL,
  "answer" text NOT NULL,
  "display_order" integer DEFAULT 0 NOT NULL,
  "published" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "documents" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "slug" varchar(120) NOT NULL UNIQUE,
  "title" text NOT NULL,
  "body" text NOT NULL,
  "effective_date" timestamp with time zone,
  "published" integer DEFAULT 1 NOT NULL,
  "display_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
