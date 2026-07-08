import "server-only";
import { put, list, del } from "@vercel/blob";

const IMAGE_PREFIX = "blog-images/";

export async function uploadBlogImage(
  path: string,
  buffer: Buffer,
  contentType = "image/webp"
): Promise<string> {
  const { url } = await put(`${IMAGE_PREFIX}${path}`, buffer, {
    access: "public",
    contentType,
    addRandomSuffix: false,
  });
  return url;
}

export async function listBlogImages(limit = 60) {
  const { blobs } = await list({ prefix: IMAGE_PREFIX, limit });
  return blobs
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    .map((b) => ({ url: b.url, uploadedAt: b.uploadedAt, size: b.size }));
}

export async function deleteBlogImage(url: string) {
  await del(url);
}
