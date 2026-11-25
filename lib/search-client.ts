"use client";

import type { IndexItem } from "@/app/api/search-index/route";
import { getContent } from "@/lib/content";
import type { Locale } from "@/lib/i18n/config";

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

function pages(L: (en: string, bn: string) => string): Hit[] {
  return [
    { type: "page", title: L("Our Work", "আমাদের কাজ"), description: L("Projects and case studies", "প্রজেক্ট ও কেস স্টাডি"), href: "/projects" },
    { type: "page", title: L("Pricing", "প্রাইসিং"), description: L("Website packages and care plans", "ওয়েবসাইট প্যাকেজ ও কেয়ার প্ল্যান"), href: "/pricing" },
    { type: "page", title: L("Blog", "ব্লগ"), description: L("Articles and guides", "লেখা ও গাইড"), href: "/blog" },
    { type: "page", title: L("About", "আমাদের সম্পর্কে"), description: L("Who we are and how we work", "আমরা কারা ও কীভাবে কাজ করি"), href: "/about" },
    { type: "page", title: L("Clients", "ক্লায়েন্ট"), description: L("People and organisations we work with", "যাদের সাথে আমরা কাজ করি"), href: "/clients" },
    { type: "page", title: L("FAQ", "প্রশ্নোত্তর"), description: L("Frequently asked questions", "সাধারণ জিজ্ঞাসা"), href: "/faq" },
    { type: "page", title: L("Contact", "যোগাযোগ"), description: L("Start a project or get in touch", "প্রজেক্ট শুরু করুন বা যোগাযোগ করুন"), href: "/contact" },
    { type: "page", title: L("Client portal", "ক্লায়েন্ট পোর্টাল"), description: L("Projects, tickets and support", "প্রজেক্ট, টিকিট ও সাপোর্ট"), href: "/client" },
    { type: "page", title: L("My account", "আমার অ্যাকাউন্ট"), description: L("Profile, settings and notifications", "প্রোফাইল, সেটিংস ও নোটিফিকেশন"), href: "/account" },
    { type: "page", title: L("Privacy Policy", "গোপনীয়তা নীতি"), description: L("How we handle your data", "আমরা কীভাবে আপনার তথ্য রাখি"), href: "/privacy" },
    { type: "page", title: L("Terms of Service", "সেবার শর্তাবলি"), description: L("Terms for using our site", "সাইট ব্যবহারের শর্ত"), href: "/terms" },
  ];
}

const staticCache = new Map<Locale, Hit[]>();
function staticHits(locale: Locale): Hit[] {
  const cached = staticCache.get(locale);
  if (cached) return cached;
  const L = (en: string, bn: string) => (locale === "bn" ? bn : en);
  const { services, faqGroups } = getContent(locale);
  const enContent = getContent("en");
  const hits: Hit[] = [
    ...services.map<Hit>((s, i) => ({
      type: "service",
      title: s.title,
      description: s.short,
      href: `/services/${s.slug}`,
      meta: L(`From ${s.startingFrom}`, `শুরু ${s.startingFrom} থেকে`),
      // Both languages are searchable whichever one is shown.
      keywords: `${s.intro} ${s.stack.join(" ")} ${s.idealFor.join(" ")} ${s.deliverables.join(" ")} ${enContent.services[i].title} ${enContent.services[i].short}`,
    })),
    ...pages(L),
    ...faqGroups.flatMap((g) => g.items).map<Hit>((f) => ({ type: "faq", title: f.q, description: f.a, href: "/faq", keywords: f.a })),
  ];
  staticCache.set(locale, hits);
  return hits;
}

/* ---------------- index loading (once per tab, cached) ---------------- */

const STORAGE_KEY = "nw-search-index-v2";
const MAX_AGE = 5 * 60 * 1000;
const memory = new Map<Locale, Hit[]>();
const inflight = new Map<Locale, Promise<Hit[]>>();

export function getCachedIndex(locale: Locale) {
  const hit = memory.get(locale);
  if (hit) return hit;
  try {
    const raw = sessionStorage.getItem(`${STORAGE_KEY}-${locale}`);
    if (raw) {
      const parsed = JSON.parse(raw) as { at: number; items: Hit[] };
      memory.set(locale, parsed.items);
      // Serve stale instantly, refresh in the background if old.
      if (Date.now() - parsed.at > MAX_AGE) void loadIndex(locale, true);
      return parsed.items;
    }
  } catch {}
  return null;
}

export function loadIndex(locale: Locale, force = false): Promise<Hit[]> {
  const cached = memory.get(locale);
  if (!force && cached) return Promise.resolve(cached);
  const running = inflight.get(locale);
  if (running) return running;
  const request = fetch(`/api/search-index?lang=${locale}`)
    .then((r) => r.json() as Promise<{ items: IndexItem[] }>)
    .then(({ items }) => {
      memory.set(locale, items as Hit[]);
      try {
        sessionStorage.setItem(`${STORAGE_KEY}-${locale}`, JSON.stringify({ at: Date.now(), items }));
      } catch {}
      return items as Hit[];
    })
    .catch(() => memory.get(locale) ?? [])
    .finally(() => {
      inflight.delete(locale);
    });
  inflight.set(locale, request);
  return request;
}

// Warm the index when the browser is idle, so the first search is instant.
export function prefetchIndexWhenIdle(locale: Locale) {
  if (typeof window === "undefined" || getCachedIndex(locale)) return;
  const run = () => void loadIndex(locale);
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

const GROUPS: { type: Hit["type"]; label: [string, string]; limit: number }[] = [
  { type: "post", label: ["Articles", "লেখা"], limit: 6 },
  { type: "project", label: ["Projects", "প্রজেক্ট"], limit: 5 },
  { type: "service", label: ["Services", "সার্ভিস"], limit: 4 },
  { type: "page", label: ["Pages", "পেজ"], limit: 4 },
  { type: "faq", label: ["FAQ", "প্রশ্নোত্তর"], limit: 3 },
];

export function searchAll(query: string, dynamic: Hit[], locale: Locale): Grouped {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];
  const scored = [...dynamic, ...staticHits(locale)]
    .map((hit) => ({ hit, s: score(hit, terms) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s);
  return GROUPS.map((g) => ({ label: locale === "bn" ? g.label[1] : g.label[0], items: scored.filter((x) => x.hit.type === g.type).slice(0, g.limit).map((x) => x.hit) })).filter(
    (g) => g.items.length > 0,
  );
}

export function latestPosts(dynamic: Hit[], n = 4) {
  return dynamic.filter((h) => h.type === "post").slice(0, n);
}
