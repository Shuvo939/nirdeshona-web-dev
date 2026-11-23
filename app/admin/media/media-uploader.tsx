"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UploadCloud } from "lucide-react";

import { MEDIA_MAX_SIZE, MEDIA_TYPES } from "@/lib/media";

type Job = { id: string; name: string; progress: number; error?: string; done?: boolean };

// Downscale large photos in the browser before uploading (saves bandwidth and storage).
async function compress(file: File): Promise<File> {
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

export default function MediaUploader() {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [drag, setDrag] = useState(false);

  const patch = (id: string, u: Partial<Job>) => setJobs((j) => j.map((x) => (x.id === id ? { ...x, ...u } : x)));

  async function uploadOne(original: File) {
    const id = crypto.randomUUID();
    setJobs((j) => [{ id, name: original.name, progress: 0 }, ...j]);
    try {
      if (!(original.type in MEDIA_TYPES)) throw new Error("Unsupported file type");
      const file = await compress(original);
      if (file.size > MEDIA_MAX_SIZE) throw new Error("Larger than 25 MB");

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
        xhr.upload.onprogress = (e) => e.lengthComputable && patch(id, { progress: Math.round((e.loaded / e.total) * 100) });
        xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error("Upload to storage failed")));
        xhr.onerror = () => reject(new Error("Network error — check R2 CORS"));
        xhr.send(file);
      });

      const done = await fetch("/api/admin/media/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: json.key, fileName: file.name }),
      });
      if (!done.ok) throw new Error((await done.json()).error ?? "Couldn't save");
      patch(id, { done: true, progress: 100 });
    } catch (e) {
      patch(id, { error: e instanceof Error ? e.message : "Upload failed" });
    }
  }

  async function handle(files: FileList | null) {
    if (!files?.length) return;
    await Promise.all(Array.from(files).slice(0, 20).map(uploadOne));
    router.refresh();
    window.setTimeout(() => setJobs((j) => j.filter((x) => !x.done)), 2500);
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          void handle(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
          drag ? "border-neutral-950 bg-neutral-100" : "border-neutral-300 bg-white hover:border-neutral-400 hover:bg-neutral-50"
        }`}
      >
        <UploadCloud className="h-8 w-8 text-neutral-400" />
        <span className="text-sm font-semibold text-neutral-900">Drop files here or click to upload</span>
        <span className="text-xs text-neutral-500">Images (large photos are compressed to WebP), PDF, MP4 · up to 25 MB · 20 at a time</span>
      </button>
      <input ref={input} type="file" multiple accept={Object.keys(MEDIA_TYPES).join(",")} className="hidden" onChange={(e) => { void handle(e.target.files); e.target.value = ""; }} />
      {jobs.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {jobs.map((j) => (
            <li key={j.id} className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs">
              {!j.done && !j.error && <Loader2 className="h-3.5 w-3.5 animate-spin text-neutral-400" />}
              <span className="min-w-0 flex-1 truncate font-medium">{j.name}</span>
              <span className={j.error ? "text-red-600" : j.done ? "text-emerald-600" : "text-neutral-500"}>{j.error ?? (j.done ? "Uploaded" : `${j.progress}%`)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
