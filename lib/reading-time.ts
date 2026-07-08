import readingTime from "reading-time";

export function computeReadingTimeMinutes(mdxContent: string): number {
  const { minutes } = readingTime(mdxContent);
  return Math.max(1, Math.ceil(minutes));
}
