import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "./client";
import { posts } from "./schema";
import { computeReadingTimeMinutes } from "../lib/reading-time";

const samplePosts = [
  {
    slug: "why-adhd-brains-need-different-todo-lists",
    title: "Why ADHD Brains Need a Different Kind of To-Do List",
    seoTitle: "Why ADHD Brains Need a Different To-Do List",
    description:
      "Standard to-do lists fail ADHD brains by design. Here's why, and what actually works instead.",
    ogDescription:
      "Standard to-do lists fail ADHD brains by design. Here's why, and what actually works instead.",
    excerpt:
      "Most productivity apps assume a brain that doesn't struggle with task initiation. Here's what actually helps.",
    tags: ["adhd", "productivity", "focus"],
    content: `Most to-do list apps are built for a brain that can look at a list of 40 items and just... start. If you have ADHD, you know that brain isn't yours.

## The problem with flat lists

A flat list gives every task equal visual weight. Your brain, already fighting an executive-function deficit, now has to do the sorting *and* the prioritizing *and* the starting — three expensive cognitive operations before you've done a single minute of real work.

<Callout type="tip">
Externalizing prioritization — having the app decide "what's next" — removes one whole decision loop before you even start.
</Callout>

## What actually works

- Time-boxing over open-ended lists
- One visible "next thing," not forty
- Momentum-based rewards, not guilt-based streaks

<CTAButton href="https://app.timebud.app" label="Try TimeBud free" />
`,
  },
  {
    slug: "the-two-minute-rule-is-broken-for-adhd",
    title: "The Two-Minute Rule Is Broken for ADHD — Here's the Fix",
    seoTitle: "The Two-Minute Rule Is Broken for ADHD",
    description:
      "The classic 'if it takes two minutes, do it now' rule ignores task-switching cost for ADHD brains. Here's a better version.",
    ogDescription:
      "The classic productivity rule that quietly punishes ADHD brains — and the fix.",
    excerpt:
      "'Just do it now if it's quick' sounds right until you account for switching cost.",
    tags: ["adhd", "focus", "habits"],
    content: `The two-minute rule says: if a task takes less than two minutes, do it immediately instead of adding it to a list.

For neurotypical brains, that's efficient. For ADHD brains mid-hyperfocus, it's a trapdoor.

<Callout type="warning">
Task-switching has a real cognitive cost — and for ADHD brains, the cost of *returning* to the original task is often much higher than the two minutes saved.
</Callout>

## A better rule

Batch the two-minute tasks. Let them queue up, then clear them in one dedicated block — instead of letting them interrupt whatever you were actually building momentum on.

<CTAButton href="https://app.timebud.app" label="See how TimeBud batches quick tasks" />
`,
  },
  {
    slug: "hyperfocus-is-not-a-productivity-hack",
    title: "Hyperfocus Is Not a Productivity Hack",
    seoTitle: "Hyperfocus Is Not a Productivity Hack",
    description:
      "Hyperfocus feels like a superpower until it burns four hours and your whole evening. Here's how to use it without losing the day.",
    ogDescription:
      "Hyperfocus feels like a superpower until it burns your whole evening.",
    excerpt:
      "Hyperfocus isn't free productivity — it's a loan against tomorrow's energy.",
    tags: ["adhd", "hyperfocus", "wellbeing"],
    content: `Hyperfocus gets celebrated as an ADHD superpower. Sometimes it is. Often it's just a really convincing way to lose four hours and skip dinner.

## Why it's a double-edged sword

Hyperfocus doesn't respond to your priorities — it responds to whatever is most stimulating in the moment, which isn't always the thing that matters most.

<Callout type="tip">
Setting a single external checkpoint (a timer, a scheduled break) before you start is the only thing that reliably interrupts hyperfocus without killing it.
</Callout>

<CTAButton href="https://app.timebud.app" label="Try TimeBud free" />
`,
  },
] as const;

async function main() {
  for (const post of samplePosts) {
    await db
      .insert(posts)
      .values({
        ...post,
        tags: [...post.tags],
        status: "published",
        publishedAt: new Date(),
        readingTimeMinutes: computeReadingTimeMinutes(post.content),
      })
      .onConflictDoNothing({ target: posts.slug });
  }

  console.log(`Seeded ${samplePosts.length} posts.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
