"use client";

import Link from "next/link";
import { startTransition, useActionState, useMemo, useState } from "react";
import { AlertCircle, Check, ChevronDown, Loader2, Plus, Search, X } from "lucide-react";

import ImageUploadField from "@/app/admin/image-upload-field";
import MarkdownEditor from "@/app/admin/markdown-editor";
import { PROJECT_CATEGORIES } from "@/lib/projects/categories";
import { techCategories } from "@/lib/site";

import type { ProjectFormState } from "./actions";

const STATUSES = [
  { value: "PLANNED", label: "Planned" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "REVIEW", label: "Review" },
  { value: "COMPLETED", label: "Completed" },
  { value: "ON_HOLD", label: "On Hold" },
] as const;

type ClientOption = { id: string; name: string };

export type ProjectFormValues = {
  title?: string;
  slug?: string;
  short_description?: string;
  description?: string;
  title_bn?: string;
  short_description_bn?: string;
  description_bn?: string;
  features?: string;
  features_bn?: string;
  category?: string;
  client_id?: string;
  status?: string;
  progress_percent?: number;
  featured?: boolean;
  cover_image_url?: string;
  live_url?: string;
  repository_url?: string;
  started_at?: string;
  completed_at?: string;
  technologies?: string[];
};

const inputClass =
  "mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100 disabled:bg-neutral-50 disabled:text-neutral-400";

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function ProjectForm({
  action,
  defaultValues,
  clients = [],
  knownTechnologies = [],
  submitLabel = "Save project",
}: {
  action: (prev: ProjectFormState, formData: FormData) => Promise<ProjectFormState>;
  defaultValues?: ProjectFormValues;
  clients?: ClientOption[];
  knownTechnologies?: string[];
  submitLabel?: string;
}) {
  const v = defaultValues ?? {};
  const editing = Boolean(v.slug);
  const [state, formAction, pending] = useActionState(action, {});
  const e = state.fieldErrors ?? {};

  const [slug, setSlug] = useState(v.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(editing);
  const [status, setStatus] = useState(v.status ?? "PLANNED");
  const [progress, setProgress] = useState(v.progress_percent ?? 0);
  const [noRepo, setNoRepo] = useState(editing && !v.repository_url && v.category === "WordPress");
  const [repoTouched, setRepoTouched] = useState(false);

  return (
    <form
      noValidate={false}
      onSubmit={(ev) => {
        // Submitting through a transition (instead of <form action>) keeps
        // every field as typed if the server reports an error.
        ev.preventDefault();
        const data = new FormData(ev.currentTarget);
        startTransition(() => formAction(data));
      }}
      className="space-y-8"
    >
      {state.error && (
        <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {state.error}
        </div>
      )}

      <Section title="Basic Information" description="Define the project's basic identity and description.">
        <div className="space-y-5">
          <Field id="title" label="Project title" error={e.title}>
            <input
              id="title"
              name="title"
              defaultValue={v.title}
              required
              placeholder="e.g. Nirdeshona Website"
              onChange={(ev) => !slugTouched && setSlug(slugify(ev.target.value))}
              className={inputClass}
            />
          </Field>
          <Field id="slug" label="Slug" error={e.slug} hint="Lowercase letters, numbers and hyphens. Fills in from the title.">
            <input
              id="slug"
              name="slug"
              required
              value={slug}
              onChange={(ev) => {
                setSlugTouched(true);
                setSlug(ev.target.value);
              }}
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              placeholder="nirdeshona-website"
              className={`${inputClass} font-mono`}
            />
          </Field>
          <Field id="short_description" label="Short description" error={e.short_description} hint="One or two sentences shown on project cards.">
            <input id="short_description" name="short_description" defaultValue={v.short_description} maxLength={300} placeholder="A short summary of this project" className={inputClass} />
          </Field>
          <Field id="description" label="Full description" error={e.description} hint="Use the toolbar for headings, lists and links — Preview shows how it will look.">
            <MarkdownEditor name="description" defaultValue={v.description} rows={12} placeholder="Describe the project, its goals, features and outcomes…" />
          </Field>
          <fieldset lang="bn" className="flex flex-col gap-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4">
            <legend className="px-2 text-sm font-semibold text-emerald-900">Bangla version (বাংলা)</legend>
            <p className="text-xs text-neutral-500">Shown on /bn pages. Empty fields fall back to the English text.</p>
            <Field id="title_bn" label="Title (Bangla)" error={e.title_bn}>
              <input id="title_bn" name="title_bn" defaultValue={v.title_bn} maxLength={200} placeholder="যেমন: নির্দেশনা ওয়েবসাইট" className={inputClass} />
            </Field>
            <Field id="short_description_bn" label="Short description (Bangla)" error={e.short_description_bn}>
              <input id="short_description_bn" name="short_description_bn" defaultValue={v.short_description_bn} maxLength={300} className={inputClass} />
            </Field>
            <Field id="description_bn" label="Full description (Bangla)" error={e.description_bn}>
              <MarkdownEditor name="description_bn" defaultValue={v.description_bn} rows={10} placeholder="প্রজেক্টের লক্ষ্য, ফিচার ও ফলাফল লিখুন…" />
            </Field>
          </fieldset>
        </div>
      </Section>

      <Section
        title="Features (A–Z)"
        description="Everything the project does, grouped. Shown as its own section on the case-study page."
      >
        <div className="flex flex-col gap-5">
          <p className="rounded-xl bg-neutral-50 px-3 py-2 font-mono text-xs leading-5 text-neutral-600">
            ## Group name
            <br />- **Feature name** — what it does and why it matters.
          </p>
          <Field id="features" label="Features (English)" error={e.features}>
            <MarkdownEditor name="features" defaultValue={v.features} rows={14} placeholder={"## Reading\n- **Quran** — Arabic text with Bangla translation…"} />
          </Field>
          <Field id="features_bn" label="Features (Bangla)" error={e.features_bn}>
            <MarkdownEditor name="features_bn" defaultValue={v.features_bn} rows={14} placeholder={"## পড়া\n- **কুরআন** — আরবি পাঠ ও বাংলা অনুবাদ…"} />
          </Field>
        </div>
      </Section>

      <Section title="Client Assignment" description="Assign this project to a client, or leave it unassigned for personal or internal work.">
        <Field id="client_id" label="Client" error={e.client_id} hint={clients.length ? `${clients.length} client${clients.length === 1 ? "" : "s"} available.` : "No clients have been created yet."}>
          <SelectWrap>
            <select id="client_id" name="client_id" defaultValue={v.client_id ?? ""} className={`${inputClass} appearance-none pr-10`}>
              <option value="">No client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </SelectWrap>
        </Field>
      </Section>

      <Section title="Cover Image" description="The main image shown on project cards and at the top of the project page.">
        <ImageUploadField
          name="cover_image_url"
          label="Cover image"
          initial={v.cover_image_url}
          variant="cover"
          error={e.cover_image_url}
          hint="A 16:10 desktop screenshot (about 1600×1000) looks best. Images are compressed automatically and uploaded only when you save."
        />
      </Section>

      <Section title="Classification" description="Categorize the project so it can be filtered and displayed consistently.">
        <Field id="category" label="Project category" error={e.category}>
          <SelectWrap>
            <select
              id="category"
              name="category"
              defaultValue={v.category ?? ""}
              onChange={(ev) => {
                if (!repoTouched) setNoRepo(ev.target.value === "WordPress");
              }}
              className={`${inputClass} appearance-none pr-10`}
            >
              <option value="">Select a category</option>
              {PROJECT_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </SelectWrap>
        </Field>
      </Section>

      <Section title="Built with" description="Pick every technology used. They appear on the project page and power the technology filter.">
        <TechPicker initial={v.technologies ?? []} known={knownTechnologies} />
      </Section>

      <Section title="Project Status" description="Track the current state and completion of the project.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="status" label="Status" error={e.status}>
            <SelectWrap>
              <select
                id="status"
                name="status"
                value={status}
                onChange={(ev) => {
                  setStatus(ev.target.value);
                  if (ev.target.value === "COMPLETED") setProgress(100);
                }}
                className={`${inputClass} appearance-none pr-10`}
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </SelectWrap>
          </Field>
          <Field id="progress_percent" label={`Progress — ${progress}%`} error={e.progress_percent}>
            <div className="mt-2 flex h-[46px] items-center gap-3">
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={progress}
                onChange={(ev) => setProgress(Number(ev.target.value))}
                aria-label="Progress"
                className="min-w-0 flex-1 accent-neutral-950"
              />
              <input
                id="progress_percent"
                name="progress_percent"
                type="number"
                min={0}
                max={100}
                value={progress}
                onChange={(ev) => setProgress(Math.max(0, Math.min(100, Number(ev.target.value) || 0)))}
                className="h-10 w-20 rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-neutral-400"
              />
            </div>
          </Field>
        </div>
        <label htmlFor="featured" className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
          <input id="featured" name="featured" type="checkbox" defaultChecked={v.featured} className="mt-0.5 h-4 w-4 rounded border-neutral-300 accent-neutral-950" />
          <span>
            <span className="block text-sm font-medium text-neutral-900">Feature this project</span>
            <span className="mt-1 block text-xs leading-5 text-neutral-500">Featured projects appear first on the portfolio and on the homepage.</span>
          </span>
        </label>
      </Section>

      <Section title="Project Timeline" description="When the project started and when it was completed.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="started_at" label="Started date" error={e.started_at}>
            <input id="started_at" name="started_at" type="date" defaultValue={v.started_at} className={inputClass} />
          </Field>
          <Field id="completed_at" label="Completed date" error={e.completed_at} hint={status !== "COMPLETED" ? "Usually set when the status is Completed." : undefined}>
            <input id="completed_at" name="completed_at" type="date" defaultValue={v.completed_at} className={inputClass} />
          </Field>
        </div>
      </Section>

      <Section title="Project Links" description="Links to the live project and, if there is one, the source repository.">
        <div className="space-y-5">
          <Field id="live_url" label="Live project URL" error={e.live_url}>
            <input id="live_url" name="live_url" type="url" defaultValue={v.live_url} placeholder="https://example.com" className={inputClass} />
          </Field>
          <div>
            <Field id="repository_url" label="Repository URL" error={noRepo ? undefined : e.repository_url}>
              <input
                id="repository_url"
                name="repository_url"
                type="url"
                defaultValue={v.repository_url}
                disabled={noRepo}
                placeholder={noRepo ? "Not applicable" : "https://github.com/username/project"}
                className={inputClass}
              />
            </Field>
            <label className="mt-3 flex cursor-pointer items-center gap-2.5 text-sm text-neutral-700">
              <input
                type="checkbox"
                name="no_repository"
                checked={noRepo}
                onChange={(ev) => {
                  setRepoTouched(true);
                  setNoRepo(ev.target.checked);
                }}
                className="h-4 w-4 rounded border-neutral-300 accent-neutral-950"
              />
              No code repository for this project
              <span className="text-xs text-neutral-400">(e.g. WordPress, Webflow)</span>
            </label>
          </div>
        </div>
      </Section>

      <div className="sticky bottom-0 z-10 -mx-1 flex flex-col-reverse gap-3 border-t border-neutral-200 bg-white/90 px-1 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-end">
        <Link
          href="/admin/projects"
          className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-200 bg-white px-5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 hover:text-neutral-950"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={pending}
          aria-busy={pending}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-neutral-950 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800 disabled:opacity-70"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {pending ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-base font-semibold text-neutral-950">{title}</h2>
        <p className="mt-1 text-sm text-neutral-500">{description}</p>
      </div>
      {children}
    </section>
  );
}

function Field({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-neutral-900">
        {label}
      </label>
      {children}
      {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : hint ? <p className="mt-2 text-xs text-neutral-400">{hint}</p> : null}
    </div>
  );
}

function SelectWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 mt-1 h-4 w-4 -translate-y-1/2 text-neutral-400" />
    </div>
  );
}

/* ============================================================
   BUILT WITH — searchable multi-select
============================================================ */

function TechPicker({ initial, known }: { initial: string[]; known: string[] }) {
  const [selected, setSelected] = useState<string[]>(initial);
  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    const listed = new Set(techCategories.flatMap((c) => c.items).map((t) => t.toLowerCase()));
    const extra = [...new Set([...known, ...initial])].filter((t) => !listed.has(t.toLowerCase())).sort();
    return extra.length ? [...techCategories, { name: "Other", items: extra }] : techCategories;
  }, [known, initial]);

  const q = query.trim().toLowerCase();
  const all = groups.flatMap((g) => g.items);
  const exists = all.some((t) => t.toLowerCase() === q) || selected.some((t) => t.toLowerCase() === q);
  const toggle = (t: string) => setSelected((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  return (
    <div>
      {selected.map((t) => (
        <input key={t} type="hidden" name="technologies" value={t} />
      ))}

      <div className="flex min-h-12 flex-wrap items-center gap-1.5 rounded-xl border border-neutral-200 bg-neutral-50 p-2">
        {selected.length === 0 ? (
          <span className="px-2 text-sm text-neutral-400">Nothing selected yet</span>
        ) : (
          selected.map((t) => (
            <span key={t} className="inline-flex items-center gap-1 rounded-lg bg-neutral-950 py-1 pl-2.5 pr-1 text-xs font-medium text-white">
              {t}
              <button type="button" onClick={() => toggle(t)} aria-label={`Remove ${t}`} className="rounded p-0.5 hover:bg-white/20">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))
        )}
        {selected.length > 0 && (
          <button type="button" onClick={() => setSelected([])} className="ml-auto px-2 text-xs font-medium text-neutral-500 hover:text-neutral-950">
            Clear
          </button>
        )}
      </div>

      <div className="relative mt-3">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          type="search"
          value={query}
          onChange={(ev) => setQuery(ev.target.value)}
          onKeyDown={(ev) => {
            if (ev.key === "Enter") {
              ev.preventDefault();
              const match = all.find((t) => t.toLowerCase() === q) ?? all.find((t) => t.toLowerCase().includes(q));
              if (match && q) toggle(match);
              else if (q && !exists) toggle(query.trim());
              setQuery("");
            }
          }}
          placeholder="Search or add a technology…"
          aria-label="Search technologies"
          className="h-10 w-full rounded-xl border border-neutral-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100"
        />
      </div>

      <div className="mt-4 flex flex-col gap-4">
        {groups.map((group) => {
          const items = group.items.filter((t) => !q || t.toLowerCase().includes(q));
          if (items.length === 0) return null;
          return (
            <div key={group.name}>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">{group.name}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {items.map((t) => {
                  const on = selected.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggle(t)}
                      aria-pressed={on}
                      className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                        on ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"
                      }`}
                    >
                      {on && <Check className="h-3 w-3" />}
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
        {q && !exists && (
          <button
            type="button"
            onClick={() => {
              toggle(query.trim());
              setQuery("");
            }}
            className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-dashed border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:border-neutral-950"
          >
            <Plus className="h-3.5 w-3.5" /> Add “{query.trim()}”
          </button>
        )}
      </div>
    </div>
  );
}
