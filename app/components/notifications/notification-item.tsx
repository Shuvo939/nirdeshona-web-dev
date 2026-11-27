"use client";

import { AtSign, Bell, FileText, Heart, KeyRound, LifeBuoy, Mail, MessageCircle, Reply } from "lucide-react";

import { timeAgo } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/client";
import { localizeNotification, notificationKind, type NotificationKind } from "@/lib/notifications-i18n";

export type NotificationRow = {
  id: string;
  type: string;
  title: string;
  message: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

const KIND_STYLE: Record<NotificationKind, { icon: typeof Bell; className: string }> = {
  comment: { icon: MessageCircle, className: "bg-sky-100 text-sky-700" },
  reply: { icon: Reply, className: "bg-sky-100 text-sky-700" },
  reaction: { icon: Heart, className: "bg-rose-100 text-rose-600" },
  ticket: { icon: LifeBuoy, className: "bg-amber-100 text-amber-700" },
  access: { icon: KeyRound, className: "bg-emerald-100 text-emerald-700" },
  quote: { icon: FileText, className: "bg-violet-100 text-violet-700" },
  contact: { icon: Mail, className: "bg-indigo-100 text-indigo-700" },
  system: { icon: AtSign, className: "bg-neutral-100 text-neutral-600" },
};

/** One notification row, shared by the header bell and the notifications page. */
export default function NotificationItem({
  item,
  onOpen,
  compact = false,
}: {
  item: NotificationRow;
  onOpen: (item: NotificationRow) => void;
  compact?: boolean;
}) {
  const { locale } = useI18n();
  const n = localizeNotification(item, locale);
  const { icon: Icon, className } = KIND_STYLE[notificationKind(item.type, item.title)];
  const unread = !item.read_at;

  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className={`group flex w-full items-start gap-3 text-left transition ${
        compact ? "rounded-xl px-3 py-2.5" : "rounded-2xl border p-4"
      } ${
        unread
          ? compact
            ? "bg-sky-50/70 hover:bg-sky-50"
            : "border-sky-200 bg-sky-50/50 hover:bg-sky-50"
          : compact
            ? "hover:bg-neutral-50"
            : "border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm"
      }`}
    >
      <span className={`flex shrink-0 items-center justify-center rounded-full ${compact ? "h-9 w-9" : "h-10 w-10"} ${className}`}>
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block text-sm leading-5 ${unread ? "font-semibold text-neutral-950" : "font-medium text-neutral-800"}`}>{n.title}</span>
        {n.message && <span className="mt-0.5 line-clamp-2 block text-xs leading-5 text-neutral-500">{n.message}</span>}
        <span className={`mt-1 block text-[11px] ${unread ? "font-semibold text-sky-700" : "text-neutral-400"}`}>{timeAgo(item.created_at, locale)}</span>
      </span>
      {unread && <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-sky-500" aria-hidden />}
    </button>
  );
}
