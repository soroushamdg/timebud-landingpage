"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

export default function ScrollAnimations() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // ── Smooth scroll wired into GSAP ticker ──────────────────────────────
    const lenis = new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // ── Initial states (set before first paint flash) ─────────────────────
    // Mascot wrapper: GSAP owns all transforms. yPercent-50 = translateY(-50%), rotation = -25deg
    gsap.set("#mascot-wrapper", { yPercent: -50, rotation: -25 });
    // hero-t2: centered via xPercent, starts below + invisible
    gsap.set("#hero-t2", { xPercent: -50, y: 40, opacity: 0 });
    // Fade-in elements start invisible and 40px below
    gsap.set(["#tagline-text", "#built-for-content", "#proof-content"], {
      y: 40,
      opacity: 0,
    });
    // Solution block starts above, invisible
    gsap.set("#solution-block", { y: -80, opacity: 0 });

    // ── SECTION 1: Hero — pinned scroll sequence ──────────────────────────
    const heroTl = gsap.timeline();
    heroTl
      // T1 flies up and fades out
      .to("#hero-t1", { y: -60, opacity: 0, duration: 0.4, ease: "power2.in" })
      // T2 rises in from below at same centre position
      .to(
        "#hero-t2",
        { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" },
        "-=0.15"
      )
      // Mascot slides right + rotation flip
      .to(
        "#mascot-wrapper",
        {
          x: () => window.innerWidth * 0.68,
          rotation: 25,
          duration: 1,
          ease: "power2.inOut",
        },
        0
      )
      // Cross-fade: thinking → winking (mid-travel)
      .to("#mascot-thinking", { opacity: 0, duration: 0.35 }, 0.3)
      .to("#mascot-winking", { opacity: 1, duration: 0.35 }, 0.3);

    ScrollTrigger.create({
      trigger: "#hero",
      start: "top top",
      end: "+=150%",
      pin: true,
      scrub: 1.2,
      animation: heroTl,
      invalidateOnRefresh: true,
    });

    // ── SECTION 2: Tagline — fade in ─────────────────────────────────────
    gsap.to("#tagline-text", {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: "#tagline-text",
        start: "top 80%",
        toggleActions: "play none none none",
      },
    });

    // ── SECTION 3: Founder — pinned text swap ─────────────────────────────
    const founderTl = gsap.timeline();
    founderTl
      // line 0 is visible by default; hold → fade out
      .to("#founder-line-0", { opacity: 0, y: -20, duration: 0.5 }, 0.6)
      // line 1 rises in
      .fromTo(
        "#founder-line-1",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5 },
        1.0
      )
      // hold line 1 → fade out
      .to("#founder-line-1", { opacity: 0, y: -20, duration: 0.5 }, 2.0)
      // line 2 rises in
      .fromTo(
        "#founder-line-2",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5 },
        2.5
      );

    ScrollTrigger.create({
      trigger: "#founder",
      start: "top top",
      end: "+=200%",
      pin: true,
      scrub: 1.2,
      animation: founderTl,
    });

    // ── SECTION 4: Built for — fade in ───────────────────────────────────
    gsap.to("#built-for-content", {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: "#built-for-content",
        start: "top 80%",
        toggleActions: "play none none none",
      },
    });

    // ── SECTION 5: Problem → Strikethrough → Character Shatter → Solution ───
    // Split every character into its own inline-block span.
    const problemTextEl = document.getElementById("problem-text");
    let charEls: HTMLElement[] = [];
    if (problemTextEl) {
      const text = (problemTextEl.textContent ?? "").trim();
      problemTextEl.innerHTML = text
        .split("")
        .map((char) =>
          char === " "
            ? `<span class="problem-char" style="display:inline-block;white-space:pre;"> </span>`
            : `<span class="problem-char" style="display:inline-block;">${char}</span>`
        )
        .join("");
      charEls = Array.from(
        problemTextEl.querySelectorAll<HTMLElement>(".problem-char")
      );
    }

    // Position strikethrough through the actual vertical centre of the
    // paragraph. `top: 50%` on a 2-line block lands in the gap between
    // lines, not through text. We measure the paragraph's offsetTop +
    // half its rendered height and let GSAP own the transform.
    const strikeThroughEl = document.getElementById("problem-strikethrough");
    function positionStrikethrough() {
      if (!problemTextEl || !strikeThroughEl) return;
      const centerY = problemTextEl.offsetTop + problemTextEl.offsetHeight / 2;
      gsap.set(strikeThroughEl, { top: centerY, yPercent: -50 });
    }
    positionStrikethrough();
    window.addEventListener("resize", positionStrikethrough);

    const problemTl = gsap.timeline();
    problemTl
      // 1. Strikethrough draws left → right
      .to("#problem-strikethrough", {
        width: "100%",
        duration: 1,
        ease: "none",
      })
      // 2. Characters scatter with random trajectories (fixed at init time)
      .to(
        charEls,
        {
          y: () => gsap.utils.random(200, 600),
          x: () => gsap.utils.random(-300, 300),
          rotation: () => gsap.utils.random(-180, 180),
          opacity: 0,
          duration: 0.7,
          stagger: { each: 0.006, from: "random" },
          ease: "power3.in",
        },
        "+=0.15"
      )
      // Fade strikethrough out with the shatter
      .to("#problem-strikethrough", { opacity: 0, duration: 0.4 }, "<")
      // 3. Solution block drops in from above
      .to(
        "#solution-block",
        { y: 0, opacity: 1, duration: 0.8, ease: "back.out(1.2)" },
        "+=0.25"
      );

    ScrollTrigger.create({
      trigger: "#problem-solution",
      start: "top top",
      end: "+=350%",
      pin: true,
      scrub: 1.2,
      animation: problemTl,
      invalidateOnRefresh: true,
    });

    // ── SECTION 6: Proof — fade in ────────────────────────────────────────
    gsap.to("#proof-content", {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: "#proof-content",
        start: "top 80%",
        toggleActions: "play none none none",
      },
    });

    // ── Cleanup ───────────────────────────────────────────────────────────
    return () => {
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      window.removeEventListener("resize", positionStrikethrough);
    };
  }, []);

  return null;
}
