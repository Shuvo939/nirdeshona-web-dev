"use client";

/** Hard ceiling for any image we store. */
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

const nextFrame = () => new Promise((r) => setTimeout(r, 0));

export type CompressOptions = {
  /** Longest side in pixels. WhatsApp sends photos at ~1600 px. */
  maxEdge?: number;
  /** Aim for this size; quality steps down until it fits. */
  targetBytes?: number;
  /** Never return anything larger than this. */
  maxBytes?: number;
  /** 0–100 while working. */
  onProgress?: (percent: number) => void;
};

/**
 * WhatsApp-style compression: resize to ~1600 px on the long edge and
 * re-encode as WebP (JPEG fallback) at the highest quality that fits
 * `targetBytes` (≈ 400 KB by default). A typical 4–8 MB phone photo ends up
 * around 150–400 KB and still looks sharp on screen. Images that are already
 * small and modest in size are left untouched.
 */
export async function compressImage(file: File, options: CompressOptions = {}): Promise<File> {
  const { maxEdge = 1600, targetBytes = 400 * 1024, maxBytes = IMAGE_MAX_BYTES, onProgress } = options;
  if (!isCompressibleImage(file)) return file;
  onProgress?.(5);

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    onProgress?.(100);
    if (file.size <= maxBytes) return file; // e.g. HEIC the browser can't decode
    throw new Error("This image format can't be compressed in your browser. Please use JPG or PNG.");
  }
  onProgress?.(20);

  const longEdge = Math.max(bitmap.width, bitmap.height);
  if (file.size <= Math.min(targetBytes, 200 * 1024) && longEdge <= maxEdge) {
    bitmap.close();
    onProgress?.(100);
    return file;
  }

  const edges = [maxEdge, Math.round(maxEdge * 0.8), Math.round(maxEdge * 0.65)];
  const qualities = [0.8, 0.72, 0.64, 0.56];
  const total = edges.length * qualities.length;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";

  let smallest: Blob | null = null;
  let step = 0;
  let lastScale = 0;
  try {
    for (const edge of edges) {
      const scale = Math.min(1, edge / longEdge);
      if (scale === lastScale) {
        step += qualities.length;
        continue;
      }
      lastScale = scale;
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      for (const quality of qualities) {
        step++;
        await nextFrame();
        const blob = await encode(canvas, quality);
        onProgress?.(20 + Math.round((step / total) * 75));
        if (!blob) continue;
        if (!smallest || blob.size < smallest.size) smallest = blob;
        if (blob.size <= targetBytes) {
          smallest = blob;
          throw "done";
        }
      }
    }
  } catch (signal) {
    if (signal !== "done") throw signal;
  } finally {
    bitmap.close();
  }

  onProgress?.(100);
  if (!smallest) throw new Error("Couldn't process this image.");
  if (smallest.size >= file.size && longEdge <= maxEdge) return file; // re-encoding didn't help
  if (smallest.size > maxBytes) throw new Error("Couldn't compress this image below 5 MB.");
  const ext = smallest.type === "image/webp" ? "webp" : "jpg";
  return new File([smallest], `${file.name.replace(/\.[^.]+$/, "")}.${ext}`, { type: smallest.type, lastModified: Date.now() });
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
