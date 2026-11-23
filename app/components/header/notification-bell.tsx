"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, Loader2 } from "lucide-react";

type Item = { id: string; title: string; message: string | null; link: string | null; read_at: string | null; created_at: string };

function timeAgo(value: string) {
  const diff = (Date.now() - new Date(value).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function NotificationBell({ initialUnread }: { initialUnread: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(initialUnread);
  const [items, setItems] = useState<Item[] | null>(null);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setItems(json.items);
        setUnread(json.unread);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Keep the badge fresh when the user comes back to the tab.
  useEffect(() => {
    const onFocus = () => {
      if (document.visibilityState === "visible") void load();
    };
    document.addEventListener("visibilitychange", onFocus);
    const timer = window.setInterval(onFocus, 120_000);
    return () => {
      document.removeEventListener("visibilitychange", onFocus);
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
    await fetch("/api/notifications", { method: "POST" });
    router.refresh();
  }

  async function openItem(item: Item) {
    setOpen(false);
    if (!item.read_at) {
      setUnread((u) => Math.max(0, u - 1));
      void fetch(`/api/notifications?id=${item.id}`, { method: "POST" });
    }
    router.push(item.link || "/notifications");
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={unread ? `Notifications (${unread} unread)` : "Notifications"}
        aria-expanded={open}
        onClick={() => {
          setOpen((v) => !v);
          if (!open) void load();
        }}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950"
      >
        <Bell className="h-[18px] w-[18px]" />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-x-3 top-[70px] z-50 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_24px_70px_rgba(0,0,0,0.14)] sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-3 sm:w-[360px]">
          <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
            <p className="text-sm font-semibold text-neutral-950">Notifications</p>
            {unread > 0 && (
              <button type="button" onClick={markAll} className="inline-flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-950">
                <CheckCheck className="h-3.5 w-3.5" /> Mark all read
              </button>
            )}
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {items === null ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
              </div>
            ) : items.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Bell className="mx-auto h-6 w-6 text-neutral-300" />
                <p className="mt-2 text-sm text-neutral-500">You&apos;re all caught up.</p>
              </div>
            ) : (
              <ul className="flex flex-col p-1.5">
                {items.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => openItem(n)}
                      className={`flex w-full gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-neutral-50 ${n.read_at ? "" : "bg-blue-50/50"}`}
                    >
                      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read_at ? "bg-transparent" : "bg-blue-500"}`} />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-neutral-900">{n.title}</span>
                        {n.message && <span className="mt-0.5 line-clamp-2 block text-xs text-neutral-500">{n.message}</span>}
                        <span className="mt-1 block text-[11px] text-neutral-400">{timeAgo(n.created_at)}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {loading && items !== null && <div className="h-0.5 animate-pulse bg-neutral-200" />}
          </div>
          <Link href="/notifications" onClick={() => setOpen(false)} className="block border-t border-neutral-100 px-4 py-3 text-center text-xs font-semibold text-neutral-700 hover:bg-neutral-50">
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
