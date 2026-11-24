import type { ReactNode } from "react";
import { LogOut } from "lucide-react";

import SideNav, { type SideNavGroup } from "@/app/components/side-nav";
import { getClientMemberships, requireUser } from "@/lib/auth/session";
import { sql } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import SubmitButton from "@/app/components/submit-button";

async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  const { redirect } = await import("next/navigation");
  redirect("/login");
}

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const user = await requireUser("/account");
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

  const groups: SideNavGroup[] = [
    {
      label: "Account",
      links: [
        { href: "/account", label: "Overview", icon: "dashboard", exact: true },
        { href: "/notifications", label: "Notifications", icon: "bell", badge: counts.unread },
        { href: "/profile", label: "Profile", icon: "user" },
        { href: "/settings", label: "Settings", icon: "settings" },
      ],
    },
    {
      label: "Client portal",
      links: isClient
        ? [
            { href: "/client", label: "Projects & tickets", icon: "folder", exact: true, badge: counts.waiting },
            { href: "/client/tickets/new", label: "New ticket", icon: "lifebuoy" },
          ]
        : [{ href: "/client", label: "Client portal", icon: "folder", exact: true }],
    },
    ...(user.role === "ADMIN"
      ? [{ label: "Workspace", links: [{ href: "/admin", label: "Admin panel", icon: "shield" as const }] }]
      : []),
  ];

  return (
    <div className="min-h-[calc(100vh-70px)] bg-neutral-50">
      <div className="mx-auto flex max-w-7xl gap-8 px-0 lg:px-8">
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-[70px] flex max-h-[calc(100vh-70px)] flex-col gap-6 overflow-y-auto py-8">
            <SideNav groups={groups} label="Account navigation" />
            <form action={signOut} className="border-t border-neutral-200 pt-4">
              <SubmitButton pendingText="Logging out…" icon={<LogOut className="h-[18px] w-[18px]" strokeWidth={1.8} />} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-70">
                Log out
              </SubmitButton>
            </form>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="sticky top-[65px] z-30 border-b border-neutral-200 bg-neutral-50/95 backdrop-blur lg:hidden">
            <div className="overflow-x-auto px-4 py-3 [scrollbar-width:none] sm:px-6 [&::-webkit-scrollbar]:hidden">
              <SideNav groups={groups} mobile label="Account navigation" />
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
