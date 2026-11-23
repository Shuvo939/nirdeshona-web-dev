"use client";

import type { IndexItem } from "@/app/api/search-index/route";
import { faqGroups, services } from "@/lib/site";

export type Hit = {
  type: "service" | "page" | "project" | "post" | "faq";
  title: string;
  description: string | null;
  href: string;
  meta?: string | null;
  image?: string | null;
  keywords?: string;
  date?: string | null;
};

const PAGES: Hit[] = [
  { type: "page", title: "Our Work", description: "Projects and case studies", href: "/projects" },
  { type: "page", title: "Pricing", description: "Website packages and care plans", href: "/pricing" },
  { type: "page", title: "Blog", description: "Articles and guides", href: "/blog" },
  { type: "page", title: "About", description: "Who we are and how we work", href: "/about" },
  { type: "page", title: "Clients", description: "People and organisations we work with", href: "/clients" },
  { type: "page", title: "FAQ", description: "Frequently asked questions", href: "/faq" },
  { type: "page", title: "Contact", description: "Start a project or get in touch", href: "/contact" },
  { type: "page", title: "Client portal", description: "Projects, tickets and support", href: "/client" },
  { type: "page", title: "My account", description: "Profile, settings and notifications", href: "/account" },
  { type: "page", title: "Privacy Policy", description: "How we handle your data", href: "/privacy" },
  { type: "page", title: "Terms of Service", description: "Terms for using our site", href: "/terms" },
];

const STATIC: Hit[] = [
  ...services.map<Hit>((s) => ({
    type: "service",
    title: s.title,
    description: s.short,
    href: `/services/${s.slug}`,
    meta: `From ${s.startingFrom}`,
    keywords: `${s.intro} ${s.stack.join(" ")} ${s.idealFor.join(" ")} ${s.deliverables.join(" ")}`,
  })),
  ...PAGES,
  ...faqGroups.flatMap((g) => g.items).map<Hit>((f) => ({ type: "faq", title: f.q, description: f.a, href: "/faq", keywords: f.a })),
];

/* ---------------- index loading (once per tab, cached) ---------------- */

const STORAGE_KEY = "nw-search-index-v1";
const MAX_AGE = 5 * 60 * 1000;
let memory: Hit[] | null = null;
let inflight: Promise<Hit[]> | null = null;

export function getCachedIndex() {
  if (memory) return memory;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { at: number; items: Hit[] };
      memory = parsed.items;
      // Serve stale instantly, refresh in the background if old.
      if (Date.now() - parsed.at > MAX_AGE) void loadIndex(true);
      return memory;
    }
  } catch {}
  return null;
}

export function loadIndex(force = false): Promise<Hit[]> {
  if (!force && memory) return Promise.resolve(memory);
  if (inflight) return inflight;
  inflight = fetch("/api/search-index")
    .then((r) => r.json() as Promise<{ items: IndexItem[] }>)
    .then(({ items }) => {
      memory = items as Hit[];
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ at: Date.now(), items: memory }));
      } catch {}
      return memory;
    })
    .catch(() => memory ?? [])
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

// Warm the index when the browser is idle, so the first search is instant.
export function prefetchIndexWhenIdle() {
  if (typeof window === "undefined" || getCachedIndex()) return;
  const run = () => void loadIndex();
  if ("requestIdleCallback" in window) window.requestIdleCallback(run, { timeout: 4000 });
  else setTimeout(run, 1500);
}

/* ---------------- matching ---------------- */

function normalize(text: string) {
  return text.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");
}

function score(hit: Hit, terms: string[]) {
  const title = normalize(hit.title);
  const desc = normalize(hit.description ?? "");
  const meta = normalize(hit.meta ?? "");
  const keys = normalize(hit.keywords ?? "");
  let total = 0;
  for (const term of terms) {
    let s = 0;
    if (title.startsWith(term)) s = 12;
    else if (new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(title)) s = 9;
    else if (title.includes(term)) s = 6;
    else if (meta.includes(term)) s = 4;
    else if (desc.includes(term)) s = 3;
    else if (keys.includes(term)) s = 1;
    if (s === 0) return 0; // every term must match somewhere
    total += s;
  }
  return total;
}

export type Grouped = { label: string; items: Hit[] }[];

const GROUPS: { type: Hit["type"]; label: string; limit: number }[] = [
  { type: "post", label: "Articles", limit: 6 },
  { type: "project", label: "Projects", limit: 5 },
  { type: "service", label: "Services", limit: 4 },
  { type: "page", label: "Pages", limit: 4 },
  { type: "faq", label: "FAQ", limit: 3 },
];

export function searchAll(query: string, dynamic: Hit[]): Grouped {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];
  const scored = [...dynamic, ...STATIC]
    .map((hit) => ({ hit, s: score(hit, terms) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s);
  return GROUPS.map((g) => ({ label: g.label, items: scored.filter((x) => x.hit.type === g.type).slice(0, g.limit).map((x) => x.hit) })).filter(
    (g) => g.items.length > 0,
  );
}

export function latestPosts(dynamic: Hit[], n = 4) {
  return dynamic.filter((h) => h.type === "post").slice(0, n);
}
