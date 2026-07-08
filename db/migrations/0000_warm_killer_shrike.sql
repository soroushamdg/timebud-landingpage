CREATE TYPE "public"."post_status" AS ENUM('published', 'hidden');--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(200) NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"excerpt" text,
	"seo_title" varchar(70),
	"description" varchar(200),
	"og_description" varchar(200),
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"cover_image_url" text,
	"cover_image_alt" text,
	"og_image_url" text,
	"status" "post_status" DEFAULT 'hidden' NOT NULL,
	"author_name" varchar(100) DEFAULT 'TimeBud' NOT NULL,
	"reading_time_minutes" integer DEFAULT 1 NOT NULL,
	"ai_meta" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp with time zone,
	CONSTRAINT "posts_slug_unique" UNIQUE("slug")
);
