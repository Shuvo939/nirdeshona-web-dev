"use client";

import { useI18n } from "@/lib/i18n/client";

import { startNavigationProgress } from "@/app/components/navigation-progress";
import { useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Link2, ThumbsUp } from "lucide-react";

import type { ReactionType } from "@/lib/comments";

import { setPostReaction } from "./community-actions";
import { REACTION_META, REACTION_ORDER, reactionLabel } from "./reaction-meta";

export default function PostReactions({
  postId,
  initialCounts,
  initialMine,
  signedIn,
  commentCount,
}: {
  postId: string;
  initialCounts: Partial<Record<ReactionType, number>>;
  initialMine: ReactionType | null;
  signedIn: boolean;
  commentCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { L, locale, num } = useI18n();
  const [counts, setCounts] = useState(initialCounts);
  const [mine, setMine] = useState(initialMine);
  const [picker, setPicker] = useState(false);
  const [copied, setCopied] = useState(false);
  const [, start] = useTransition();
  const hoverTimer = useRef<number | null>(null);
  const pressTimer = useRef<number | null>(null);
  const longPressed = useRef(false);

  const total = Object.values(counts).reduce((a, b) => a + (b ?? 0), 0);
  const top = REACTION_ORDER.filter((r) => (counts[r] ?? 0) > 0)
    .sort((a, b) => (counts[b] ?? 0) - (counts[a] ?? 0))
    .slice(0, 3);

  // Optimistic: update the UI immediately, save in the background, roll back on error.
  function choose(next: ReactionType | null) {
    if (!signedIn) {
      startNavigationProgress();
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    setPicker(false);
    const prevMine = mine;
    const prevCounts = counts;
    const updated = { ...counts };
    if (prevMine) updated[prevMine] = Math.max(0, (updated[prevMine] ?? 1) - 1);
    if (next) updated[next] = (updated[next] ?? 0) + 1;
    setCounts(updated);
    setMine(next);
    start(async () => {
      const res = await setPostReaction(postId, next);
      if (!res.ok) {
        setCounts(prevCounts);
        setMine(prevMine);
      }
    });
  }

  function openSoon() {
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setPicker(true), 350);
  }
  function closeSoon() {
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setPicker(false), 300);
  }

  async function share() {
    const url = window.location.href.split("#")[0];
    try {
      if (navigator.share) await navigator.share({ url, title: document.title });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      }
    } catch {}
  }

  const meta = mine ? REACTION_META[mine] : null;

  return (
    <section className="mt-12 rounded-3xl border border-neutral-200 bg-white">
      <div className="flex items-center justify-between gap-3 px-5 py-3 text-sm text-neutral-500">
        <div className="flex min-w-0 items-center gap-2">
          {top.length > 0 ? (
            <>
              <span className="flex -space-x-1">
                {top.map((r) => (
                  <span key={r} title={`${reactionLabel(r, locale)}: ${num(counts[r] ?? 0)}`} className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm ring-2 ring-white">
                    {REACTION_META[r].emoji}
                  </span>
                ))}
              </span>
              <span className="truncate">
                {mine
                  ? total > 1
                    ? L(`You and ${total - 1} other${total - 1 === 1 ? "" : "s"}`, `আপনি ও আরও ${num(total - 1)} জন`)
                    : L("You", "আপনি")
                  : num(total)}
              </span>
            </>
          ) : (
            <span>{L("Be the first to react", "প্রথম রিঅ্যাকশন দিন")}</span>
          )}
        </div>
        <a href="#comments" className="shrink-0 hover:underline">
          {L(`${commentCount} comment${commentCount === 1 ? "" : "s"}`, `${num(commentCount)}টি মন্তব্য`)}
        </a>
      </div>

      <div className="grid grid-cols-3 border-t border-neutral-100 p-1.5">
        <div className="relative" onMouseEnter={openSoon} onMouseLeave={closeSoon}>
          {picker && (
            <div
              role="menu"
              aria-label={L("Choose a reaction", "রিঅ্যাকশন বাছুন")}
              className="absolute bottom-full left-0 z-20 mb-2 flex gap-1 rounded-full border border-neutral-200 bg-white p-1.5 shadow-xl"
              onMouseEnter={openSoon}
            >
              {REACTION_ORDER.map((r) => (
                <button
                  key={r}
                  type="button"
                  role="menuitem"
                  title={reactionLabel(r, locale)}
                  aria-label={reactionLabel(r, locale)}
                  onClick={() => choose(r)}
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-2xl transition duration-150 hover:-translate-y-1 hover:scale-125 ${mine === r ? "bg-neutral-100" : ""}`}
                >
                  {REACTION_META[r].emoji}
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              if (longPressed.current) {
                longPressed.current = false;
                return;
              }
              choose(mine ? null : "like");
            }}
            onTouchStart={() => {
              longPressed.current = false;
              pressTimer.current = window.setTimeout(() => {
                longPressed.current = true;
                setPicker(true);
              }, 400);
            }}
            onTouchEnd={() => pressTimer.current && window.clearTimeout(pressTimer.current)}
            onContextMenu={(e) => e.preventDefault()}
            className={`flex h-11 w-full select-none items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition hover:bg-neutral-50 ${meta ? meta.color : "text-neutral-600"}`}
          >
            {meta ? <span className="text-lg leading-none">{meta.emoji}</span> : <ThumbsUp className="h-[18px] w-[18px]" />}
            {meta ? (locale === "bn" ? meta.labelBn : meta.label) : L("Like", "লাইক")}
          </button>
        </div>
        <a href="#comment-composer" className="flex h-11 items-center justify-center gap-2 rounded-2xl text-sm font-semibold text-neutral-600 transition hover:bg-neutral-50">
          💬 <span>{L("Comment", "মন্তব্য")}</span>
        </a>
        <button type="button" onClick={share} className="flex h-11 items-center justify-center gap-2 rounded-2xl text-sm font-semibold text-neutral-600 transition hover:bg-neutral-50">
          <Link2 className="h-[18px] w-[18px]" />
          {copied ? L("Copied!", "কপি হয়েছে!") : L("Share", "শেয়ার")}
        </button>
      </div>
    </section>
  );
}
