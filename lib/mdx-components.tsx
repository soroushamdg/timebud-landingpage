import type { MDXComponents } from "mdx/types";
import type { ComponentPropsWithoutRef } from "react";

function CTAButton({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <p style={{ margin: "2rem 0" }}>
      <a href={href} className="pixel-btn">
        {label}
      </a>
    </p>
  );
}

function Callout({
  type = "tip",
  children,
}: {
  type?: "tip" | "warning";
  children: React.ReactNode;
}) {
  return (
    <div className={`pixel-callout ${type === "warning" ? "pixel-callout--warning" : ""}`}>
      <span className="pixel-callout-label">{type === "warning" ? "⚠ WATCH OUT" : "💡 TIP"}</span>
      {children}
    </div>
  );
}

function BlogImage(props: ComponentPropsWithoutRef<"img">) {
  // Images are already resized/optimized to WebP at upload time (see lib/image.ts),
  // so a plain <img> is used rather than next/image — MDX authors only provide a
  // URL + alt text, not intrinsic dimensions, which next/image requires.
  // eslint-disable-next-line @next/next/no-img-element
  return <img {...props} loading="lazy" decoding="async" alt={props.alt ?? ""} />;
}

export const mdxComponents: MDXComponents = {
  CTAButton,
  Callout,
  img: BlogImage,
};
