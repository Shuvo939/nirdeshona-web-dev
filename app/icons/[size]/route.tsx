import { ImageResponse } from "next/og";

import { BrandMark } from "@/app/apple-icon";

// PNG app icons for the web manifest: /icons/192, /icons/512.
export async function GET(_req: Request, { params }: { params: Promise<{ size: string }> }) {
  const { size } = await params;
  const px = size === "512" ? 512 : 192;
  const image = new ImageResponse(<BrandMark size={px} />, { width: px, height: px });
  image.headers.set("Cache-Control", "public, max-age=604800, immutable");
  return image;
}
