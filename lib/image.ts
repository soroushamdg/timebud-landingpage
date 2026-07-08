import "server-only";
import sharp from "sharp";

const MAX_CONTENT_WIDTH = 1600;
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const WEBP_QUALITY = 80;

export interface ProcessedImage {
  buffer: Buffer;
  width: number;
  height: number;
}

/**
 * Normalizes an uploaded image for the blog: strips EXIF/metadata, converts
 * to WebP, and downscales to a max width (never upscales small images).
 */
export async function processContentImage(input: Buffer): Promise<ProcessedImage> {
  const image = sharp(input).rotate(); // .rotate() with no args auto-orients from EXIF, then strips it
  const metadata = await image.metadata();
  const targetWidth = Math.min(metadata.width ?? MAX_CONTENT_WIDTH, MAX_CONTENT_WIDTH);

  const buffer = await image
    .resize({ width: targetWidth, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  const outMeta = await sharp(buffer).metadata();
  return { buffer, width: outMeta.width ?? targetWidth, height: outMeta.height ?? 0 };
}

/**
 * Produces a 1200x630 center-cropped WebP suitable for Open Graph / Twitter
 * card images.
 */
export async function processOgImage(input: Buffer): Promise<ProcessedImage> {
  const buffer = await sharp(input)
    .rotate()
    .resize({ width: OG_WIDTH, height: OG_HEIGHT, fit: "cover", position: "attention" })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  return { buffer, width: OG_WIDTH, height: OG_HEIGHT };
}
