import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Admin/API routes are auth-gated anyway, but keeping them out of robots.txt
// avoids wasting crawl budget and advertising the admin panel's existence.
// AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended) are allowed
// deliberately — blocking them would prevent citation in AI search answers.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
