import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Building2,
  ClipboardList,
  Flag,
  FolderKanban,
  ImageIcon,
  MessageCircle,
  MessageSquareText,
  Newspaper,
  Plus,
  Users,
} from "lucide-react";

import { AdminHeader, Avatar, timeAgo } from "./admin-ui";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [[c], activity, comments, users, tickets] = await Promise.all([
    sql`
      select
        (select count(*)::int from clients) as clients,
        (select count(*)::int from projects) as projects,
        (select count(*)::int from projects where status <> 'COMPLETED') as active_projects,
        (select count(*)::int from posts where status = 'published') as posts,
        (select count(*)::int from posts where status = 'draft') as drafts,
        (select count(*)::int from comments where status = 'visible') as comments,
        (select count(*)::int from comments where created_at > now() - interval '7 days') as comments_week,
        (select count(*)::int from profiles) as users,
        (select count(*)::int from profiles where created_at > now() - interval '7 days') as users_week,
        (select count(*)::int from files) as files,
        (select count(*)::int from support_tickets where status in ('OPEN','IN_PROGRESS')) as open_tickets,
        (select count(*)::int from support_tickets where status in ('OPEN','IN_PROGRESS') and priority in ('HIGH','URGENT')) as urgent_tickets,
        (select count(*)::int from contact_requests where status = 'new') as new_contacts,
        (select count(distinct comment_id)::int from comment_reports where resolved_at is null) as reports,
        (select coalesce(sum(views_count), 0)::int from posts) as views
    `,
    sql`
      select a.summary, a.created_at, a.entity, p.full_name
      from activity_log a left join profiles p on p.id = a.actor_id
      order by a.created_at desc limit 6
    `,
    sql`
      select c.id, c.content, c.created_at, p.full_name, p.avatar_url, po.slug, po.title
      from comments c join profiles p on p.id = c.user_id join posts po on po.id = c.post_id
      where c.status = 'visible' order by c.created_at desc limit 5
    `,
    sql`select id, full_name, avatar_url, role, created_at from profiles order by created_at desc limit 5`,
    sql`
      select t.id, t.ticket_number, t.subject, t.priority, t.updated_at, cl.name as client
      from support_tickets t join clients cl on cl.id = t.client_id
      where t.status in ('OPEN','IN_PROGRESS')
      order by case t.priority when 'URGENT' then 0 when 'HIGH' then 1 else 2 end, t.updated_at desc limit 5
    `,
  ]);

  const tiles = [
    { label: "Clients", value: c.clients, sub: `${c.active_projects} active projects`, href: "/admin/clients", icon: Building2 },
    { label: "Projects", value: c.projects, sub: `${c.projects - c.active_projects} completed`, href: "/admin/projects", icon: FolderKanban },
    { label: "Published posts", value: c.posts, sub: `${c.drafts} drafts · ${c.views.toLocaleString()} views`, href: "/admin/posts", icon: Newspaper },
    { label: "Comments", value: c.comments, sub: `${c.comments_week} this week`, href: "/admin/comments", icon: MessageCircle },
    { label: "Users", value: c.users, sub: `${c.users_week} new this week`, href: "/admin/users", icon: Users },
    { label: "Media files", value: c.files, sub: "Stored on Cloudflare R2", href: "/admin/media", icon: ImageIcon },
  ];

  const attention = [
    { label: "Open support tickets", sub: c.urgent_tickets ? `${c.urgent_tickets} high or urgent` : "Waiting on the team", value: c.open_tickets, href: "/admin/tickets", icon: ClipboardList },
    { label: "New contact requests", sub: "Unreviewed project inquiries", value: c.new_contacts, href: "/admin/contacts", icon: MessageSquareText },
    { label: "Reported comments", sub: "Need moderation", value: c.reports, href: "/admin/comments?f=reported", icon: Flag },
  ];

  return (
    <div className="flex flex-col gap-8">
      <AdminHeader
        title="Overview"
        description="Your workspace at a glance."
        actions={
          <>
            <Link href="/admin/posts/new" className="inline-flex h-10 items-center gap-2 rounded-xl bg-neutral-950 px-4 text-sm font-semibold text-white hover:bg-neutral-800">
              <Plus className="h-4 w-4" /> New post
            </Link>
            <Link href="/admin/projects/new" className="inline-flex h-10 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-800 hover:bg-neutral-50">
              <Plus className="h-4 w-4" /> New project
            </Link>
          </>
        }
      />

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {attention.map((a) => (
          <Link
            key={a.label}
            href={a.href}
            className={`group flex items-center gap-4 rounded-2xl border p-4 transition hover:shadow-sm ${a.value > 0 ? "border-amber-200 bg-amber-50/60" : "border-neutral-200 bg-white"}`}
          >
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${a.value > 0 ? "bg-amber-100 text-amber-700" : "bg-neutral-100 text-neutral-500"}`}>
              <a.icon className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-neutral-900">{a.label}</span>
              <span className="block truncate text-xs text-neutral-500">{a.sub}</span>
            </span>
            <span className="text-2xl font-bold text-neutral-950">{a.value}</span>
          </Link>
        ))}
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-3 2xl:grid-cols-6">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href} className="group rounded-2xl border border-neutral-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 transition group-hover:bg-neutral-950 group-hover:text-white">
                <t.icon className="h-4 w-4" />
              </span>
              <ArrowRight className="h-4 w-4 text-neutral-300 transition group-hover:text-neutral-700" />
            </div>
            <p className="mt-4 text-2xl font-bold tracking-tight text-neutral-950">{t.value.toLocaleString()}</p>
            <p className="text-sm font-medium text-neutral-700">{t.label}</p>
            <p className="mt-0.5 truncate text-xs text-neutral-400">{t.sub}</p>
          </Link>
        ))}
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Panel title="Support queue" href="/admin/tickets" icon={ClipboardList}>
          {tickets.length === 0 ? (
            <EmptyLine>No open tickets 🎉</EmptyLine>
          ) : (
            tickets.map((t) => (
              <Row key={t.id} href={`/admin/tickets/${t.id}`}>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-neutral-900">{t.subject}</span>
                  <span className="text-xs text-neutral-500">#{t.ticket_number} · {t.client} · {timeAgo(t.updated_at)}</span>
                </span>
                <span className={`text-xs font-semibold ${t.priority === "URGENT" ? "text-red-600" : t.priority === "HIGH" ? "text-orange-600" : "text-neutral-400"}`}>
                  {t.priority.charAt(0) + t.priority.slice(1).toLowerCase()}
                </span>
              </Row>
            ))
          )}
        </Panel>

        <Panel title="Latest comments" href="/admin/comments" icon={MessageCircle}>
          {comments.length === 0 ? (
            <EmptyLine>No comments yet.</EmptyLine>
          ) : (
            comments.map((cm) => (
              <Row key={cm.id} href={`/blog/${cm.slug}#comment-${cm.id}`}>
                <Avatar name={cm.full_name} url={cm.avatar_url} size="h-8 w-8" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-neutral-800">
                    <span className="font-semibold">{cm.full_name || "Member"}</span> {cm.content}
                  </span>
                  <span className="block truncate text-xs text-neutral-500">on {cm.title} · {timeAgo(cm.created_at)}</span>
                </span>
              </Row>
            ))
          )}
        </Panel>

        <Panel title="Recent activity" href="/admin/activity" icon={Activity}>
          {activity.length === 0 ? (
            <EmptyLine>Staff actions will appear here.</EmptyLine>
          ) : (
            activity.map((a, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-neutral-300" />
                <span className="min-w-0 flex-1 text-sm text-neutral-700">
                  <span className="font-semibold text-neutral-900">{a.full_name || "System"}</span> {a.summary.charAt(0).toLowerCase() + a.summary.slice(1)}
                  <span className="block text-xs text-neutral-400">{timeAgo(a.created_at)}</span>
                </span>
              </div>
            ))
          )}
        </Panel>

        <Panel title="Newest users" href="/admin/users" icon={Users}>
          {users.map((u) => (
            <Row key={u.id} href={`/admin/users?q=${encodeURIComponent(u.full_name ?? "")}`}>
              <Avatar name={u.full_name} url={u.avatar_url} size="h-8 w-8" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-neutral-900">{u.full_name || "Unnamed user"}</span>
                <span className="text-xs text-neutral-500">Joined {timeAgo(u.created_at)}</span>
              </span>
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium capitalize text-neutral-600">{u.role.toLowerCase()}</span>
            </Row>
          ))}
        </Panel>
      </div>
    </div>
  );
}

function Panel({ title, href, icon: Icon, children }: { title: string; href: string; icon: typeof Users; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-neutral-950">
          <Icon className="h-4 w-4 text-neutral-400" /> {title}
        </h2>
        <Link href={href} className="text-xs font-semibold text-neutral-500 hover:text-neutral-950">View all →</Link>
      </div>
      <div className="divide-y divide-neutral-100">{children}</div>
    </section>
  );
}

function Row({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-4 py-3 transition hover:bg-neutral-50">
      {children}
    </Link>
  );
}

function EmptyLine({ children }: { children: React.ReactNode }) {
  return <p className="px-4 py-6 text-center text-sm text-neutral-500">{children}</p>;
}
