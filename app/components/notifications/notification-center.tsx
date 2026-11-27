"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, Loader2, Trash2 } from "lucide-react";

import ConfirmDialog from "@/app/components/confirm-dialog";
import { startNavigationProgress } from "@/app/components/navigation-progress";
import { useI18n } from "@/lib/i18n/client";

import NotificationItem, { type NotificationRow } from "./notification-item";

const PAGE = 20;

/** Full notifications list for /notifications. */
export default function NotificationCenter({
  initialItems,
  initialHasMore,
  initialUnread,
}: {
  initialItems: NotificationRow[];
  initialHasMore: boolean;
  initialUnread: number;
}) {
  const router = useRouter();
  const { L, lp, stat } = useI18n();
  const [items, setItems] = useState(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [unread, setUnread] = useState(initialUnread);
  const [tab, setTab] = useState<"all" | "unread">("all");
  const [loadingMore, setLoadingMore] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [, start] = useTransition();

  async function loadMore() {
    const last = items[items.length - 1];
    if (!last) return;
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/notifications?limit=${PAGE}&before=${encodeURIComponent(last.created_at)}`, { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setItems((prev) => [...prev, ...json.items.filter((n: NotificationRow) => !prev.some((p) => p.id === n.id))]);
        setHasMore(json.hasMore);
        setUnread(json.unread);
      }
    } finally {
      setLoadingMore(false);
    }
  }

  function markAll() {
    const now = new Date().toISOString();
    setItems((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? now })));
    setUnread(0);
    start(async () => {
      await fetch("/api/notifications", { method: "POST" }).catch(() => undefined);
      router.refresh();
    });
  }

  function clearRead() {
    setConfirmClear(false);
    setItems((prev) => prev.filter((n) => !n.read_at));
    start(async () => {
      await fetch("/api/notifications?read=1", { method: "DELETE" }).catch(() => undefined);
      router.refresh();
    });
  }

  function open(item: NotificationRow) {
    if (!item.read_at) {
      setUnread((u) => Math.max(0, u - 1));
      setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, read_at: new Date().toISOString() } : n)));
      void fetch(`/api/notifications?id=${item.id}`, { method: "POST", keepalive: true });
    }
    if (item.link) {
      startNavigationProgress();
      router.push(lp(item.link));
    }
  }

  const shown = items.filter((n) => tab === "all" || !n.read_at);
  const hasRead = items.some((n) => n.read_at);

  return (
    <section className="max-w-3xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1.5" role="tablist">
          {(
            [
              ["all", L("All", "সব")],
              ["unread", unread ? L(`Unread (${unread})`, `অপঠিত (${stat(unread)})`) : L("Unread", "অপঠিত")],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${tab === id ? "bg-neutral-950 text-white" : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {unread > 0 && (
            <button
              type="button"
              onClick={markAll}
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              <CheckCheck className="h-3.5 w-3.5" /> {L("Mark all as read", "সব পড়া হয়েছে")}
            </button>
          )}
          {hasRead && (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="h-3.5 w-3.5" /> {L("Clear read", "পড়াগুলো মুছুন")}
            </button>
          )}
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-12 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
            <Bell className="h-5 w-5 text-neutral-400" />
          </span>
          <p className="mt-4 text-sm font-medium text-neutral-700">{L("You're all caught up", "সব দেখা হয়ে গেছে")}</p>
          <p className="mt-1 text-xs text-neutral-500">
            {L("Replies, reactions, ticket updates and portal access show up here.", "উত্তর, রিঅ্যাকশন, টিকেটের আপডেট আর পোর্টাল অ্যাক্সেস এখানে দেখাবে।")}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {shown.map((n) => (
            <li key={n.id}>
              <NotificationItem item={n} onOpen={open} />
            </li>
          ))}
        </ul>
      )}

      {hasMore && (
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-neutral-200 bg-white px-5 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 disabled:opacity-60"
          >
            {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
            {L("Show older", "আরও পুরোনো দেখুন")}
          </button>
        </div>
      )}

      {confirmClear && (
        <ConfirmDialog
          title={L("Clear read notifications?", "পড়া নোটিফিকেশনগুলো মুছবেন?")}
          description={L("Notifications you've already read will be removed. Unread ones stay.", "যেগুলো পড়া হয়ে গেছে সেগুলো মুছে যাবে। অপঠিতগুলো থাকবে।")}
          confirmLabel={L("Clear", "মুছুন")}
          onConfirm={clearRead}
          onCancel={() => setConfirmClear(false)}
        />
      )}
    </section>
  );
}
