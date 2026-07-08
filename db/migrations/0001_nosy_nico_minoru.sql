ALTER TYPE "public"."post_status" ADD VALUE 'draft' BEFORE 'published';--> statement-breakpoint
ALTER TYPE "public"."post_status" ADD VALUE 'scheduled' BEFORE 'published';--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "related_slugs" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "internal_link_suggestions" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "previous_slugs" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "scheduled_at" timestamp with time zone;