import { NextResponse } from "next/server";
import { uploadBlogImage } from "@/lib/blob";
import { processContentImage, processOgImage } from "@/lib/image";

export const runtime = "nodejs";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid form data" }, { status: 400 });
  }

  const file = form.get("file");
  const kind = form.get("kind") === "cover" ? "cover" : "content";

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "No file provided" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ ok: false, error: "File must be an image" }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ ok: false, error: "Image must be under 10MB" }, { status: 400 });
  }

  const inputBuffer = Buffer.from(await file.arrayBuffer());
  const id = crypto.randomUUID();

  try {
    const main = await processContentImage(inputBuffer);
    const url = await uploadBlogImage(`${id}-main.webp`, main.buffer);

    let ogUrl: string | undefined;
    if (kind === "cover") {
      const og = await processOgImage(inputBuffer);
      ogUrl = await uploadBlogImage(`${id}-og.webp`, og.buffer);
    }

    return NextResponse.json({
      ok: true,
      url,
      ogUrl,
      width: main.width,
      height: main.height,
    });
  } catch (err) {
    console.error("Image processing/upload failed:", err);
    return NextResponse.json({ ok: false, error: "Failed to process image" }, { status: 500 });
  }
}
