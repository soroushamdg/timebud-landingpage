import { INSTAGRAM_URL } from "@/lib/site";

/**
 * Instagram pill for the fixed top-left nav. Icon-only under 640px so the nav
 * row (Open App / Blog / Instagram) still fits on small screens.
 */
export default function InstagramLink() {
  return (
    <a
      href={INSTAGRAM_URL}
      target="_blank"
      rel="noopener noreferrer me"
      className="nav-pill"
      aria-label="TimeBud on Instagram"
    >
      <svg
        className="ig-icon"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        {/* Square corners — the site never rounds anything */}
        <rect x="2" y="2" width="20" height="20" stroke="currentColor" strokeWidth="2.25" />
        <circle className="ig-lens" cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="2.25" />
        <circle className="ig-flash" cx="17.4" cy="6.6" r="1.7" fill="currentColor" />
      </svg>
      <span className="nav-pill-label">Instagram</span>
    </a>
  );
}
