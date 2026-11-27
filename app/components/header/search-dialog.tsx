"use client";

import { useI18n } from "@/lib/i18n/client";

import { startNavigationProgress } from "@/app/components/navigation-progress";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getCachedIndex, latestPosts, loadIndex, searchAll, type Hit } from "@/lib/search-client";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Clock,
  CornerDownLeft,
  FileText,
  HelpCircle,
  Layers3,
  Loader2,
  Search,
  X,
} from "lucide-react";

function quickLinks(L: (en: string, bn: string) => string): Hit[] {
  return [
    { type: "service", title: L("Web Development", "ওয়েব ডেভেলপমেন্ট"), description: L("Websites and web apps", "ওয়েবসাইট ও ওয়েব অ্যাপ"), href: "/services/web-development" },
    { type: "service", title: L("WordPress Solutions", "ওয়ার্ডপ্রেস সমাধান"), description: L("Custom WordPress sites", "কাস্টম ওয়ার্ডপ্রেস সাইট"), href: "/services/wordpress" },
    { type: "page", title: L("Our Work", "আমাদের কাজ"), description: L("Projects and case studies", "প্রজেক্ট ও কেস স্টাডি"), href: "/projects" },
    { type: "page", title: L("Pricing", "প্রাইসিং"), description: L("Packages and care plans", "প্যাকেজ ও কেয়ার প্ল্যান"), href: "/pricing" },
    { type: "page", title: L("Contact", "যোগাযোগ"), description: L("Start a project", "প্রজেক্ট শুরু করুন"), href: "/contact" },
  ];
}

const ICONS = { service: Layers3, page: FileText, project: BriefcaseBusiness, post: BookOpen, faq: HelpCircle };
const RECENT_KEY = "nw-recent-searches";

function readRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]").slice(0, 5);
  } catch {
    return [];
  }
}

function saveRecent(q: string) {
  try {
    const next = [q, ...readRecent().filter((r) => r.toLowerCase() !== q.toLowerCase())].slice(0, 5);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {}
}

function Highlight({ text, q }: { text: string; q: string }) {
  const terms = q.trim().split(/\s+/).filter(Boolean).map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (terms.length === 0) return <>{text}</>;
  const parts = text.split(new RegExp(`(${terms.join("|")})`, "ig"));
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="rounded bg-amber-100 px-0.5 text-neutral-950">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

export default function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { L, locale, lp } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<Hit[] | null>(null);
  const [active, setActive] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);

  // Load the search index once (usually already prefetched while idle).
  useEffect(() => {
    if (!open) return;
    const cached = getCachedIndex(locale);
    if (cached) setIndex(cached);
    let alive = true;
    void loadIndex(locale).then((items) => alive && setIndex(items));
    return () => {
      alive = false;
    };
  }, [open, locale]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setActive(0);
      return;
    }
    setRecent(readRecent());
    const t = window.setTimeout(() => inputRef.current?.focus(), 30);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = previous;
    };
  }, [open]);

  const q = query.trim();
  const loading = Boolean(q) && index === null;

  const sections = useMemo(() => {
    if (!q) {
      const latest = index ? latestPosts(index) : [];
      return [{ label: L("Quick links", "দ্রুত লিংক"), items: quickLinks(L) }, ...(latest.length ? [{ label: L("Latest articles", "সাম্প্রতিক লেখা"), items: latest }] : [])];
    }
    return searchAll(q, index ?? [], locale);
  }, [index, q, L, locale]);

  const flat = useMemo(() => sections.flatMap((s) => s.items), [sections]);
  useEffect(() => setActive(0), [q]);

  const go = useCallback(
    (href: string) => {
      if (q) saveRecent(q);
      onClose();
      startNavigationProgress();
      router.push(lp(href));
    },
    [q, onClose, router, lp],
  );

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") onClose();
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, flat.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (flat[active]) go(flat[active].href);
      else if (q) go(`/search?q=${encodeURIComponent(q)}`);
    }
  }

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open) return null;

  let cursor = -1;
  const showEmpty = q && !loading && flat.length === 0;

  return (
    <div className="fixed inset-0 z-[9999] h-[100dvh] w-screen" onKeyDown={onKeyDown}>
      <button type="button" aria-label={L("Close search", "সার্চ বন্ধ করুন")} onClick={onClose} className="absolute inset-0 h-full w-full cursor-default bg-scrim/50 backdrop-blur-md" />
      <div className="pointer-events-none relative flex h-full w-full justify-center px-3 pb-6 pt-[6vh] sm:px-4 sm:pt-[10vh]">
        <div
          role="dialog"
          aria-modal="true"
          aria-label={L("Search Nirdeshona", "নির্দেশনায় খুঁজুন")}
          className="pointer-events-auto flex h-fit max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl shadow-black/25"
        >
          <div className="flex items-center gap-3 border-b border-neutral-100 px-4 sm:px-5">
            {loading ? <Loader2 className="h-5 w-5 shrink-0 animate-spin text-neutral-400" /> : <Search className="h-5 w-5 shrink-0 text-neutral-400" />}
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={L("Search articles, projects, services…", "লেখা, প্রজেক্ট, সার্ভিস খুঁজুন…")}
              aria-label={L("Search", "খুঁজুন")}
              className="h-16 min-w-0 flex-1 bg-transparent text-base text-neutral-950 outline-none placeholder:text-neutral-400"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700" aria-label={L("Clear", "মুছুন")}>
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="hidden rounded-md border border-neutral-200 px-1.5 py-0.5 text-[10px] font-medium text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 sm:block"
            >
              ESC
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label={L("Close search", "সার্চ বন্ধ করুন")}
              className="-mr-1 shrink-0 rounded-lg px-2 py-1.5 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950 sm:hidden"
            >
              {L("Cancel", "বাতিল")}
            </button>
          </div>

          <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto p-2">
            {!q && recent.length > 0 && (
              <div className="px-2 pb-2 pt-1">
                <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">{L("Recent searches", "সাম্প্রতিক সার্চ")}</p>
                <div className="flex flex-wrap gap-1.5 px-2">
                  {recent.map((r) => (
                    <button key={r} type="button" onClick={() => setQuery(r)} className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-600 hover:bg-neutral-50">
                      <Clock className="h-3 w-3" /> {r}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {sections.map((section) => (
              <div key={section.label} className="pb-1">
                <p className="px-4 pb-1.5 pt-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">{section.label}</p>
                {section.items.map((item) => {
                  cursor += 1;
                  const i = cursor;
                  const Icon = ICONS[item.type];
                  const selected = i === active;
                  return (
                    <button
                      key={`${item.type}-${item.href}-${item.title}`}
                      type="button"
                      data-index={i}
                      onMouseMove={() => setActive(i)}
                      onClick={() => go(item.href)}
                      className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition ${selected ? "bg-neutral-100" : ""}`}
                    >
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image} alt="" className="h-10 w-10 shrink-0 rounded-xl object-cover" />
                      ) : (
                        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${selected ? "bg-neutral-950 text-white" : "bg-neutral-100 text-neutral-600"}`}>
                          <Icon className="h-4 w-4" />
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-neutral-950">
                          <Highlight text={item.title} q={q} />
                        </span>
                        {item.description && (
                          <span className="block truncate text-xs text-neutral-500">
                            <Highlight text={item.description} q={q} />
                          </span>
                        )}
                      </span>
                      {item.meta && <span className="hidden shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-500 sm:block">{item.meta}</span>}
                      {selected && <CornerDownLeft className="hidden h-4 w-4 shrink-0 text-neutral-400 sm:block" />}
                    </button>
                  );
                })}
              </div>
            ))}

            {showEmpty && (
              <div className="px-6 py-12 text-center">
                <Search className="mx-auto h-6 w-6 text-neutral-300" />
                <p className="mt-3 text-sm font-medium text-neutral-900">{L("No results for", "কোনো ফল পাওয়া যায়নি:")} “{q}”</p>
                <p className="mt-1 text-xs text-neutral-500">{L("Try a different word, or browse our articles and projects.", "অন্য শব্দে চেষ্টা করুন, অথবা আমাদের লেখা ও প্রজেক্টগুলো দেখুন।")}</p>
              </div>
            )}

            {q && !loading && (
              <button
                type="button"
                onClick={() => go(`/search?q=${encodeURIComponent(q)}`)}
                className="mt-1 flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                {L("See all results for", "সব ফলাফল দেখুন:")} “{q}” <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="hidden items-center gap-4 border-t border-neutral-100 bg-neutral-50 px-5 py-2.5 text-[11px] text-neutral-400 sm:flex">
            <span><kbd className="font-sans">↑↓</kbd> {L("navigate", "বাছাই")}</span>
            <span><kbd className="font-sans">↵</kbd> {L("open", "খুলুন")}</span>
            <span>
              <kbd className="font-sans">Ctrl K</kbd> {L("or", "বা")} <kbd className="font-sans">/</kbd> {L("to search anywhere", "যেকোনো জায়গা থেকে খুঁজতে")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
