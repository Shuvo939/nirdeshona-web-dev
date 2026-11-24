"use client";

import { compressImage } from "@/lib/image-compress";
import { MEDIA_MAX_SIZE, MEDIA_TYPES, maxSizeFor } from "@/lib/media";

export type UploadedMedia = { id: string; file_url: string; file_name: string; file_size: number; mime_type: string };

/**
 * Admin media upload: presigned PUT straight to R2 (no 4.5 MB Vercel body
 * limit), then the server verifies the object and records it in `files`.
 */
export async function uploadMedia(original: File, onProgress?: (percent: number) => void): Promise<UploadedMedia & { key: string }> {
  if (!(original.type in MEDIA_TYPES)) throw new Error("Unsupported file type");
  // Progress: optimizing 0–30 %, uploading 30–100 %.
  const file = await compressImage(original, { onProgress: (p) => onProgress?.(Math.round(p * 0.3)) });
  if (file.size > maxSizeFor(file.type)) {
    throw new Error(file.type.startsWith("image/") ? "Image is still larger than 5 MB" : `File is larger than ${MEDIA_MAX_SIZE / 1024 / 1024} MB`);
  }

  const res = await fetch("/api/admin/media", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentType: file.type, size: file.size }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Upload failed");

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", json.uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(30 + Math.round((e.loaded / e.total) * 70));
    xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error("Upload to storage failed")));
    xhr.onerror = () => reject(new Error("Network error — check the R2 CORS policy"));
    xhr.send(file);
  });

  const done = await fetch("/api/admin/media/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key: json.key, fileName: file.name }),
  });
  const saved = await done.json();
  if (!done.ok) throw new Error(saved.error ?? "Couldn't save the upload");
  return { ...saved.file, key: json.key };
}
