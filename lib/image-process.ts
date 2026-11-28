import "server-only";

import { getCloudflareContext } from "@opennextjs/cloudflare";

/*
 * Server-side image work, on both runtimes:
 * - Node / Vercel: sharp.
 * - Cloudflare Workers: the Images binding (sharp's native binary can't run there).
 * Browsers already compress before upload; this is the second, trusted pass.
 */

const onWorkers = typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers";

type ImagesBinding = {
  info(stream: ReadableStream<Uint8Array>): Promise<{ width?: number; height?: number; format?: string }>;
  input(stream: ReadableStream<Uint8Array>): {
    transform(t: Record<string, unknown>): {
      output(o: { format: string; quality?: number }): Promise<{ response(): Response }>;
    };
  };
};

function images(): ImagesBinding {
  const binding = (getCloudflareContext().env as { IMAGES?: ImagesBinding }).IMAGES;
  if (!binding) throw new Error("Image processing isn't configured (IMAGES binding missing).");
  return binding;
}

const stream = (buf: Buffer) => new Blob([new Uint8Array(buf)]).stream();

async function cfTransform(buf: Buffer, transform: Record<string, unknown>, quality: number) {
  const out = await images().input(stream(buf)).transform(transform).output({ format: "image/webp", quality });
  return Buffer.from(await out.response().arrayBuffer());
}

/** Width and height, or null when the bytes aren't a readable image. */
export async function imageSize(buf: Buffer, animated = false): Promise<{ width: number; height: number } | null> {
  try {
    if (onWorkers) {
      const info = await images().info(stream(buf));
      return info.width && info.height ? { width: info.width, height: info.height } : null;
    }
    const sharp = (await import("sharp")).default;
    const meta = await sharp(buf, { animated }).metadata();
    return meta.width && meta.height ? { width: meta.width, height: meta.height } : null;
  } catch {
    return null;
  }
}

/** Square avatar: crop to the subject, 400×400 WebP, metadata stripped. */
export async function toAvatar(buf: Buffer): Promise<Buffer> {
  if (onWorkers) return cfTransform(buf, { width: 400, height: 400, fit: "cover", gravity: "auto" }, 82);
  const sharp = (await import("sharp")).default;
  return sharp(buf).rotate().resize(400, 400, { fit: "cover", position: "attention" }).webp({ quality: 82 }).toBuffer();
}

/** Large photo: fit inside 1600×1600 (never enlarged), WebP. */
export async function toWebImage(buf: Buffer): Promise<Buffer> {
  if (onWorkers) return cfTransform(buf, { width: 1600, height: 1600, fit: "scale-down" }, 78);
  const sharp = (await import("sharp")).default;
  return sharp(buf).rotate().resize(1600, 1600, { fit: "inside", withoutEnlargement: true }).webp({ quality: 78 }).toBuffer();
}
