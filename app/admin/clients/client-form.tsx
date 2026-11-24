"use client";

import { useActionState, useRef, useState } from "react";
import { CheckCircle2, ImagePlus, Loader2, RefreshCw, Trash2 } from "lucide-react";

import { uploadMedia } from "@/lib/media-upload";

import type { FormState } from "@/app/(account)/client/actions";

const inputClass =
  "h-11 w-full rounded-xl border border-neutral-200 bg-white px-3.5 text-sm outline-none transition focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10";

type Values = { name: string; slug: string; contact_email: string; contact_phone: string; logo_url: string; notes: string };

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function ClientForm({
  action,
  initial,
  submitLabel,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  initial?: Partial<Values>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const e = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state.error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <F label="Client name" error={e.name}>
          <input
            name="name"
            required
            defaultValue={initial?.name}
            onChange={(ev) => !slugTouched && setSlug(slugify(ev.target.value))}
            className={inputClass}
          />
        </F>
        <F label="Slug" error={e.slug}>
          <input
            name="slug"
            required
            value={slug}
            onChange={(ev) => {
              setSlugTouched(true);
              setSlug(ev.target.value);
            }}
            className={inputClass}
          />
        </F>
        <F label="Contact email" error={e.contact_email}>
          <input name="contact_email" type="email" defaultValue={initial?.contact_email} className={inputClass} />
        </F>
        <F label="Contact phone" error={e.contact_phone}>
          <input name="contact_phone" defaultValue={initial?.contact_phone} className={inputClass} />
        </F>
      </div>
      <LogoField initial={initial?.logo_url ?? ""} error={e.logo_url} />
      <F label="Internal notes" error={e.notes}>
        <textarea name="notes" rows={4} defaultValue={initial?.notes} className={`${inputClass} h-auto py-3`} />
      </F>
      <div className="flex items-center justify-end gap-3">
        {state.ok && !pending && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-700">
            <CheckCircle2 className="h-4 w-4" /> Saved
          </span>
        )}
        <button type="submit" disabled={pending} className="inline-flex h-11 items-center gap-2 rounded-xl bg-neutral-950 px-5 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-60">
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

function F({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-neutral-800">{label}</span>
        {children}
      </label>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function LogoField({ initial, error }: { initial: string; error?: string }) {
  const [url, setUrl] = useState(initial);
  const [progress, setProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const busy = progress !== null;

  async function handle(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("Please choose an image (PNG, SVG, JPG or WebP).");
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

  return (
    <div>
      <span className="mb-2 block text-sm font-medium text-neutral-800">Client logo</span>
      <input type="hidden" name="logo_url" value={url} />
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
        className={`flex flex-col items-center gap-4 rounded-2xl border border-dashed p-4 transition sm:flex-row ${
          dragging ? "border-neutral-950 bg-neutral-50" : "border-neutral-300"
        }`}
      >
        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-neutral-200 bg-[repeating-conic-gradient(#f5f5f5_0%_25%,#fff_0%_50%)] bg-[length:16px_16px]">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="Client logo" className="h-full w-full object-contain p-2" />
          ) : (
            <ImagePlus className="h-6 w-6 text-neutral-400" />
          )}
          {busy && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-white/85 text-xs font-semibold text-neutral-700">
              <Loader2 className="h-4 w-4 animate-spin" />
              {progress}%
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center sm:items-start sm:text-left">
          <p className="text-sm text-neutral-600">
            {url ? "Logo uploaded." : "Drag a logo here or choose a file."}{" "}
            <span className="text-neutral-400">PNG or SVG with a transparent background works best.</span>
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-neutral-950 px-3.5 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-60"
            >
              {url ? <RefreshCw className="h-4 w-4" /> : <ImagePlus className="h-4 w-4" />}
              {url ? "Replace" : "Upload logo"}
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
          accept="image/png,image/svg+xml,image/jpeg,image/webp,image/avif"
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
