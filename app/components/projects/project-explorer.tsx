"use client";

import Link from "@/app/components/locale-link";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, ExternalLink, LayoutGrid, Layers3, List, Search, SlidersHorizontal, Star, X } from "lucide-react";

import { PROJECT_STATUS, StatusBadge } from "@/app/components/marketing";
import ProjectCard from "@/app/components/project-card";
import { useI18n } from "@/lib/i18n/client";
import { categoryLabel } from "@/lib/projects/categories";

export type ExplorerProject = {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  category: string | null;
  status: string;
  progress_percent: number;
  cover_image_url: string | null;
  client_name: string | null;
  live_url: string | null;
  featured: boolean;
  year: number | null;
  sort_date: string;
  technologies: string[];
};

type StatusKey = "" | "COMPLETED" | "ACTIVE" | "PLANNED";
type SortKey = "featured" | "newest" | "oldest" | "az";
type View = "grid" | "list";

const STATUS_TABS: { key: StatusKey; label: [string, string]; match: (s: string) => boolean }[] = [
  { key: "", label: ["All", "সব"], match: () => true },
  { key: "COMPLETED", label: ["Completed", "সম্পন্ন"], match: (s) => s === "COMPLETED" },
  { key: "ACTIVE", label: ["In progress", "চলমান"], match: (s) => s === "IN_PROGRESS" || s === "REVIEW" },
  { key: "PLANNED", label: ["Upcoming", "আসন্ন"], match: (s) => s === "PLANNED" || s === "ON_HOLD" },
];

const SORTS: { key: SortKey; label: [string, string] }[] = [
  { key: "featured", label: ["Featured first", "ফিচার্ড আগে"] },
  { key: "newest", label: ["Newest", "নতুন আগে"] },
  { key: "oldest", label: ["Oldest", "পুরোনো আগে"] },
  { key: "az", label: ["A → Z", "নাম অনুযায়ী"] },
];

const norm = (v: string) => v.toLowerCase().normalize("NFKD");

export default function ProjectExplorer({
  projects,
  initial,
}: {
  projects: ExplorerProject[];
  initial: { q: string; category: string; status: string; tech: string; sort: string; view: string };
}) {
  const { L, locale, stat, lp, num, digits } = useI18n();
  const [q, setQ] = useState(initial.q);
  const [category, setCategory] = useState(initial.category);
  const [status, setStatus] = useState<StatusKey>(STATUS_TABS.some((t) => t.key === initial.status) ? (initial.status as StatusKey) : "");
  const [tech, setTech] = useState(initial.tech);
  const [sort, setSort] = useState<SortKey>(SORTS.some((s) => s.key === initial.sort) ? (initial.sort as SortKey) : "featured");
  const [view, setView] = useState<View>(initial.view === "list" ? "list" : "grid");
  const [showTech, setShowTech] = useState(Boolean(initial.tech));
  const searchRef = useRef<HTMLInputElement>(null);
  const deferredQ = useDeferredValue(q);

  // Keep the URL shareable without a server round-trip.
  useEffect(() => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (category) params.set("category", category);
    if (status) params.set("status", status);
    if (tech) params.set("tech", tech);
    if (sort !== "featured") params.set("sort", sort);
    if (view !== "grid") params.set("view", view);
    const next = params.toString() ? `${lp("/projects")}?${params}` : lp("/projects");
    if (next !== window.location.pathname + window.location.search) window.history.replaceState(null, "", next);
  }, [q, category, status, tech, sort, view, lp]);

  // "/" focuses search, like the site-wide search.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes(target.tagName) && !target.isContentEditable) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const indexed = useMemo(
    () =>
      projects.map((p) => ({
        p,
        haystack: norm([p.title, p.short_description, p.category, categoryLabel(p.category, "bn"), p.client_name, ...p.technologies].filter(Boolean).join(" ")),
      })),
    [projects],
  );

  const statusMatch = STATUS_TABS.find((t) => t.key === status)!.match;
  const terms = norm(deferredQ.trim()).split(/\s+/).filter(Boolean);

  // Everything except one facet — used for live counts on that facet.
  const base = (skip: "category" | "status" | "tech") =>
    indexed.filter(
      ({ p, haystack }) =>
        terms.every((t) => haystack.includes(t)) &&
        (skip === "category" || !category || p.category === category) &&
        (skip === "status" || statusMatch(p.status)) &&
        (skip === "tech" || !tech || p.technologies.includes(tech)),
    );

  const results = useMemo(() => {
    const list = base("tech")
      .filter(({ p }) => !tech || p.technologies.includes(tech))
      .map(({ p }) => p);
    const byDate = (a: ExplorerProject, b: ExplorerProject) => b.sort_date.localeCompare(a.sort_date);
    switch (sort) {
      case "newest":
        return list.sort(byDate);
      case "oldest":
        return list.sort((a, b) => -byDate(a, b));
      case "az":
        return list.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return list.sort((a, b) => Number(b.featured) - Number(a.featured) || byDate(a, b));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indexed, deferredQ, category, status, tech, sort]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const { p } of base("category")) if (p.category) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
    return counts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indexed, deferredQ, status, tech]);

  const statusCounts = useMemo(() => {
    const rows = base("status");
    return Object.fromEntries(STATUS_TABS.map((t) => [t.key, rows.filter(({ p }) => t.match(p.status)).length]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indexed, deferredQ, category, tech]);

  const techCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const { p } of base("tech")) for (const t of p.technologies) counts.set(t, (counts.get(t) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indexed, deferredQ, category, status]);

  const allCategories = useMemo(() => [...new Set(projects.map((p) => p.category).filter(Boolean) as string[])].sort(), [projects]);
  const activeFilters = [q.trim(), category, status, tech].filter(Boolean).length;

  function clearAll() {
    setQ("");
    setCategory("");
    setStatus("");
    setTech("");
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Toolbar */}
      <div className="z-20 -mx-4 flex flex-col gap-3 border-b border-neutral-200/70 bg-white/90 px-4 py-3 backdrop-blur lg:sticky lg:top-[69px] sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              ref={searchRef}
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={L("Search by name, client or technology…", "নাম, ক্লায়েন্ট বা প্রযুক্তি দিয়ে খুঁজুন…")}
              aria-label={L("Search projects", "প্রজেক্ট খুঁজুন")}
              className="h-11 w-full rounded-full border border-neutral-200 bg-white pl-10 pr-12 text-sm outline-none transition focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10"
            />
            <kbd className="pointer-events-none absolute right-3.5 top-1/2 hidden -translate-y-1/2 rounded-md border border-neutral-200 px-1.5 text-[11px] text-neutral-400 sm:block">/</kbd>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex min-w-0 flex-1 overflow-x-auto rounded-full border border-neutral-200 bg-white p-1 [scrollbar-width:none] md:flex-none" role="tablist" aria-label={L("Status", "অবস্থা")}>
              {STATUS_TABS.map((t) => (
                <button
                  key={t.key || "all"}
                  type="button"
                  role="tab"
                  aria-selected={status === t.key}
                  onClick={() => setStatus(t.key)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    status === t.key ? "bg-neutral-950 text-white" : "text-neutral-600 hover:text-neutral-950"
                  }`}
                >
                  {L(t.label[0], t.label[1])} <span className="opacity-60">{stat(statusCounts[t.key])}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="-mx-1 flex min-w-0 flex-1 gap-2 overflow-x-auto px-1 [scrollbar-width:none]">
            <Pill active={!category} onClick={() => setCategory("")}>
              {L("All categories", "সব ক্যাটাগরি")}
            </Pill>
            {allCategories.map((c) => (
              <Pill key={c} active={category === c} onClick={() => setCategory(category === c ? "" : c)} disabled={!categoryCounts.get(c) && category !== c}>
                {categoryLabel(c, locale)} <span className="ml-1 text-[10px] opacity-60">{stat(categoryCounts.get(c) ?? 0)}</span>
              </Pill>
            ))}
          </div>
          {techCounts.length > 0 && (
            <button
              type="button"
              onClick={() => setShowTech((v) => !v)}
              aria-expanded={showTech}
              className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition ${
                showTech || tech ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" /> <span className="hidden sm:inline">{L("Tech", "প্রযুক্তি")}</span>
              {tech && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
            </button>
          )}
        </div>

        {showTech && techCounts.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {techCounts.map(([t, n]) => (
              <button
                key={t}
                type="button"
                onClick={() => setTech(tech === t ? "" : t)}
                className={`rounded-lg border px-2.5 py-1 text-xs transition ${
                  tech === t ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
                }`}
              >
                {t} <span className="opacity-60">{stat(n)}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Result bar */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-neutral-500" aria-live="polite">
          {L(
            <>
              <span className="font-semibold text-neutral-950">{results.length}</span> of {projects.length} projects
            </>,
            <>
              {num(projects.length)}টির মধ্যে <span className="font-semibold text-neutral-950">{num(results.length)}</span>টি প্রজেক্ট
            </>,
          )}
          {activeFilters > 0 && (
            <button type="button" onClick={clearAll} className="ml-3 inline-flex items-center gap-1 font-medium text-neutral-950 underline-offset-2 hover:underline">
              <X className="h-3.5 w-3.5" /> {L("Clear filters", "ফিল্টার মুছুন")}
            </button>
          )}
        </p>
        <div className="flex items-center gap-2">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            aria-label={L("Sort projects", "প্রজেক্ট সাজান")}
            className="h-9 rounded-full border border-neutral-200 bg-white px-3 text-xs font-medium text-neutral-700 outline-none focus:border-neutral-950"
          >
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>
                {L(s.label[0], s.label[1])}
              </option>
            ))}
          </select>
          <div className="flex rounded-full border border-neutral-200 bg-white p-1">
            {(
              [
                ["grid", LayoutGrid, L("Grid view", "গ্রিড ভিউ")],
                ["list", List, L("List view", "তালিকা ভিউ")],
              ] as const
            ).map(([key, Icon, label]) => (
              <button
                key={key}
                type="button"
                aria-label={label}
                aria-pressed={view === key}
                onClick={() => setView(key)}
                className={`flex h-7 w-7 items-center justify-center rounded-full transition ${view === key ? "bg-neutral-950 text-white" : "text-neutral-500 hover:text-neutral-950"}`}
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {results.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-neutral-300 bg-white px-6 py-20 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100">
            <Layers3 className="h-5 w-5 text-neutral-500" />
          </div>
          <h2 className="mt-5 text-lg font-semibold">{L("No projects match", "কোনো প্রজেক্ট মেলেনি")}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">{L("Try a different search or remove a filter.", "অন্যভাবে খুঁজুন বা কোনো ফিল্টার সরান।")}</p>
          <button type="button" onClick={clearAll} className="mt-6 inline-flex text-sm font-semibold underline">
            {L("Clear filters", "ফিল্টার মুছুন")}
          </button>
        </div>
      ) : view === "grid" ? (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {results.map((p) => (
            <li key={p.id}>
              <ListRow project={p} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Pill({ active, disabled, onClick, children }: { active: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`inline-flex h-9 shrink-0 items-center rounded-full border px-3.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
        active ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:text-neutral-950"
      }`}
    >
      {children}
    </button>
  );
}

function ListRow({ project: p }: { project: ExplorerProject }) {
  const { L, locale, stat, digits, num } = useI18n();
  return (
    <div className="group relative flex gap-4 rounded-3xl border border-neutral-200 bg-white p-3 transition hover:shadow-[0_12px_32px_rgb(var(--c-black)/0.06)] sm:p-4">
      <div className="relative aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-2xl bg-neutral-100 sm:w-44">
        {p.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.cover_image_url} alt="" loading="lazy" className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Layers3 className="h-7 w-7 text-neutral-300" />
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-1.5">
          <StatusBadge map={PROJECT_STATUS} value={p.status} />
          {p.featured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {L("Featured", "ফিচার্ড")}
            </span>
          )}
          {p.year && <span className="text-[11px] text-neutral-400">{digits(p.year)}</span>}
        </div>
        <Link href={`/projects/${p.slug}`} className="mt-1.5 font-semibold tracking-tight text-neutral-950 after:absolute after:inset-0 after:rounded-3xl">
          {p.title}
        </Link>
        <p className="text-xs text-neutral-400">{[p.client_name, categoryLabel(p.category, locale)].filter(Boolean).join(" · ")}</p>
        {p.short_description && <p className="mt-2 line-clamp-2 hidden text-sm leading-6 text-neutral-500 sm:block">{p.short_description}</p>}
        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-2">
          {p.technologies.slice(0, 5).map((t) => (
            <span key={t} className="rounded-md border border-neutral-200 px-2 py-0.5 text-[11px] text-neutral-500">
              {t}
            </span>
          ))}
          {p.status !== "COMPLETED" && (
            <span className="ml-auto flex items-center gap-2 text-[11px] text-neutral-500">
              <span className="h-1.5 w-14 overflow-hidden rounded-full bg-neutral-100">
                <span className="block h-full rounded-full bg-neutral-950" style={{ width: `${p.progress_percent}%` }} />
              </span>
              {stat(p.progress_percent)}%
            </span>
          )}
        </div>
      </div>
      <div className="relative z-10 hidden shrink-0 flex-col items-end justify-between sm:flex">
        <ArrowUpRight className="h-5 w-5 text-neutral-300 transition group-hover:text-neutral-950" />
        {p.live_url && (
          <a
            href={p.live_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
          >
            {L("Visit", "দেখুন")} <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}
