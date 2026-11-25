import type { ReactNode } from "react";
import { LogOut } from "lucide-react";

import SideNav, { type SideNavGroup } from "@/app/components/side-nav";
import { getClientMemberships, requireUser } from "@/lib/auth/session";
import { syncClientAccessForUser } from "@/lib/clients/access";
import { sql } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import SubmitButton from "@/app/components/submit-button";
import { getI18n } from "@/lib/i18n/server";

async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  const { redirect } = await import("next/navigation");
  const { localizePath } = await import("@/lib/i18n/config");
  const { getLocale } = await import("@/lib/i18n/server");
  redirect(localizePath(await getLocale(), "/login"));
}

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const user = await requireUser("/account");
  // Give portal access automatically when the verified email matches a client.
  await syncClientAccessForUser(user.id);
  const [memberships, [counts]] = await Promise.all([
    getClientMemberships(user.id),
    sql`
      select
        (select count(*)::int from notifications where user_id = ${user.id} and read_at is null) as unread,
        (select count(*)::int from support_tickets t join client_members m on m.client_id = t.client_id
          where m.user_id = ${user.id} and t.status = 'WAITING_FOR_CLIENT') as waiting
    `,
  ]);
  const isClient = memberships.length > 0;
  const { L } = await getI18n();

  const groups: SideNavGroup[] = [
    {
      label: L("Account", "অ্যাকাউন্ট"),
      links: [
        { href: "/account", label: L("Overview", "সারসংক্ষেপ"), icon: "dashboard", exact: true },
        { href: "/notifications", label: L("Notifications", "নোটিফিকেশন"), icon: "bell", badge: counts.unread },
        { href: "/profile", label: L("Profile", "প্রোফাইল"), icon: "user" },
        { href: "/settings", label: L("Settings", "সেটিংস"), icon: "settings" },
      ],
    },
    {
      label: L("Client portal", "ক্লায়েন্ট পোর্টাল"),
      links: isClient
        ? [
            { href: "/client", label: L("Projects & tickets", "প্রজেক্ট ও টিকেট"), icon: "folder", exact: true, badge: counts.waiting },
            { href: "/client/tickets/new", label: L("New ticket", "নতুন টিকেট"), icon: "lifebuoy" },
          ]
        : [{ href: "/client", label: L("Client portal", "ক্লায়েন্ট পোর্টাল"), icon: "folder", exact: true }],
    },
    ...(user.role === "ADMIN"
      ? [{ label: L("Workspace", "ওয়ার্কস্পেস"), links: [{ href: "/admin", label: L("Admin panel", "অ্যাডমিন প্যানেল"), icon: "shield" as const }] }]
      : []),
  ];

  return (
    <div className="min-h-[calc(100vh-70px)] bg-neutral-50">
      <div className="mx-auto flex max-w-7xl gap-8 px-0 lg:px-8">
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-[70px] flex max-h-[calc(100vh-70px)] flex-col gap-6 overflow-y-auto py-8">
            <SideNav groups={groups} label={L("Account navigation", "অ্যাকাউন্ট নেভিগেশন")} />
            <form action={signOut} className="border-t border-neutral-200 pt-4">
              <SubmitButton pendingText={L("Logging out…", "লগ আউট হচ্ছে…")} icon={<LogOut className="h-[18px] w-[18px]" strokeWidth={1.8} />} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-70">
                {L("Log out", "লগ আউট")}
              </SubmitButton>
            </form>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="sticky top-[65px] z-30 border-b border-neutral-200 bg-neutral-50/95 backdrop-blur lg:hidden">
            <div className="overflow-x-auto px-4 py-3 [scrollbar-width:none] sm:px-6 [&::-webkit-scrollbar]:hidden">
              <SideNav groups={groups} mobile label={L("Account navigation", "অ্যাকাউন্ট নেভিগেশন")} />
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
