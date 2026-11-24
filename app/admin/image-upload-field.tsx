"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, RefreshCw, Trash2 } from "lucide-react";

import { uploadMedia } from "@/lib/media-upload";

/**
 * Image picker for admin forms: uploads to R2 (presigned PUT, compressed in the
 * browser) and submits the resulting public URL through a hidden input.
 */
export default function ImageUploadField({
  name,
  label,
  initial = "",
  hint,
  variant = "square",
  error,
}: {
  name: string;
  label: string;
  initial?: string | null;
  hint?: string;
  variant?: "square" | "cover";
  error?: string;
}) {
  const [url, setUrl] = useState(initial ?? "");
  const [progress, setProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const busy = progress !== null;
  const cover = variant === "cover";

  async function handle(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("Please choose an image (JPG, PNG, WebP or SVG).");
      return;
    }
    setUploadError(null);
    setProgress(0);
    try {
      const uploaded = await uploadMedia(file, setProgress);
      setUrl(uploaded.file_url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setProgress(null);
    }
  }

  const preview = (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden border border-neutral-200 bg-[repeating-conic-gradient(#f5f5f5_0%_25%,#fff_0%_50%)] bg-[length:16px_16px] ${
        cover ? "aspect-[16/10] w-full rounded-2xl" : "h-20 w-20 rounded-2xl"
      }`}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={label} className={`h-full w-full ${cover ? "object-cover object-top" : "object-contain p-2"}`} />
      ) : (
        <span className="flex flex-col items-center gap-2 text-neutral-400">
          <ImagePlus className="h-6 w-6" />
          {cover && <span className="text-xs">Drop an image here</span>}
        </span>
      )}
      {busy && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/85 text-xs font-semibold text-neutral-700">
          <Loader2 className="h-5 w-5 animate-spin" />
          Uploading {progress}%
          {cover && (
            <span className="h-1 w-40 overflow-hidden rounded-full bg-neutral-200">
              <span className="block h-full bg-neutral-950 transition-all" style={{ width: `${progress}%` }} />
            </span>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div>
      <span className="mb-2 block text-sm font-medium text-neutral-900">{label}</span>
      <input type="hidden" name={name} value={url} />
      <div
        onDragOver={(ev) => {
          ev.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(ev) => {
          ev.preventDefault();
          setDragging(false);
          handle(ev.dataTransfer.files?.[0]);
        }}
        className={`flex gap-4 rounded-2xl border border-dashed p-4 transition ${cover ? "flex-col" : "flex-col items-center sm:flex-row"} ${
          dragging ? "border-neutral-950 bg-neutral-50" : "border-neutral-300"
        }`}
      >
        {cover ? (
          <button type="button" onClick={() => inputRef.current?.click()} disabled={busy} className="block w-full text-left" aria-label={url ? "Replace image" : "Upload image"}>
            {preview}
          </button>
        ) : (
          preview
        )}
        <div className={`flex min-w-0 flex-1 flex-col gap-2 ${cover ? "sm:flex-row sm:items-center sm:justify-between" : "items-center text-center sm:items-start sm:text-left"}`}>
          {hint && <p className="text-xs leading-5 text-neutral-500">{hint}</p>}
          <div className="flex shrink-0 flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-neutral-950 px-3.5 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-60"
            >
              {url ? <RefreshCw className="h-4 w-4" /> : <ImagePlus className="h-4 w-4" />}
              {url ? "Replace" : "Upload image"}
            </button>
            {url && (
              <button
                type="button"
                disabled={busy}
                onClick={() => setUrl("")}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-neutral-200 px-3.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" /> Remove
              </button>
            )}
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml,image/heic"
          className="hidden"
          onChange={(ev) => {
            handle(ev.target.files?.[0]);
            ev.target.value = "";
          }}
        />
      </div>
      {(uploadError || error) && <p className="mt-1.5 text-xs text-red-600">{uploadError || error}</p>}
    </div>
  );
}
