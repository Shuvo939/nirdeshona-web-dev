import type { Metadata } from "next";

import AccountHeader from "@/app/components/account-header";
import NotificationCenter from "@/app/components/notifications/notification-center";
import type { NotificationRow } from "@/app/components/notifications/notification-item";
import { requireUser } from "@/lib/auth/session";
import { sql } from "@/lib/db";
import { getI18n, msg } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await msg("Notifications — Nirdeshona Web", "নোটিফিকেশন — নির্দেশনা ওয়েব"), robots: { index: false } };
}

const PAGE = 20;

export default async function NotificationsPage() {
  const { L } = await getI18n();
  const user = await requireUser("/notifications");
  const [items, [{ unread }]] = await Promise.all([
    sql`
      select id, type, title, message, link, read_at, created_at
      from notifications
      where user_id = ${user.id}
      order by created_at desc
      limit ${PAGE + 1}
    `,
    sql`select count(*)::int as unread from notifications where user_id = ${user.id} and read_at is null`,
  ]);
  const rows = (items as unknown as NotificationRow[]).map((n) => ({
    ...n,
    created_at: new Date(n.created_at).toISOString(),
    read_at: n.read_at ? new Date(n.read_at).toISOString() : null,
  }));

  return (
    <div className="flex flex-col gap-8 px-4 py-8 sm:px-6 lg:px-0">
      <AccountHeader
        title={L("Notifications", "নোটিফিকেশন")}
        description={L("Replies, reactions, tickets and project updates in one place.", "উত্তর, রিঅ্যাকশন, টিকেট ও প্রজেক্টের আপডেট — এক জায়গায়।")}
        crumbs={[{ label: L("Notifications", "নোটিফিকেশন") }]}
      />
      <NotificationCenter initialItems={rows.slice(0, PAGE)} initialHasMore={rows.length > PAGE} initialUnread={unread} />
    </div>
  );
}
