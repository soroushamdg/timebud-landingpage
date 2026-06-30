"use client";

import Image from "next/image";
import WaitlistForm from "./components/WaitlistForm";
import ScrollAnimations from "./components/ScrollAnimations";
import LanguageSwitcher from "./components/LanguageSwitcher";
import { useLanguage } from "./components/LanguageProvider";
import { translations } from "./i18n/translations";

function PixelDivider() {
  return (
    <div style={{ width: "100%", borderTop: "4px dashed #000", margin: 0 }} />
  );
}

function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={className}
      style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 1.5rem" }}
    >
      {children}
    </div>
  );
}

export default function HomePage() {
  const { lang } = useLanguage();
  const s = translations[lang];

  return (
    <>
      <LanguageSwitcher />
      <main style={{ background: "#FDC800", minHeight: "100vh" }}>

        {/* ── SECTION 1: Hero ──────────────────────────────────────────────── */}
        <section
          id="hero"
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
            padding: "4rem 1.5rem",
          }}
        >
          {/* Single wrapper — GSAP moves/rotates this across the screen */}
          <div
            id="mascot-wrapper"
            style={{ position: "absolute", top: "50%", left: "5%" }}
          >
            <div id="mascot-thinking">
              <Image
                src="/thinking.png"
                alt="TimeBud mascot thinking"
                width={200}
                height={200}
                priority
                style={{ imageRendering: "pixelated" }}
              />
            </div>
            {/* winking.png stacked on top, opacity 0 — GSAP crossfades */}
            <div
              id="mascot-winking"
              style={{ position: "absolute", top: 0, left: 0, opacity: 0 }}
            >
              <Image
                src="/winking.png"
                alt="TimeBud mascot winking"
                width={200}
                height={200}
                style={{ imageRendering: "pixelated" }}
              />
            </div>
          </div>

          <div style={{ textAlign: "center", zIndex: 1 }}>
            <h1
              id="hero-t1"
              className="display-font"
              style={{
                fontSize: "clamp(1.5rem, 5vw, 4rem)",
                lineHeight: 1.4,
                color: "#000",
                margin: 0,
              }}
            >
              {s.heroT1}
            </h1>
            {/* T2 — GSAP sets xPercent:-50, y:40, opacity:0 initially then animates in */}
            <h1
              id="hero-t2"
              className="display-font"
              style={{
                fontSize: "clamp(1.5rem, 5vw, 4rem)",
                lineHeight: 1.4,
                color: "#000",
                margin: 0,
                position: "absolute",
                left: "50%",
                opacity: 0,
                pointerEvents: "none",
                whiteSpace: "nowrap",
              }}
            >
              {s.heroT2}
            </h1>
          </div>
        </section>

        <PixelDivider />

        {/* ── SECTION 2: Tagline ───────────────────────────────────────────── */}
        <section id="tagline" className="section-padding">
          <Container>
            <p
              id="tagline-text"
              style={{
                fontFamily: "var(--font-body), sans-serif",
                fontSize: "clamp(1.25rem, 3vw, 2.25rem)",
                fontWeight: 700,
                color: "#000",
                maxWidth: "700px",
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              {s.tagline}
            </p>
          </Container>
        </section>

        <PixelDivider />

        {/* ── SECTION 3: Founder / "me." ───────────────────────────────────── */}
        <section id="founder" className="section-padding">
          <Container>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 280px) 1fr",
                gap: "3rem",
                alignItems: "start",
              }}
            >
              <div
                className="pixel-border"
                style={{ aspectRatio: "1 / 1", overflow: "hidden", position: "relative" }}
              >
                <Image
                  src="/placeholder-founder.jpeg"
                  alt="Founder photo"
                  fill
                  style={{ objectFit: "cover", imageRendering: "pixelated" }}
                />
              </div>

              <div>
                <h2
                  className="display-font"
                  style={{ fontSize: "clamp(2rem, 6vw, 5rem)", margin: "0 0 2rem", lineHeight: 1 }}
                >
                  {s.founderHeading}
                </h2>

                {/* Sequential lines — GSAP swaps in Pass 2; line 0 visible by default */}
                <div style={{ position: "relative", minHeight: "3rem" }}>
                  <p
                    id="founder-line-0"
                    style={{
                      fontFamily: "var(--font-body), sans-serif",
                      fontSize: "clamp(1rem, 2.5vw, 1.5rem)",
                      fontWeight: 500,
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    {s.founderLine0}
                  </p>
                  <p
                    id="founder-line-1"
                    style={{
                      fontFamily: "var(--font-body), sans-serif",
                      fontSize: "clamp(1rem, 2.5vw, 1.5rem)",
                      fontWeight: 500,
                      margin: 0,
                      lineHeight: 1.5,
                      position: "absolute",
                      top: 0,
                      left: 0,
                      opacity: 0,
                      pointerEvents: "none",
                    }}
                  >
                    {s.founderLine1}
                  </p>
                  <p
                    id="founder-line-2"
                    style={{
                      fontFamily: "var(--font-body), sans-serif",
                      fontSize: "clamp(1rem, 2.5vw, 1.5rem)",
                      fontWeight: 500,
                      margin: 0,
                      lineHeight: 1.5,
                      position: "absolute",
                      top: 0,
                      left: 0,
                      opacity: 0,
                      pointerEvents: "none",
                    }}
                  >
                    {s.founderLine2}
                  </p>
                </div>
              </div>
            </div>
          </Container>
        </section>

        <PixelDivider />

        {/* ── SECTION 4: Built for ─────────────────────────────────────────── */}
        <section id="built-for" className="section-padding">
          <Container>
            <div id="built-for-content" style={{ maxWidth: "680px" }}>
              <p
                className="display-font"
                style={{
                  fontSize: "clamp(0.75rem, 2vw, 1.25rem)",
                  marginBottom: "1.5rem",
                  letterSpacing: "0.05em",
                }}
              >
                {s.builtForHeading}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-body), sans-serif",
                  fontSize: "clamp(1.1rem, 2.5vw, 1.75rem)",
                  fontWeight: 500,
                  lineHeight: 1.55,
                  margin: 0,
                }}
              >
                {s.builtForBody}
              </p>
            </div>
          </Container>
        </section>

        <PixelDivider />

        {/* ── SECTION 5: Core problem → solution ──────────────────────────── */}
        <section id="problem-solution" className="section-padding">
          <Container>
            <div style={{ maxWidth: "780px" }}>

              {/* Problem */}
              <div id="problem-block" style={{ marginBottom: "4rem", position: "relative" }}>
                <p
                  style={{
                    fontFamily: "var(--font-body), sans-serif",
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: "1rem",
                    opacity: 0.5,
                  }}
                >
                  {s.problemLabel}
                </p>
                <div style={{ position: "relative" }}>
                  <p
                    id="problem-text"
                    style={{
                      fontFamily: "var(--font-body), sans-serif",
                      fontSize: "clamp(1.25rem, 3vw, 2rem)",
                      fontWeight: 700,
                      lineHeight: 1.4,
                      margin: 0,
                    }}
                  >
                    {s.problemText}
                  </p>
                  {/* Strikethrough — GSAP positions and animates width */}
                  <div
                    id="problem-strikethrough"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "0%",
                      height: "6px",
                      background: "#000",
                    }}
                  />
                </div>
              </div>

              {/* Solution — initially hidden; GSAP drops it in after shatter */}
              <div id="solution-block" style={{ opacity: 0 }}>
                <p
                  style={{
                    fontFamily: "var(--font-body), sans-serif",
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: "1rem",
                    opacity: 0.5,
                  }}
                >
                  {s.solutionLabel}
                </p>
                <p
                  id="solution-text"
                  style={{
                    fontFamily: "var(--font-body), sans-serif",
                    fontSize: "clamp(1.25rem, 3vw, 2rem)",
                    fontWeight: 700,
                    lineHeight: 1.4,
                    margin: 0,
                  }}
                >
                  {s.solutionText}
                </p>
              </div>
            </div>
          </Container>
        </section>

        <PixelDivider />

        {/* ── SECTION 6: Proof / screenshot ───────────────────────────────── */}
        <section id="proof" className="section-padding">
          <Container>
            <div
              id="proof-content"
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 280px) 1fr",
                gap: "3rem",
                alignItems: "center",
              }}
            >
              <div
                className="pixel-border"
                style={{ aspectRatio: "1 / 2.1", overflow: "hidden", position: "relative" }}
              >
                <Image
                  src="/placeholder-screenshot.png"
                  alt="TimeBud app screenshot"
                  fill
                  style={{ objectFit: "cover", imageRendering: "pixelated" }}
                />
              </div>

              <blockquote className="proof-quote">
                &ldquo;{s.proofQuote}&rdquo;
              </blockquote>
            </div>
          </Container>
        </section>

        <PixelDivider />

        {/* ── SECTION 7: CTA ───────────────────────────────────────────────── */}
        <section id="cta" className="section-padding">
          <Container>
            <div style={{ display: "flex", flexDirection: "column", gap: "3rem", maxWidth: "600px" }}>

              {/* Path 1: Try it free — no backend, plain link */}
              <div>
                <a
                  href="https://app.timebud.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pixel-btn"
                  style={{ fontSize: "0.875rem" }}
                >
                  {s.ctaButton}
                </a>
              </div>

              {/* Path 2: iOS waitlist — only element touching backend */}
              <div>
                <p
                  style={{
                    fontFamily: "var(--font-body), sans-serif",
                    fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
                    fontWeight: 700,
                    marginBottom: "1rem",
                  }}
                >
                  {s.iosNotify}
                </p>
                <WaitlistForm />
              </div>

              <p
                style={{
                  fontFamily: "var(--font-body), sans-serif",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  margin: 0,
                  borderTop: "3px dashed #000",
                  paddingTop: "1.5rem",
                }}
              >
                {s.footerNote}
              </p>
            </div>
          </Container>
        </section>

      </main>
      {/* Key forces full remount (new Lenis + ScrollTriggers) on language switch */}
      <ScrollAnimations key={lang} />
    </>
  );
}
