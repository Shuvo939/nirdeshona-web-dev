import type { Metadata } from "next";
import Link from "@/app/components/locale-link";
import { Bell, CheckCheck } from "lucide-react";

import { markNotificationsRead } from "@/app/(account)/client/actions";
import AccountHeader from "@/app/components/account-header";
import { formatDate } from "@/app/components/marketing";
import { requireUser } from "@/lib/auth/session";
import { sql } from "@/lib/db";
import SubmitButton from "@/app/components/submit-button";
import { getI18n, msg } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await msg("Notifications — Nirdeshona Web", "নোটিফিকেশন — নির্দেশনা ওয়েব"), robots: { index: false } };
}

export default async function NotificationsPage() {
  const { L, locale, num } = await getI18n();
  const user = await requireUser("/notifications");
  const items = await sql`
    select id, title, message, link, read_at, created_at
    from notifications
    where user_id = ${user.id}
    order by created_at desc
    limit 100
  `;
  const unread = items.filter((n) => !n.read_at).length;

  return (
    <div className="flex flex-col gap-8 px-4 py-8 sm:px-6 lg:px-0">
      <AccountHeader title={L("Notifications", "নোটিফিকেশন")} description={L("Updates on your tickets and projects.", "আপনার টিকেট ও প্রজেক্টের আপডেট।")} crumbs={[{ label: L("Notifications", "নোটিফিকেশন") }]} />
      <section className="max-w-3xl">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-neutral-500">{L(`${unread} unread`, `${num(unread)}টি না-পড়া`)}</p>
          {unread > 0 && (
            <form action={markNotificationsRead}>
              <SubmitButton icon={<CheckCheck className="h-3.5 w-3.5" />} className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-70">
                {L("Mark all as read", "সবগুলো পড়া হয়েছে চিহ্নিত করুন")}
              </SubmitButton>
            </form>
          )}
        </div>
        {items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-12 text-center">
            <Bell className="mx-auto h-8 w-8 text-neutral-300" />
            <p className="mt-4 text-sm text-neutral-500">{L("You're all caught up.", "সব দেখা হয়ে গেছে।")}</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {items.map((n) => (
              <li key={n.id}>
                <Link
                  href={n.link || "/client"}
                  className={`flex gap-4 rounded-2xl border p-4 transition hover:shadow-sm ${n.read_at ? "border-neutral-200 bg-white" : "border-blue-200 bg-blue-50/50"}`}
                >
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read_at ? "bg-neutral-200" : "bg-blue-500"}`} />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-neutral-950">{n.title}</span>
                    {n.message && <span className="mt-0.5 line-clamp-2 block text-sm text-neutral-600">{n.message}</span>}
                    <span className="mt-1 block text-xs text-neutral-400">{formatDate(n.created_at, true, locale)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
