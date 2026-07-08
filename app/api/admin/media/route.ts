import { NextResponse } from "next/server";
import { listBlogImages } from "@/lib/blob";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const images = await listBlogImages();
    return NextResponse.json({ ok: true, images });
  } catch (err) {
    console.error("Failed to list media:", err);
    return NextResponse.json({ ok: false, error: "Failed to list media" }, { status: 500 });
  }
}
