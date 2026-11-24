"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, ImagePlus, Loader2, RefreshCw, Trash2 } from "lucide-react";

import { compressImage, formatBytes } from "@/lib/image-compress";
import { useSmoothProgress } from "@/lib/use-smooth-progress";

/**
 * Image picker for admin forms. The image is compressed in the browser
 * (WhatsApp-style) and previewed locally, but nothing is uploaded until the
 * form is saved: the compressed file travels with the form as `${name}_file`
 * and the server stores it only after every other field is valid.
 * `${name}` carries the current URL (empty after Remove).
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
  const [preview, setPreview] = useState<string | null>(null);
  const [stats, setStats] = useState<{ before: number; after: number } | null>(null);
  const [target, setTarget] = useState<number | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const pickRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const progress = useSmoothProgress(target);
  const busy = target !== null;
  const cover = variant === "cover";
  const shown = preview ?? url;

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  function setFormFile(file: File | null) {
    if (!fileRef.current) return;
    const dt = new DataTransfer();
    if (file) dt.items.add(file);
    fileRef.current.files = dt.files;
  }

  async function handle(original: File | undefined) {
    if (!original) return;
    if (!original.type.startsWith("image/")) {
      setLocalError("Please choose an image (JPG, PNG, WebP or SVG).");
      return;
    }
    setLocalError(null);
    setTarget(0);
    try {
      const file = await compressImage(original, { onProgress: (p) => setTarget(p) });
      if (file.size > 3.5 * 1024 * 1024) throw new Error("This image is too large even after compression (max 3.5 MB).");
      setFormFile(file);
      setPreview(URL.createObjectURL(file));
      setStats({ before: original.size, after: file.size });
      setTarget(100);
      setTimeout(() => setTarget(null), 450);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Couldn't process that image.");
      setTarget(null);
    }
  }

  function remove() {
    setFormFile(null);
    setPreview(null);
    setStats(null);
    setUrl("");
  }

  const box = (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden border border-neutral-200 bg-[repeating-conic-gradient(#f5f5f5_0%_25%,#fff_0%_50%)] bg-[length:16px_16px] ${
        cover ? "aspect-[16/10] w-full rounded-2xl" : "h-20 w-20 rounded-2xl"
      }`}
    >
      {shown ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={shown} alt={label} className={`h-full w-full ${cover ? "object-cover object-top" : "object-contain p-2"}`} />
      ) : (
        <span className="flex flex-col items-center gap-2 text-neutral-400">
          <ImagePlus className="h-6 w-6" />
          {cover && <span className="text-xs">Click or drop an image</span>}
        </span>
      )}
      {busy && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/85 text-xs font-semibold text-neutral-700">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="tabular-nums">Optimizing {progress}%</span>
          <span className={`h-1 overflow-hidden rounded-full bg-neutral-200 ${cover ? "w-40" : "w-14"}`}>
            <span className="block h-full bg-neutral-950" style={{ width: `${progress}%` }} />
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <span className="mb-2 block text-sm font-medium text-neutral-900">{label}</span>
      <input type="hidden" name={name} value={url} />
      <input ref={fileRef} type="file" name={`${name}_file`} className="hidden" tabIndex={-1} aria-hidden />
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
          <button type="button" onClick={() => pickRef.current?.click()} disabled={busy} className="block w-full text-left" aria-label={shown ? "Replace image" : "Choose image"}>
            {box}
          </button>
        ) : (
          box
        )}
        <div className={`flex min-w-0 flex-1 flex-col gap-2 ${cover ? "sm:flex-row sm:items-center sm:justify-between" : "items-center text-center sm:items-start sm:text-left"}`}>
          <div className="flex flex-col gap-1">
            {stats ? (
              <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Optimized {formatBytes(stats.before)} → {formatBytes(stats.after)} · uploads when you save
              </p>
            ) : (
              hint && <p className="text-xs leading-5 text-neutral-500">{hint}</p>
            )}
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => pickRef.current?.click()}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-neutral-950 px-3.5 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-60"
            >
              {shown ? <RefreshCw className="h-4 w-4" /> : <ImagePlus className="h-4 w-4" />}
              {shown ? "Replace" : "Choose image"}
            </button>
            {shown && (
              <button
                type="button"
                disabled={busy}
                onClick={remove}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-neutral-200 px-3.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" /> Remove
              </button>
            )}
          </div>
        </div>
        <input
          ref={pickRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml,image/heic,image/gif"
          className="hidden"
          onChange={(ev) => {
            handle(ev.target.files?.[0]);
            ev.target.value = "";
          }}
        />
      </div>
      {(localError || error) && <p className="mt-1.5 text-xs text-red-600">{localError || error}</p>}
    </div>
  );
}
