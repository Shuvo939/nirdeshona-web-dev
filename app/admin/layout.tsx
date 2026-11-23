import type { ReactNode } from "react";

import SideNav, { type SideNavGroup } from "@/app/components/side-nav";
import { requireAdmin } from "@/lib/auth/require-admin";
import { sql } from "@/lib/db";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();

  const [counts] = await sql`
    select
      (select count(*)::int from support_tickets where status in ('OPEN', 'IN_PROGRESS')) as tickets,
      (select count(*)::int from contact_requests where status = 'new') as contacts,
      (select count(distinct comment_id)::int from comment_reports where resolved_at is null) as reports
  `;

  const groups: SideNavGroup[] = [
    { links: [{ href: "/admin", label: "Overview", icon: "dashboard", exact: true }] },
    {
      label: "Content",
      links: [
        { href: "/admin/posts", label: "Posts", icon: "newspaper" },
        { href: "/admin/comments", label: "Comments", icon: "comment", badge: counts.reports },
        { href: "/admin/media", label: "Media", icon: "image" },
      ],
    },
    {
      label: "Clients & work",
      links: [
        { href: "/admin/clients", label: "Clients", icon: "building" },
        { href: "/admin/projects", label: "Projects", icon: "folder" },
        { href: "/admin/tickets", label: "Support tickets", icon: "clipboard", badge: counts.tickets },
        { href: "/admin/contacts", label: "Contact requests", icon: "inbox", badge: counts.contacts },
      ],
    },
    {
      label: "System",
      links: [
        { href: "/admin/users", label: "Users", icon: "users" },
        { href: "/admin/activity", label: "Activity log", icon: "activity" },
      ],
    },
  ];

  return (
    <div className="min-h-[calc(100vh-70px)] bg-neutral-50">
      <div className="flex">
        <aside className="hidden w-60 shrink-0 border-r border-neutral-200 bg-white lg:block">
          <div className="sticky top-[70px] max-h-[calc(100vh-70px)] overflow-y-auto px-3 py-6">
            <SideNav groups={groups} label="Admin navigation" />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="sticky top-[65px] z-30 border-b border-neutral-200 bg-white/95 backdrop-blur lg:hidden">
            <div className="overflow-x-auto px-4 py-3 [scrollbar-width:none] sm:px-6 [&::-webkit-scrollbar]:hidden">
              <SideNav groups={groups} mobile label="Admin navigation" />
            </div>
          </div>
          <main className="min-w-0 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto w-full max-w-[1400px]">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
