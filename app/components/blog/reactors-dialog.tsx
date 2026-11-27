"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, X } from "lucide-react";

import type { ReactionType } from "@/lib/comments";
import { useI18n } from "@/lib/i18n/client";

import { getReactors, type Reactor } from "./community-actions";
import { REACTION_META, REACTION_ORDER, reactionLabel } from "./reaction-meta";

/** Facebook-style "who reacted" list, opened from a reaction summary. */
export default function ReactorsDialog({
  target,
  id,
  onClose,
}: {
  target: "post" | "comment";
  id: string;
  onClose: () => void;
}) {
  const { L, locale, num } = useI18n();
  const [reactors, setReactors] = useState<Reactor[] | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<ReactionType | "all">("all");

  const loadError = L("Couldn't load reactions. Try again.", "রিঅ্যাকশন লোড করা যায়নি। আবার চেষ্টা করুন।");
  useEffect(() => {
    let alive = true;
    getReactors(target, id)
      .then((res) => {
        if (!alive) return;
        if (res.ok) setReactors(res.reactors);
        else setError(res.error);
      })
      .catch(() => alive && setError(loadError));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  const counts: Partial<Record<ReactionType, number>> = {};
  for (const r of reactors ?? []) counts[r.reaction_type] = (counts[r.reaction_type] ?? 0) + 1;
  const tabs = REACTION_ORDER.filter((r) => (counts[r] ?? 0) > 0).sort((a, b) => (counts[b] ?? 0) - (counts[a] ?? 0));
  const shown = (reactors ?? []).filter((r) => tab === "all" || r.reaction_type === tab);

  return (
    <div
      className="fixed inset-0 z-[130] flex items-end justify-center bg-scrim/45 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={L("Reactions", "রিঅ্যাকশন")}
        className="flex max-h-[80vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-w-md sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-neutral-200 sm:hidden" aria-hidden />
        <div className="flex items-center gap-2 border-b border-neutral-100 px-3 pt-2 sm:pt-3">
          <div role="tablist" className="flex min-w-0 flex-1 gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <TabButton active={tab === "all"} onClick={() => setTab("all")}>
              {L("All", "সব")} {reactors ? num(reactors.length) : ""}
            </TabButton>
            {tabs.map((r) => (
              <TabButton key={r} active={tab === r} onClick={() => setTab(r)} label={reactionLabel(r, locale)}>
                <span className="text-base leading-none">{REACTION_META[r].emoji}</span> {num(counts[r] ?? 0)}
              </TabButton>
            ))}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={L("Close", "বন্ধ করুন")}
            className="mb-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <ul className="min-h-[200px] flex-1 overflow-y-auto px-2 py-2">
          {error ? (
            <li className="px-3 py-8 text-center text-sm text-neutral-500">{error}</li>
          ) : !reactors ? (
            Array.from({ length: 4 }, (_, i) => (
              <li key={i} className="flex items-center gap-3 px-3 py-2.5">
                <span className="h-10 w-10 animate-pulse rounded-full bg-neutral-100" />
                <span className="h-3.5 w-40 animate-pulse rounded-full bg-neutral-100" />
              </li>
            ))
          ) : shown.length === 0 ? (
            <li className="px-3 py-8 text-center text-sm text-neutral-500">{L("No reactions yet.", "এখনো কোনো রিঅ্যাকশন নেই।")}</li>
          ) : (
            shown.map((r) => (
              <li key={r.user_id} className="flex items-center gap-3 rounded-2xl px-3 py-2 hover:bg-neutral-50">
                <span className="relative shrink-0">
                  <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-neutral-950 text-xs font-bold text-white">
                    {r.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.avatar_url} alt="" loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      initials(r.name)
                    )}
                  </span>
                  <span
                    className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.25)]"
                    title={reactionLabel(r.reaction_type, locale)}
                  >
                    {REACTION_META[r.reaction_type]?.emoji}
                  </span>
                </span>
                <span className="flex min-w-0 items-center gap-1.5 text-sm font-medium text-neutral-900">
                  <span className="truncate">{r.name}</span>
                  {r.is_staff && <BadgeCheck className="h-4 w-4 shrink-0 text-sky-600" aria-label={L("Nirdeshona team", "নির্দেশনা টিম")} />}
                </span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      aria-label={label}
      onClick={onClick}
      className={`-mb-px inline-flex h-11 shrink-0 items-center gap-1.5 border-b-2 px-3 text-sm font-semibold transition ${
        active ? "border-neutral-950 text-neutral-950" : "border-transparent text-neutral-500 hover:text-neutral-800"
      }`}
    >
      {children}
    </button>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
