import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  Bell,
  CheckCircle2,
  Circle,
  FolderKanban,
  Heart,
  LifeBuoy,
  MessageCircle,
  Newspaper,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import AccountHeader from "@/app/components/account-header";
import { PROJECT_STATUS, StatusBadge, TICKET_STATUS, formatDate } from "@/app/components/marketing";
import { getClientMemberships, requireUser } from "@/lib/auth/session";
import { sql } from "@/lib/db";

export const metadata: Metadata = { title: "My account — Nirdeshona Web", robots: { index: false } };

function timeAgo(value: string) {
  const s = (Date.now() - new Date(value).getTime()) / 1000;
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return formatDate(value);
}

export default async function AccountPage() {
  const user = await requireUser("/account");
  const memberships = await getClientMemberships(user.id);
  const clientIds = memberships.map((m) => m.id);

  const [[stats], myComments, notifications, projects, tickets, [{ bio }]] = await Promise.all([
    sql`
      select
        (select count(*)::int from comments where user_id = ${user.id} and status = 'visible') as comments,
        (select count(*)::int from post_reactions where user_id = ${user.id}) as reactions,
        (select count(*)::int from comment_likes l join comments c on c.id = l.comment_id where c.user_id = ${user.id}) as likes_received,
        (select count(*)::int from notifications where user_id = ${user.id} and read_at is null) as unread,
        (select count(*)::int from support_tickets where client_id = any(${clientIds}::uuid[]) and status not in ('RESOLVED','CLOSED')) as open_tickets
    `,
    sql`
      select c.id, c.content, c.created_at, c.parent_id, p.slug, p.title,
             (select count(*)::int from comments r where r.parent_id = c.id and r.status = 'visible') as replies,
             (select count(*)::int from comment_likes l where l.comment_id = c.id) as likes
      from comments c join posts p on p.id = c.post_id
      where c.user_id = ${user.id} and c.status = 'visible'
      order by c.created_at desc limit 5
    `,
    sql`select id, title, link, read_at, created_at from notifications where user_id = ${user.id} order by created_at desc limit 5`,
    clientIds.length
      ? sql`select slug, title, status, progress_percent from projects where client_id = any(${clientIds}::uuid[]) order by (status = 'COMPLETED'), updated_at desc limit 4`
      : Promise.resolve([]),
    clientIds.length
      ? sql`select id, ticket_number, subject, status, updated_at from support_tickets where client_id = any(${clientIds}::uuid[]) order by updated_at desc limit 4`
      : Promise.resolve([]),
    sql`select bio from profiles where id = ${user.id}`,
  ]);

  const checklist = [
    { done: Boolean(user.fullName), label: "Add your name", href: "/profile" },
    { done: Boolean(user.avatarUrl), label: "Upload a profile photo", href: "/profile" },
    { done: Boolean(user.phone), label: "Add a phone number", href: "/profile" },
    { done: Boolean(user.company), label: "Add your organisation", href: "/profile" },
    { done: Boolean(bio), label: "Write a short bio", href: "/profile" },
  ];
  const completeness = Math.round((checklist.filter((c) => c.done).length / checklist.length) * 100);
  const firstName = user.fullName?.split(" ")[0];
  const hour = Number(new Date().toLocaleString("en-GB", { hour: "numeric", hour12: false, timeZone: "Asia/Dhaka" }));
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex flex-col gap-8 px-4 py-8 sm:px-6 lg:px-0">
      <AccountHeader title={`${greeting}${firstName ? `, ${firstName}` : ""}`} description="Here's what's happening with your account." />

      {/* Identity card */}
      <div className="relative overflow-hidden rounded-3xl bg-neutral-950 p-6 text-white sm:p-8">
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10 text-2xl font-semibold ring-4 ring-white/10">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                (user.fullName || user.email).charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold">{user.fullName || "Add your name"}</p>
              <p className="truncate text-sm text-neutral-400">{user.email}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium capitalize">{user.role.toLowerCase()}</span>
                {memberships.map((m) => (
                  <span key={m.id} className="rounded-full bg-emerald-400/15 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300">
                    {m.name}
                  </span>
                ))}
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] text-neutral-300">Joined {formatDate(user.createdAt)}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/profile" className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-neutral-950 hover:bg-neutral-200">
              <UserRound className="h-4 w-4" /> Edit profile
            </Link>
            <Link href="/settings" className="inline-flex h-10 items-center gap-2 rounded-full border border-white/15 px-4 text-sm font-semibold hover:bg-white/10">
              <Settings className="h-4 w-4" /> <span className="hidden sm:inline">Settings</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={<MessageCircle className="h-4 w-4" />} label="Comments" value={stats.comments} />
        <Stat icon={<Heart className="h-4 w-4" />} label="Likes received" value={stats.likes_received} />
        <Stat icon={<Bell className="h-4 w-4" />} label="Unread updates" value={stats.unread} href="/notifications" />
        {clientIds.length ? (
          <Stat icon={<LifeBuoy className="h-4 w-4" />} label="Open tickets" value={stats.open_tickets} href="/client" />
        ) : (
          <Stat icon={<Newspaper className="h-4 w-4" />} label="Reactions given" value={stats.reactions} />
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
        <div className="flex min-w-0 flex-col gap-6">
          {/* Client portal summary */}
          {clientIds.length > 0 ? (
            <Card
              title="Client portal"
              icon={<FolderKanban className="h-4 w-4" />}
              action={<Link href="/client" className="text-xs font-semibold text-neutral-500 hover:text-neutral-950">Open portal →</Link>}
            >
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">Projects</p>
                  {projects.length === 0 && <p className="text-sm text-neutral-500">No projects yet.</p>}
                  {projects.map((p) => (
                    <Link key={p.slug} href={`/projects/${p.slug}`} className="rounded-2xl border border-neutral-100 p-3 transition hover:border-neutral-200 hover:bg-neutral-50">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium">{p.title}</span>
                        <StatusBadge map={PROJECT_STATUS} value={p.status} />
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                        <div className="h-full rounded-full bg-neutral-950" style={{ width: `${p.progress_percent}%` }} />
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">Recent tickets</p>
                  {tickets.length === 0 && <p className="text-sm text-neutral-500">No tickets yet.</p>}
                  {tickets.map((t) => (
                    <Link key={t.id} href={`/client/tickets/${t.id}`} className="flex items-center justify-between gap-2 rounded-2xl border border-neutral-100 p-3 transition hover:border-neutral-200 hover:bg-neutral-50">
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{t.subject}</span>
                        <span className="text-xs text-neutral-500">#{t.ticket_number} · {timeAgo(t.updated_at)}</span>
                      </span>
                      <StatusBadge map={TICKET_STATUS} value={t.status} />
                    </Link>
                  ))}
                  <Link href="/client/tickets/new" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-dashed border-neutral-300 p-3 text-sm font-medium text-neutral-600 hover:bg-neutral-50">
                    <LifeBuoy className="h-4 w-4" /> Open a new ticket
                  </Link>
                </div>
              </div>
            </Card>
          ) : (
            <div className="flex flex-col gap-4 rounded-3xl border border-neutral-200 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-neutral-950">Working with us on a project?</p>
                <p className="mt-1 text-sm text-neutral-600">Ask us to link your account to see progress, open tickets and share files.</p>
              </div>
              <Link href="/contact?service=Not%20sure%20yet" className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-neutral-950 px-4 text-sm font-semibold text-white hover:bg-neutral-800">
                Request client access
              </Link>
            </div>
          )}

          {/* My comments */}
          <Card title="My recent comments" icon={<MessageCircle className="h-4 w-4" />} action={<Link href="/blog" className="text-xs font-semibold text-neutral-500 hover:text-neutral-950">Read the blog →</Link>}>
            {myComments.length === 0 ? (
              <p className="text-sm text-neutral-500">You haven&apos;t commented yet. Join the conversation on the blog.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {myComments.map((c) => (
                  <li key={c.id}>
                    <Link href={`/blog/${c.slug}#comment-${c.id}`} className="group block rounded-2xl border border-neutral-100 p-4 transition hover:border-neutral-200 hover:bg-neutral-50">
                      <p className="text-xs text-neutral-500">
                        {c.parent_id ? "Replied on" : "Commented on"} <span className="font-medium text-neutral-800">{c.title}</span> · {timeAgo(c.created_at)}
                      </p>
                      <p className="mt-1.5 line-clamp-2 text-sm text-neutral-700">{c.content}</p>
                      <p className="mt-2 flex items-center gap-3 text-xs text-neutral-500">
                        <span>👍 {c.likes}</span>
                        {!c.parent_id && <span>💬 {c.replies} {c.replies === 1 ? "reply" : "replies"}</span>}
                        <ArrowUpRight className="ml-auto h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <aside className="flex flex-col gap-6">
          {completeness < 100 && (
            <Card title="Complete your profile" icon={<UserRound className="h-4 w-4" />}>
              <div className="mb-3 flex justify-between text-xs text-neutral-500">
                <span>{completeness}% complete</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${completeness}%` }} />
              </div>
              <ul className="mt-4 flex flex-col gap-1">
                {checklist.map((c) => (
                  <li key={c.label}>
                    <Link href={c.href} className={`flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition hover:bg-neutral-50 ${c.done ? "text-neutral-400 line-through" : "text-neutral-700"}`}>
                      {c.done ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Circle className="h-4 w-4 text-neutral-300" />}
                      {c.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card title="Notifications" icon={<Bell className="h-4 w-4" />} action={<Link href="/notifications" className="text-xs font-semibold text-neutral-500 hover:text-neutral-950">All →</Link>}>
            {notifications.length === 0 ? (
              <p className="text-sm text-neutral-500">No updates yet.</p>
            ) : (
              <ul className="flex flex-col gap-1">
                {notifications.map((n) => (
                  <li key={n.id}>
                    <Link href={n.link || "/notifications"} className="flex gap-2.5 rounded-xl p-2 transition hover:bg-neutral-50">
                      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read_at ? "bg-neutral-200" : "bg-blue-500"}`} />
                      <span className="min-w-0">
                        <span className="block truncate text-sm text-neutral-800">{n.title}</span>
                        <span className="text-xs text-neutral-400">{timeAgo(n.created_at)}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {user.role === "ADMIN" && (
            <Link href="/admin" className="flex items-center gap-3 rounded-3xl border border-neutral-200 bg-white p-5 transition hover:shadow-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-950 text-white">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-neutral-950">Admin panel</span>
                <span className="text-xs text-neutral-500">Manage content, clients and users</span>
              </span>
            </Link>
          )}
        </aside>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: number; href?: string }) {
  const body = (
    <>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600">{icon}</span>
      <p className="mt-4 text-2xl font-bold tracking-tight text-neutral-950">{value}</p>
      <p className="text-xs text-neutral-500">{label}</p>
    </>
  );
  const cls = "rounded-3xl border border-neutral-200 bg-white p-5";
  return href ? <Link href={href} className={`${cls} transition hover:border-neutral-300 hover:shadow-sm`}>{body}</Link> : <div className={cls}>{body}</div>;
}

function Card({ title, icon, action, children }: { title: string; icon: React.ReactNode; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-neutral-200 bg-white p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-neutral-950">
          <span className="text-neutral-400">{icon}</span> {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
