import type { Metadata } from "next";
import Link from "@/app/components/locale-link";
import {
  ArrowUpRight,
  Bell,
  ExternalLink,
  FolderKanban,
  LifeBuoy,
  MessageSquareText,
  Plus,
  UserRound,
} from "lucide-react";

import {
  PROJECT_STATUS,
  StatusBadge,
  TICKET_PRIORITY,
  TICKET_STATUS,
  formatDate,
  statusLabel,
} from "@/app/components/marketing";
import AccountHeader from "@/app/components/account-header";
import { getClientMemberships, requireUser } from "@/lib/auth/session";
import { sql } from "@/lib/db";
import { getI18n, msg } from "@/lib/i18n/server";
import { tcol } from "@/lib/i18n/sql";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await msg("Client dashboard — Nirdeshona Web", "ক্লায়েন্ট ড্যাশবোর্ড — নির্দেশনা ওয়েব"), robots: { index: false } };
}

const TICKET_FILTERS = [
  { value: "active", label: ["Active", "চলমান"] },
  { value: "closed", label: ["Closed", "বন্ধ"] },
  { value: "all", label: ["All", "সব"] },
] as const;

export default async function ClientDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tickets?: string }>;
}) {
  const { L, locale, num } = await getI18n();
  const user = await requireUser("/client");
  const { tickets: rawFilter } = await searchParams;
  const filter = TICKET_FILTERS.some((f) => f.value === rawFilter) ? rawFilter! : "active";
  const memberships = await getClientMemberships(user.id);
  const firstName = user.fullName?.split(" ")[0];

  const notifications = await sql`
    select id, title, message, link, read_at, created_at
    from notifications
    where user_id = ${user.id}
    order by created_at desc
    limit 5
  `;
  const unread = notifications.filter((n) => !n.read_at).length;

  if (memberships.length === 0) {
    return (
      <main className="px-4 py-8 sm:px-6 lg:px-0">
        <div className="max-w-3xl">
          <div className="rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100">
              <UserRound className="h-6 w-6 text-neutral-600" />
            </div>
            <h1 className="mt-6 text-2xl font-bold tracking-tight text-neutral-950">
              {L("Welcome", "স্বাগতম")}
              {firstName ? `, ${firstName}` : ""}!
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-neutral-600">
              {L(
                "Your account is ready, but it isn't linked to a client organisation yet. Once we link it, you'll see your projects, progress and support tickets here.",
                "আপনার অ্যাকাউন্ট তৈরি, তবে এখনো কোনো ক্লায়েন্ট প্রতিষ্ঠানের সঙ্গে যুক্ত হয়নি। যুক্ত হলে আপনার প্রজেক্ট, অগ্রগতি ও সাপোর্ট টিকেট এখানে দেখতে পাবেন।",
              )}
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/contact" className="inline-flex h-11 items-center justify-center rounded-full bg-neutral-950 px-5 text-sm font-semibold text-white hover:bg-neutral-800">
                {L("Request client access", "ক্লায়েন্ট অ্যাক্সেস চান")}
              </Link>
              <Link href="/profile" className="inline-flex h-11 items-center justify-center rounded-full border border-neutral-200 px-5 text-sm font-semibold text-neutral-800 hover:bg-neutral-50">
                {L("Complete your profile", "প্রোফাইল সম্পূর্ণ করুন")}
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const clientIds = memberships.map((m) => m.id);

  const [projects, tickets, [counts]] = await Promise.all([
    sql`
      select p.id, p.slug, ${tcol(locale, "p.title")} as title, ${tcol(locale, "p.short_description")} as short_description, p.status, p.progress_percent, p.cover_image_url,
             p.live_url, p.started_at, p.completed_at, c.name as client_name,
             (select count(*)::int from support_tickets t where t.project_id = p.id and t.status not in ('RESOLVED','CLOSED')) as open_tickets
      from projects p
      join clients c on c.id = p.client_id
      where p.client_id = any(${clientIds}::uuid[])
      order by (p.status = 'COMPLETED'), p.updated_at desc
    `,
    sql`
      select t.id, t.ticket_number, t.subject, t.status, t.priority, t.updated_at, ${tcol(locale, "p.title")} as project_title,
             (select count(*)::int from ticket_messages m where m.ticket_id = t.id) as message_count
      from support_tickets t
      left join projects p on p.id = t.project_id
      where t.client_id = any(${clientIds}::uuid[])
        and (${filter} = 'all'
          or (${filter} = 'active' and t.status not in ('RESOLVED', 'CLOSED'))
          or (${filter} = 'closed' and t.status in ('RESOLVED', 'CLOSED')))
      order by t.updated_at desc
      limit 25
    `,
    sql`
      select
        (select count(*)::int from projects where client_id = any(${clientIds}::uuid[]) and status <> 'COMPLETED') as active_projects,
        (select count(*)::int from projects where client_id = any(${clientIds}::uuid[]) and status = 'COMPLETED') as completed_projects,
        (select count(*)::int from support_tickets where client_id = any(${clientIds}::uuid[]) and status not in ('RESOLVED','CLOSED')) as open_tickets,
        (select count(*)::int from support_tickets where client_id = any(${clientIds}::uuid[]) and status = 'WAITING_FOR_CLIENT') as waiting
    `,
  ]);

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-0">
      <div>
        <AccountHeader
          title={L("Projects & tickets", "প্রজেক্ট ও টিকেট")}
          description={`${memberships.map((m) => m.name).join(" · ")} — ${L("track progress and get support in one place.", "এক জায়গায় অগ্রগতি দেখুন ও সাপোর্ট নিন।")}`}
          crumbs={[{ label: L("Client portal", "ক্লায়েন্ট পোর্টাল") }]}
          actions={
            <Link
              href="/client/tickets/new"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-neutral-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800"
            >
              <Plus className="h-4 w-4" /> {L("New ticket", "নতুন টিকেট")}
            </Link>
          }
        />

        {counts.waiting > 0 && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <MessageSquareText className="h-4 w-4 shrink-0" />
            {L(
              `${counts.waiting} ticket${counts.waiting === 1 ? " is" : "s are"} waiting for your reply.`,
              `${num(counts.waiting)}টি টিকেট আপনার উত্তরের অপেক্ষায় আছে।`,
            )}
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label={L("Active projects", "চলমান প্রজেক্ট")} value={num(counts.active_projects)} />
          <Stat label={L("Completed", "সম্পন্ন")} value={num(counts.completed_projects)} />
          <Stat label={L("Open tickets", "খোলা টিকেট")} value={num(counts.open_tickets)} />
          <Stat label={L("Unread updates", "না-পড়া আপডেট")} value={num(unread)} />
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 xl:grid-cols-[1fr_300px]">
          <div className="flex min-w-0 flex-col gap-10">
            {/* Projects */}
            <section>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-neutral-950">
                <FolderKanban className="h-5 w-5 text-neutral-400" /> {L("Projects", "প্রজেক্ট")}
              </h2>
              {projects.length === 0 ? (
                <Empty text={L("No projects yet. Once your project starts, its progress will appear here.", "এখনো কোনো প্রজেক্ট নেই। প্রজেক্ট শুরু হলে এর অগ্রগতি এখানে দেখা যাবে।")} />
              ) : (
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {projects.map((project) => (
                    <div key={project.id} className="flex flex-col rounded-3xl border border-neutral-200 bg-white p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate font-semibold text-neutral-950">{project.title}</h3>
                          {memberships.length > 1 && <p className="text-xs text-neutral-500">{project.client_name}</p>}
                        </div>
                        <StatusBadge map={PROJECT_STATUS} value={project.status} />
                      </div>
                      {project.short_description && (
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-600">{project.short_description}</p>
                      )}
                      <div className="mt-5">
                        <div className="mb-2 flex justify-between text-xs text-neutral-500">
                          <span>{L("Progress", "অগ্রগতি")}</span>
                          <span className="font-medium text-neutral-900">{num(project.progress_percent)}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                          <div className="h-full rounded-full bg-neutral-950 transition-all" style={{ width: `${project.progress_percent}%` }} />
                        </div>
                      </div>
                      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-4 text-xs">
                        <Link href={`/projects/${project.slug}`} className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1.5 font-medium text-neutral-700 hover:bg-neutral-200">
                          {L("Details", "বিস্তারিত")} <ArrowUpRight className="h-3 w-3" />
                        </Link>
                        {project.live_url && (
                          <a href={project.live_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1.5 font-medium text-neutral-700 hover:bg-neutral-200">
                            {L("Live site", "লাইভ সাইট")} <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        <Link href={`/client/tickets/new?project=${project.id}`} className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1.5 font-medium text-neutral-700 hover:bg-neutral-200">
                          <LifeBuoy className="h-3 w-3" /> {L("Get help", "সাহায্য নিন")}
                        </Link>
                        {project.open_tickets > 0 && (
                          <span className="ml-auto text-neutral-500">
                            {L(`${project.open_tickets} open ticket${project.open_tickets === 1 ? "" : "s"}`, `${num(project.open_tickets)}টি খোলা টিকেট`)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Tickets */}
            <section>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-neutral-950">
                  <LifeBuoy className="h-5 w-5 text-neutral-400" /> {L("Support tickets", "সাপোর্ট টিকেট")}
                </h2>
                <div className="flex rounded-full border border-neutral-200 bg-white p-1">
                  {TICKET_FILTERS.map((f) => (
                    <Link
                      key={f.value}
                      href={f.value === "active" ? "/client" : `/client?tickets=${f.value}`}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                        filter === f.value ? "bg-neutral-950 text-white" : "text-neutral-600 hover:text-neutral-950"
                      }`}
                    >
                      {L(f.label[0], f.label[1])}
                    </Link>
                  ))}
                </div>
              </div>
              {tickets.length === 0 ? (
                <Empty text={filter === "active" ? L("No open tickets — everything looks good.", "কোনো খোলা টিকেট নেই — সবকিছু ঠিক আছে।") : L("No tickets to show.", "দেখানোর মতো কোনো টিকেট নেই।")} />
              ) : (
                <div className="mt-4 flex flex-col gap-2">
                  {tickets.map((ticket) => (
                    <Link
                      key={ticket.id}
                      href={`/client/tickets/${ticket.id}`}
                      className="group flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4 transition hover:border-neutral-300 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="text-xs text-neutral-500">
                          #{num(ticket.ticket_number)}
                          {ticket.project_title ? ` · ${ticket.project_title}` : ""}
                        </p>
                        <p className="mt-0.5 truncate font-medium text-neutral-950 group-hover:underline">{ticket.subject}</p>
                        <p className="mt-1 text-xs text-neutral-500">
                          <span className={TICKET_PRIORITY[ticket.priority]?.className}>{statusLabel(TICKET_PRIORITY, ticket.priority, locale)}</span>
                          {" · "}
                          {L(
                            `${ticket.message_count} message${ticket.message_count === 1 ? "" : "s"} · updated ${formatDate(ticket.updated_at)}`,
                            `${num(ticket.message_count)}টি বার্তা · আপডেট ${formatDate(ticket.updated_at, false, locale)}`,
                          )}
                        </p>
                      </div>
                      <StatusBadge map={TICKET_STATUS} value={ticket.status} />
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-4">
            <div className="rounded-3xl border border-neutral-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-neutral-950">
                  <Bell className="h-4 w-4 text-neutral-400" /> {L("Recent updates", "সাম্প্রতিক আপডেট")}
                </h2>
                <Link href="/notifications" className="text-xs font-medium text-neutral-500 hover:text-neutral-950">
                  {L("View all", "সব দেখুন")}
                </Link>
              </div>
              {notifications.length === 0 ? (
                <p className="mt-4 text-sm text-neutral-500">{L("No updates yet.", "এখনো কোনো আপডেট নেই।")}</p>
              ) : (
                <ul className="mt-4 flex flex-col gap-1">
                  {notifications.map((n) => (
                    <li key={n.id}>
                      <Link href={n.link || "/notifications"} className="flex gap-3 rounded-xl p-2 transition hover:bg-neutral-50">
                        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read_at ? "bg-neutral-200" : "bg-blue-500"}`} />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-neutral-900">{n.title}</span>
                          <span className="block text-xs text-neutral-500">{formatDate(n.created_at, true, locale)}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-neutral-950">{L("Your account", "আপনার অ্যাকাউন্ট")}</h2>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-neutral-100 text-sm font-semibold text-neutral-700">
                  {user.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    (user.fullName || user.email).slice(0, 1).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-neutral-900">{user.fullName || L("Add your name", "আপনার নাম যোগ করুন")}</p>
                  <p className="truncate text-xs text-neutral-500">{user.email}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link href="/profile" className="rounded-xl border border-neutral-200 px-3 py-2 text-center text-xs font-medium text-neutral-700 hover:bg-neutral-50">
                  {L("Profile", "প্রোফাইল")}
                </Link>
                <Link href="/settings" className="rounded-xl border border-neutral-200 px-3 py-2 text-center text-xs font-medium text-neutral-700 hover:bg-neutral-50">
                  {L("Settings", "সেটিংস")}
                </Link>
              </div>
            </div>

            <div className="rounded-3xl bg-neutral-950 p-5 text-white">
              <h2 className="text-sm font-semibold">{L("Need something new?", "নতুন কিছু দরকার?")}</h2>
              <p className="mt-1 text-sm leading-6 text-neutral-400">{L("New feature, redesign or another site — tell us about it.", "নতুন ফিচার, রিডিজাইন বা আরেকটি সাইট — আমাদের জানান।")}</p>
              <Link href="/contact" className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-xs font-semibold text-neutral-950 hover:bg-neutral-200">
                {L("Start a new project", "নতুন প্রজেক্ট শুরু করুন")}
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5">
      <p className="text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">{value}</p>
      <p className="mt-0.5 text-xs text-neutral-500">{label}</p>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="mt-4 rounded-3xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500">{text}</div>;
}
