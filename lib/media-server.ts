import "server-only";

import { randomUUID } from "node:crypto";

import { logActivity } from "@/lib/audit";
import { sql } from "@/lib/db";
import { imageSize, toWebImage } from "@/lib/image-process";
import { deleteFromR2, hasR2, uploadToR2 } from "@/lib/r2";

/** Largest image a form may send (the browser compresses to ~400 KB first). */
export const FORM_IMAGE_MAX_BYTES = 3.5 * 1024 * 1024;

const RASTER = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);

export type StoredImage = { url: string; key: string };

/** Returns the uploaded File for `field`, or null when the form didn't include one. */
export function pickImageFile(formData: FormData, field: string): File | null {
  const value = formData.get(field);
  return value instanceof File && value.size > 0 ? value : null;
}

/** Validates an image without storing it. Returns an error message or null. */
export function checkImageFile(file: File): string | null {
  if (file.size > FORM_IMAGE_MAX_BYTES) return "Image is too large (max 3.5 MB after compression).";
  if (!RASTER.has(file.type) && file.type !== "image/svg+xml") return "Please use a JPG, PNG, WebP, AVIF, GIF or SVG image.";
  return null;
}

/**
 * Stores an image from a submitted form in R2 and records it in the media
 * library. Call this only after every other field has been validated, so a
 * failed submission never leaves files behind. Raster images are verified
 * and, if still heavy, re-encoded (WebP, ≤ 1600 px) on the server too.
 */
export async function storeFormImage(file: File, ownerId: string, label: string): Promise<StoredImage> {
  if (!hasR2()) throw new Error("File storage isn't configured.");
  const problem = checkImageFile(file);
  if (problem) throw new Error(problem);

  let body: Buffer = Buffer.from(await file.arrayBuffer());
  let contentType = file.type;
  let ext = "svg";

  if (contentType === "image/svg+xml") {
    const text = body.toString("utf8");
    if (!/<svg[\s>]/i.test(text) || /<script|on[a-z]+\s*=|javascript:/i.test(text)) throw new Error("That SVG file isn't allowed.");
  } else {
    const meta = await imageSize(body, contentType === "image/gif");
    if (!meta) throw new Error("That file isn't a valid image.");
    const heavy = body.length > 600 * 1024 || Math.max(meta.width, meta.height) > 2000;
    if (heavy && contentType !== "image/gif") {
      body = await toWebImage(body);
      contentType = "image/webp";
    }
    ext = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif", "image/gif": "gif" }[contentType] ?? "webp";
  }

  const key = `media/${new Date().getFullYear()}/${randomUUID()}.${ext}`;
  const { url } = await uploadToR2({ key, body, contentType });
  const fileName = `${label.slice(0, 80) || "image"}.${ext}`;
  const [row] = await sql`
    insert into files (owner_id, file_url, file_key, file_name, file_size, mime_type)
    values (${ownerId}, ${url}, ${key}, ${fileName}, ${body.length}, ${contentType})
    returning id
  `;
  await logActivity(ownerId, { action: "media.upload", entity: "media", entityId: row.id, summary: `Uploaded ${fileName}` });
  return { url, key };
}

/** Removes an image stored by storeFormImage when the save that needed it failed. */
export async function discardStoredImage(image: StoredImage | null) {
  if (!image) return;
  await deleteFromR2(image.key).catch(() => {});
  await sql`delete from files where file_key = ${image.key}`.catch(() => {});
}
