"use client";

import { MEDIA_MAX_SIZE, MEDIA_TYPES } from "@/lib/media";

// Downscale large photos in the browser before uploading.
export async function compressImage(file: File): Promise<File> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size < 400 * 1024) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 2400 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob: Blob | null = await new Promise((r) => canvas.toBlob(r, "image/webp", 0.85));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", { type: "image/webp" });
  } catch {
    return file;
  }
}

export type UploadedMedia = { id: string; file_url: string; file_name: string; file_size: number; mime_type: string };

/**
 * Admin media upload: presigned PUT straight to R2 (no 4.5 MB Vercel body
 * limit), then the server verifies the object and records it in `files`.
 */
export async function uploadMedia(original: File, onProgress?: (percent: number) => void): Promise<UploadedMedia & { key: string }> {
  if (!(original.type in MEDIA_TYPES)) throw new Error("Unsupported file type");
  const file = await compressImage(original);
  if (file.size > MEDIA_MAX_SIZE) throw new Error("File is larger than 25 MB");

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
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(Math.round((e.loaded / e.total) * 100));
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
