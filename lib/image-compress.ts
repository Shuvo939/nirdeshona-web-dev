"use client";

export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;

const COMPRESSIBLE = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/heic", "image/heif"]);

export function isCompressibleImage(file: File) {
  return COMPRESSIBLE.has(file.type.toLowerCase());
}

function encode(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) =>
    canvas.toBlob(
      (blob) => {
        // Some browsers can't encode WebP and silently return PNG — fall back to JPEG.
        if (blob && blob.type === "image/webp") return resolve(blob);
        canvas.toBlob(resolve, "image/jpeg", quality);
      },
      "image/webp",
      quality,
    ),
  );
}

/**
 * WhatsApp-style compression: any size is accepted. Photos are re-encoded
 * starting at high quality and a generous long edge (2560 px), stepping down
 * only as far as needed to fit under `maxBytes`. Small images that already
 * fit are left untouched. Throws only if it can't get under the limit.
 */
export async function compressImage(
  file: File,
  { maxBytes = IMAGE_MAX_BYTES, maxEdge = 2560 }: { maxBytes?: number; maxEdge?: number } = {},
): Promise<File> {
  if (!isCompressibleImage(file)) return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    if (file.size <= maxBytes) return file; // e.g. HEIC the browser can't decode
    throw new Error("This image format can't be compressed in your browser. Please use JPG or PNG.");
  }

  const longEdge = Math.max(bitmap.width, bitmap.height);
  if (file.size <= Math.min(maxBytes, 1.5 * 1024 * 1024) && longEdge <= maxEdge) {
    bitmap.close();
    return file;
  }

  const edges = [maxEdge, 2048, 1600, 1280].filter((e, i, all) => e <= maxEdge && all.indexOf(e) === i);
  const qualities = [0.86, 0.8, 0.72, 0.64];
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";

  try {
    for (const edge of edges) {
      const scale = Math.min(1, edge / longEdge);
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      for (const quality of qualities) {
        const blob = await encode(canvas, quality);
        if (blob && blob.size <= maxBytes) {
          // Keep the original if re-encoding didn't actually help.
          if (file.size <= maxBytes && blob.size >= file.size && longEdge <= maxEdge) return file;
          const ext = blob.type === "image/webp" ? "webp" : "jpg";
          return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.${ext}`, { type: blob.type, lastModified: Date.now() });
        }
      }
    }
  } finally {
    bitmap.close();
  }
  throw new Error("Couldn't compress this image below 5 MB.");
}
