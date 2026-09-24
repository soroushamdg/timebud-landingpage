/**
 * Seeds the FAQ and the footer/legal pages with the copy from the redesigned
 * landing page, so the admin has something real in it the first time it opens.
 *
 *     npx tsx db/seed-content.ts
 *
 * Safe to re-run: it skips anything already present.
 */
import { db } from "./client";
import { documents, faqs } from "./schema";

const FAQS = [
  {
    question: "Is this another to-do app?",
    answer:
      "No. A to-do app assumes you already know the tasks. Bud works them out, then picks which ones fit the next two hours.",
  },
  {
    question: "Does it manage my whole day?",
    answer:
      "No. It owns the inside of a work block you already carved out. No habits, no sleep, no meetings.",
  },
  {
    question: "What are credits for?",
    answer:
      "Anything that calls a model: chat, job generation, research, voice. Planning, timers and streaks are free.",
  },
  {
    question: "Do I have to connect a calendar?",
    answer: "No. Without one you type how many minutes you have.",
  },
];

const DOCS = [
  { slug: "privacy", title: "Privacy policy" },
  { slug: "terms", title: "Terms of service" },
  { slug: "cookies", title: "Cookie policy" },
  { slug: "security", title: "Security" },
  { slug: "accessibility", title: "Accessibility statement" },
  { slug: "data-deletion", title: "Deleting your data" },
  { slug: "about", title: "About TimeBud" },
  { slug: "contact", title: "Contact" },
  { slug: "changelog", title: "Changelog" },
  { slug: "credits", title: "How credits work" },
];

async function main() {
  const existingFaqs = await db.select({ question: faqs.question }).from(faqs);
  const haveFaq = new Set(existingFaqs.map((f) => f.question));
  for (let i = 0; i < FAQS.length; i++) {
    if (haveFaq.has(FAQS[i]!.question)) continue;
    await db.insert(faqs).values({ ...FAQS[i]!, displayOrder: i, published: 1 });
    console.log(`+ faq: ${FAQS[i]!.question}`);
  }

  const existingDocs = await db.select({ slug: documents.slug }).from(documents);
  const haveDoc = new Set(existingDocs.map((d) => d.slug));
  for (let i = 0; i < DOCS.length; i++) {
    const doc = DOCS[i]!;
    if (haveDoc.has(doc.slug)) continue;
    await db.insert(documents).values({
      slug: doc.slug,
      title: doc.title,
      // Placeholder on purpose. A legal page with invented terms in it is worse
      // than an empty one, so these say plainly that they are unwritten.
      body: `# ${doc.title}\n\nThis page has not been written yet. Replace this text in the admin before launch.\n`,
      published: 0,
      displayOrder: i,
      effectiveDate: new Date(),
    });
    console.log(`+ page: ${doc.slug} (hidden until written)`);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
