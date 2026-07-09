import type { InternalLinkSuggestion } from "@/db/schema";

// Regions where splicing markdown link syntax would corrupt the output rather
// than add a link: fenced code blocks, inline code spans, existing markdown
// links (also prevents double-linking the same phrase across suggestions,
// since an inserted link becomes "protected" for the next suggestion), and
// MDX/JSX component tags (self-closing or opening — attribute strings must
// never be rewritten).
const PROTECTED_REGION = /```[\s\S]*?```|`[^`]*`|\[[^\]]*\]\([^)]*\)|<[^>]*>/g;

function isHeadingLine(content: string, lineStart: number): boolean {
  return /^ {0,3}#{1,6} /.test(content.slice(lineStart, lineStart + 10));
}

/** First index of `needle` in `content` that isn't inside a protected region or a heading line, or -1. */
function findSafeIndex(content: string, needle: string): number {
  const protectedRanges: Array<[number, number]> = [];
  PROTECTED_REGION.lastIndex = 0;
  let region: RegExpExecArray | null;
  while ((region = PROTECTED_REGION.exec(content))) {
    protectedRanges.push([region.index, region.index + region[0].length]);
  }

  let searchFrom = 0;
  while (searchFrom <= content.length) {
    const idx = content.indexOf(needle, searchFrom);
    if (idx === -1) return -1;
    const end = idx + needle.length;
    const overlapsProtected = protectedRanges.some(([start, stop]) => idx < stop && end > start);
    if (!overlapsProtected) {
      const lineStart = content.lastIndexOf("\n", idx) + 1;
      if (!isHeadingLine(content, lineStart)) return idx;
    }
    searchFrom = idx + 1;
  }
  return -1;
}

/**
 * Turns AI-suggested internal links into real markdown links in the rendered
 * post body — done at request time (never persisted), so the editor's raw
 * content and the DB row are untouched and this can be re-tuned or reverted
 * without a migration. Each suggestion's anchorText must appear verbatim in
 * the content; anything that doesn't match, or would land inside a heading,
 * code, or an existing tag/link, is silently skipped rather than forced in.
 */
export function injectInternalLinks(content: string, suggestions: InternalLinkSuggestion[]): string {
  let result = content;
  for (const { anchorText, targetSlug } of suggestions) {
    if (!anchorText?.trim() || !targetSlug?.trim()) continue;
    const idx = findSafeIndex(result, anchorText);
    if (idx === -1) continue;
    const replacement = `[${anchorText}](/blog/${targetSlug})`;
    result = result.slice(0, idx) + replacement + result.slice(idx + anchorText.length);
  }
  return result;
}
