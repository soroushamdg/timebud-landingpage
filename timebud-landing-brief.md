# TimeBud Landing Page — Build Brief

## Stack & Setup
- **Framework:** Next.js 14 App Router (matches existing project).
- **Animation libraries (install these, nothing heavier):**
  - `gsap` + its `ScrollTrigger` plugin — all scroll-choreographed animations.
  - `lenis` (`@studio-freight/lenis` or `lenis`) — smooth scroll, wired into GSAP's ticker so ScrollTrigger stays in sync.
  - Particle/shatter effect: do it with GSAP on cloned DOM fragments OR a small `<canvas>` burst. Treat as **nice-to-have** — see Section 6. Do NOT pull in Three.js or a physics engine.
- **Do NOT use:** Framer Motion (redundant with GSAP), Three.js (the look is a 2D style, not 3D).

## Global Style
- Background: `#FDC800`. Text: `black`.
- **Pixelated everything:** all images use `image-rendering: pixelated;`. All dividing lines are rendered as chunky pixel-style borders (e.g. thick stepped/dashed black borders, not smooth 1px rules). All buttons and inputs are **square corners** (`border-radius: 0`), thick black borders, blocky pixel-art aesthetic.
- Mascot PNGs (`thinking.png`, `winking.png`) are **already pixel-art** — just scale + `image-rendering: pixelated`. No filter needed.
- Font: a blocky/pixel display font for big headers (e.g. "Press Start 2P" sparingly, or a chunky geometric sans for readability on body text). Keep body text readable — full pixel font on long lines is painful.

## BUILD IN TWO PASSES
**Pass 1:** Full page structure, all content, all static styling, asset placeholders, working CTA + waitlist backend. No scroll animations yet — just verify layout and the email flow work.
**Pass 2:** Layer scroll animations section-by-section. Test each before moving to the next. This avoids ScrollTrigger timing conflicts compounding into unfixable jank.

---

## SECTION 1 — Hero (pinned scroll sequence)
Pin this section while the sequence plays.

- Big centered text **T1: "Stop deciding"** visible on entry.
- Mascot **`thinking.png`** on the LEFT, rotated **−25° (anticlockwise)**.
- **On scroll:**
  - T1 fades out moving **upward**; **T2: "just start"** fades in to replace it (same center position).
  - Mascot moves **left → right** across the screen, cross-fading from `thinking.png` to `winking.png`, while rotation animates from **−25° → +25° (clockwise)**.
  - NOTE: this is a cross-fade + transform, presented as a "morph." Two PNGs cannot truly morph. The slide + flip + opacity crossfade reads as one.

## SECTION 2 — Tagline
- **T3: "TimeBud is an app that decides what to work on next."**
- Simple fade-in on scroll into view. (Note: corrected "decided"→"decides".)

## SECTION 3 — Founder / "me."
- LEFT: square photo placeholder (`/placeholder-founder.png`, swappable).
- RIGHT, top-aligned to photo height: heading **"me."**
- Below it, a **sequential text swap on scroll**: line 1 ("i have adhd.") shows, then as you scroll it fades/disappears and the next line replaces it in the same spot. Lines: `["i have adhd.", "text 2", "text 3"]` — placeholders for Soroush to fill in.

## SECTION 4 — Built for
- **"Built for:"**
- Body: "Students who can't start tasks. ADHD, undiagnosed focus issues, or just decision-fatigued."
- Fade-in on scroll.

## SECTION 5 — Core problem → solution (the big animation)
- **CORE PROBLEM:** "Decision fatigue. Mental energy spent choosing leaves nothing for doing."
- **CORE SOLUTION:** "You tell it how much time you have. AI picks your tasks in order. You just start."
- **Scroll sequence, in this order:**
  1. Strikethrough line draws across the CORE PROBLEM text.
  2. CORE PROBLEM text breaks into particles / shatters and falls away.
  3. CORE SOLUTION drops in from above to take its place.
- Sequence the GSAP timeline so strikethrough completes → shatter begins → solution drops. Don't run them simultaneously.

## SECTION 6 — Proof / app screenshot
- LEFT: square screenshot placeholder (`/placeholder-screenshot.png`, swappable).
- RIGHT: "I use TimeBud daily for university finals and building this app. Cut my decision fatigue to zero."
- Fade-in on scroll.

## SECTION 7 — CTA (two explicit paths, NOT one box)
Layout:
```
[ TRY IT FREE → ]        ← large square button, plain <a href>
                            points to app URL (placeholder: https://app.timebud.app)
                            NO backend, NO email.

iOS coming soon. Get notified:
[ email input ] [ → ]    ← square input + square button
                            this is the ONLY element touching the backend.
```
- Footer line: "Free to try. Web version live, iOS coming soon."

### Waitlist backend (iOS notify box only)
**CRITICAL — Resend API key is server-side only. Never call Resend from the browser; the key leaks in devtools.**

Flow:
```
email input → POST /api/waitlist (Next.js route handler)
   1. validate email
   2. insert into Supabase `waitlist` table (store FIRST — this is the part that matters)
   3. THEN call Resend to send a confirmation email (wrap in try/catch;
      if Resend fails, the signup is still saved — do not fail the request)
   4. return { ok: true } / { ok: false, error } to the form
```
- Resend does NOT store emails — it only sends. Supabase is the store.
- Make the confirmation email **optional / best-effort** for launch. Capturing the address reliably > sending a pretty email.
- Show inline success/error state on the form. Square styling, no rounded corners.
- Env vars: `RESEND_API_KEY` server-side only. Supabase service role key server-side only.

---

## Asset placeholders to create
- `/thinking.png`, `/winking.png` (pixel-art mascots — Soroush provides)
- `/placeholder-founder.png` (square)
- `/placeholder-screenshot.png` (square)

## Open items for Soroush to fill later
- Real app URL for "Try it free".
- Founder text lines 2, 3 in Section 3.
- Confirm Supabase `waitlist` table schema (`email`, `created_at`, maybe `source`).
