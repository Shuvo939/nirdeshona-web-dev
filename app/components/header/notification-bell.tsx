"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";

import Link from "@/app/components/locale-link";
import { startNavigationProgress } from "@/app/components/navigation-progress";
import NotificationItem, { type NotificationRow } from "@/app/components/notifications/notification-item";
import { useI18n } from "@/lib/i18n/client";

const POLL_MS = 60_000;

export default function NotificationBell({ initialUnread }: { initialUnread: number }) {
  const router = useRouter();
  const { L, lp, num } = useI18n();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(initialUnread);
  const [items, setItems] = useState<NotificationRow[] | null>(null);
  const [tab, setTab] = useState<"all" | "unread">("all");
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications?limit=10", { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      const json = await res.json();
      setItems(json.items);
      setUnread(json.unread);
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, []);

  // Keep the badge fresh: on focus, and every minute while the tab is visible.
  useEffect(() => {
    const refresh = () => document.visibilityState === "visible" && void load();
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    const timer = window.setInterval(refresh, POLL_MS);
    return () => {
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
      window.clearInterval(timer);
    };
  }, [load]);

  useEffect(() => setUnread(initialUnread), [initialUnread]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function markAll() {
    setUnread(0);
    setItems((prev) => prev?.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })) ?? null);
    await fetch("/api/notifications", { method: "POST" }).catch(() => undefined);
    router.refresh();
  }

  function openItem(item: NotificationRow) {
    setOpen(false);
    if (!item.read_at) {
      setUnread((u) => Math.max(0, u - 1));
      setItems((prev) => prev?.map((n) => (n.id === item.id ? { ...n, read_at: new Date().toISOString() } : n)) ?? null);
      void fetch(`/api/notifications?id=${item.id}`, { method: "POST", keepalive: true });
    }
    startNavigationProgress();
    router.push(lp(item.link || "/notifications"));
  }

  const shown = (items ?? []).filter((n) => tab === "all" || !n.read_at);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={unread ? L(`Notifications (${unread} unread)`, `নোটিফিকেশন (${num(unread)}টি অপঠিত)`) : L("Notifications", "নোটিফিকেশন")}
        aria-expanded={open}
        onClick={() => {
          setOpen((v) => !v);
          if (!open) void load();
        }}
        className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-neutral-100 hover:text-neutral-950 ${open ? "bg-neutral-100 text-neutral-950" : "text-neutral-600"}`}
      >
        <Bell className="h-[18px] w-[18px]" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
            {unread > 9 ? `${num(9)}+` : num(unread)}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-x-3 top-[70px] z-50 flex max-h-[calc(100vh-90px)] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_24px_70px_rgba(0,0,0,0.14)] sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-3 sm:max-h-[min(640px,calc(100vh-100px))] sm:w-[380px]">
          <div className="flex items-center justify-between px-4 pb-2 pt-3">
            <p className="text-base font-bold text-neutral-950">{L("Notifications", "নোটিফিকেশন")}</p>
            {unread > 0 && (
              <button type="button" onClick={markAll} className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-50">
                <CheckCheck className="h-3.5 w-3.5" /> {L("Mark all read", "সব পড়া হয়েছে")}
              </button>
            )}
          </div>
          <div className="flex gap-1.5 px-4 pb-2" role="tablist">
            {(
              [
                ["all", L("All", "সব")],
                ["unread", unread ? L(`Unread (${unread})`, `অপঠিত (${num(unread)})`) : L("Unread", "অপঠিত")],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${tab === id ? "bg-neutral-950 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto border-t border-neutral-100">
            {items === null ? (
              failed ? (
                <p className="px-4 py-10 text-center text-sm text-neutral-500">{L("Couldn't load notifications.", "নোটিফিকেশন লোড করা যায়নি।")}</p>
              ) : (
                <ul className="flex flex-col gap-1 p-1.5" aria-busy="true">
                  {Array.from({ length: 4 }, (_, i) => (
                    <li key={i} className="flex gap-3 px-3 py-2.5">
                      <span className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-neutral-100" />
                      <span className="flex-1">
                        <span className="block h-3.5 w-4/5 animate-pulse rounded-full bg-neutral-100" />
                        <span className="mt-2 block h-3 w-1/3 animate-pulse rounded-full bg-neutral-100" />
                      </span>
                    </li>
                  ))}
                </ul>
              )
            ) : shown.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
                  <Bell className="h-5 w-5 text-neutral-400" />
                </span>
                <p className="mt-3 text-sm font-medium text-neutral-700">{L("You're all caught up", "নতুন কিছু নেই")}</p>
                <p className="mt-1 text-xs text-neutral-500">
                  {L("Replies, reactions and project updates will show up here.", "উত্তর, রিঅ্যাকশন আর প্রজেক্টের আপডেট এখানে দেখাবে।")}
                </p>
              </div>
            ) : (
              <ul className="flex flex-col gap-0.5 p-1.5">
                {shown.map((n) => (
                  <li key={n.id}>
                    <NotificationItem item={n} onOpen={openItem} compact />
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="border-t border-neutral-100">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-center text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              {L("See all notifications", "সব নোটিফিকেশন দেখুন")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
