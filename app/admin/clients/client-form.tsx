"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

import type { FormState } from "@/app/client/actions";

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
      <F label="Logo URL" error={e.logo_url}>
        <input name="logo_url" type="url" placeholder="https://…" defaultValue={initial?.logo_url} className={inputClass} />
      </F>
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
