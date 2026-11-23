import type { Metadata } from "next";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";

import { markNotificationsRead } from "@/app/client/actions";
import { PageHero, formatDate } from "@/app/components/marketing";
import { requireUser } from "@/lib/auth/session";
import { sql } from "@/lib/db";

export const metadata: Metadata = { title: "Notifications — Nirdeshona Web", robots: { index: false } };

export default async function NotificationsPage() {
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
    <>
      <PageHero title="Notifications" description="Updates on your tickets and projects." breadcrumbs={[{ label: "Account", href: "/client" }, { label: "Notifications" }]} />
      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-neutral-500">{unread} unread</p>
          {unread > 0 && (
            <form action={markNotificationsRead}>
              <button type="submit" className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50">
                <CheckCheck className="h-3.5 w-3.5" /> Mark all as read
              </button>
            </form>
          )}
        </div>
        {items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-12 text-center">
            <Bell className="mx-auto h-8 w-8 text-neutral-300" />
            <p className="mt-4 text-sm text-neutral-500">You&apos;re all caught up.</p>
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
                    <span className="mt-1 block text-xs text-neutral-400">{formatDate(n.created_at, true)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
