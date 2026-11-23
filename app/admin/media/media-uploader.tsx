"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UploadCloud } from "lucide-react";

import { MEDIA_TYPES } from "@/lib/media";
import { uploadMedia } from "@/lib/media-upload";

type Job = { id: string; name: string; progress: number; error?: string; done?: boolean };

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
      await uploadMedia(original, (progress) => patch(id, { progress }));
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
