import type { Metadata } from "next";
import Link from "@/app/components/locale-link";
import { ArrowUpRight, Bell, CheckCircle2, Circle, FolderKanban, Heart, LifeBuoy, MessageCircle, Newspaper, ReceiptText, Settings, ShieldCheck, UserRound } from "lucide-react";

import AccountHeader from "@/app/components/account-header";
import { PROJECT_STATUS, StatusBadge, TICKET_STATUS, formatDate } from "@/app/components/marketing";
import { getClientMemberships, requireUser } from "@/lib/auth/session";
import { sql } from "@/lib/db";
import { localizeNotification } from "@/lib/notifications-i18n";
import { timeAgo as timeAgoLocale } from "@/lib/i18n/config";
import { getI18n, msg } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await msg("My account — Nirdeshona Web", "আমার অ্যাকাউন্ট — নির্দেশনা ওয়েব"), robots: { index: false } };
}

export default async function AccountPage() {
  const user = await requireUser("/account");
  const { L, locale, num, stat, digits } = await getI18n();
  const timeAgo = (value: string) => timeAgoLocale(value, locale);
  const memberships = await getClientMemberships(user.id);
  const clientIds = memberships.map((m) => m.id);

  // Quote requests (migration 0011) — tolerate the table being absent.
  const quotes = (await sql`
    select reference, plan, estimate_low, estimate_high, monthly, status, created_at
    from quote_requests
    where user_id = ${user.id} or lower(email) = lower(${user.email})
    order by created_at desc limit 3
  `.catch(() => [])) as unknown as { reference: string; plan: string; estimate_low: number; estimate_high: number; monthly: number; status: string; created_at: string }[];
  const QUOTE_STATUS: Record<string, [string, string]> = {
    new: ["Received", "গৃহীত"],
    contacted: ["We've been in touch", "যোগাযোগ করা হয়েছে"],
    quoted: ["Quote sent", "কোটেশন পাঠানো হয়েছে"],
    accepted: ["Accepted", "গৃহীত ও চূড়ান্ত"],
    declined: ["Closed", "বন্ধ"],
  };
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
    { done: Boolean(user.fullName), label: L("Add your name", "আপনার নাম যোগ করুন"), href: "/profile" },
    { done: Boolean(user.avatarUrl), label: L("Upload a profile photo", "প্রোফাইল ছবি আপলোড করুন"), href: "/profile" },
    { done: Boolean(user.phone), label: L("Add a phone number", "ফোন নম্বর যোগ করুন"), href: "/profile" },
    { done: Boolean(user.company), label: L("Add your organisation", "আপনার প্রতিষ্ঠান যোগ করুন"), href: "/profile" },
    { done: Boolean(bio), label: L("Write a short bio", "সংক্ষিপ্ত পরিচিতি লিখুন"), href: "/profile" },
  ];
  const completeness = Math.round((checklist.filter((c) => c.done).length / checklist.length) * 100);
  const firstName = user.fullName?.split(" ")[0];
  const hour = Number(new Date().toLocaleString("en-GB", { hour: "numeric", hour12: false, timeZone: "Asia/Dhaka" }));
  const greeting =
    hour < 12 ? L("Good morning", "শুভ সকাল") : hour < 17 ? L("Good afternoon", "শুভ অপরাহ্ন") : L("Good evening", "শুভ সন্ধ্যা");

  return (
    <div className="flex flex-col gap-8 px-4 py-8 sm:px-6 lg:px-0">
      <AccountHeader title={`${greeting}${firstName ? `, ${firstName}` : ""}`} description={L("Here's what's happening with your account.", "আপনার অ্যাকাউন্টের সর্বশেষ অবস্থা এখানে।")} />

      {/* Identity card */}
      <div className="theme-fixed relative overflow-hidden rounded-3xl bg-neutral-950 p-6 text-white sm:p-8">
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
              <p className="truncate text-lg font-semibold">{user.fullName || L("Add your name", "আপনার নাম যোগ করুন")}</p>
              <p className="truncate text-sm text-neutral-400">{user.email}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium capitalize">{user.role === "ADMIN" ? L("admin", "অ্যাডমিন") : L("member", "সদস্য")}</span>
                {memberships.map((m) => (
                  <span key={m.id} className="rounded-full bg-emerald-400/15 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300">
                    {m.name}
                  </span>
                ))}
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] text-neutral-300">{L("Joined", "যোগদান")} {formatDate(user.createdAt, false, locale)}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/profile" className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-neutral-950 hover:bg-neutral-200">
              <UserRound className="h-4 w-4" /> {L("Edit profile", "প্রোফাইল এডিট")}
            </Link>
            <Link href="/settings" className="inline-flex h-10 items-center gap-2 rounded-full border border-white/15 px-4 text-sm font-semibold hover:bg-white/10">
              <Settings className="h-4 w-4" /> <span className="hidden sm:inline">{L("Settings", "সেটিংস")}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={<MessageCircle className="h-4 w-4" />} label={L("Comments", "মন্তব্য")} value={stat(stats.comments)} />
        <Stat icon={<Heart className="h-4 w-4" />} label={L("Likes received", "পাওয়া লাইক")} value={stat(stats.likes_received)} />
        <Stat icon={<Bell className="h-4 w-4" />} label={L("Unread updates", "না-পড়া আপডেট")} value={stat(stats.unread)} href="/notifications" />
        {clientIds.length ? (
          <Stat icon={<LifeBuoy className="h-4 w-4" />} label={L("Open tickets", "খোলা টিকেট")} value={stat(stats.open_tickets)} href="/client" />
        ) : (
          <Stat icon={<Newspaper className="h-4 w-4" />} label={L("Reactions given", "দেওয়া রিঅ্যাকশন")} value={stat(stats.reactions)} />
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
        <div className="flex min-w-0 flex-col gap-6">
          {/* Client portal summary */}
          {clientIds.length > 0 ? (
            <Card
              title={L("Client portal", "ক্লায়েন্ট পোর্টাল")}
              icon={<FolderKanban className="h-4 w-4" />}
              action={<Link href="/client" className="text-xs font-semibold text-neutral-500 hover:text-neutral-950">{L("Open portal →", "পোর্টাল খুলুন →")}</Link>}
            >
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">{L("Projects", "প্রজেক্ট")}</p>
                  {projects.length === 0 && <p className="text-sm text-neutral-500">{L("No projects yet.", "এখনো কোনো প্রজেক্ট নেই।")}</p>}
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
                  <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">{L("Recent tickets", "সাম্প্রতিক টিকেট")}</p>
                  {tickets.length === 0 && <p className="text-sm text-neutral-500">{L("No tickets yet.", "এখনো কোনো টিকেট নেই।")}</p>}
                  {tickets.map((t) => (
                    <Link key={t.id} href={`/client/tickets/${t.id}`} className="flex items-center justify-between gap-2 rounded-2xl border border-neutral-100 p-3 transition hover:border-neutral-200 hover:bg-neutral-50">
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{t.subject}</span>
                        <span className="text-xs text-neutral-500">#{digits(t.ticket_number)} · {timeAgo(t.updated_at)}</span>
                      </span>
                      <StatusBadge map={TICKET_STATUS} value={t.status} />
                    </Link>
                  ))}
                  <Link href="/client/tickets/new" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-dashed border-neutral-300 p-3 text-sm font-medium text-neutral-600 hover:bg-neutral-50">
                    <LifeBuoy className="h-4 w-4" /> {L("Open a new ticket", "নতুন টিকেট খুলুন")}
                  </Link>
                </div>
              </div>
            </Card>
          ) : (
            <div className="flex flex-col gap-4 rounded-3xl border border-neutral-200 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-neutral-950">{L("Working with us on a project?", "আমাদের সঙ্গে কোনো প্রজেক্টে কাজ করছেন?")}</p>
                <p className="mt-1 text-sm text-neutral-600">
                  {L(
                    "Ask us to link your account to see progress, open tickets and share files.",
                    "অগ্রগতি দেখা, টিকেট খোলা ও ফাইল শেয়ার করতে আপনার অ্যাকাউন্ট যুক্ত করার অনুরোধ করুন।",
                  )}
                </p>
              </div>
              <Link href="/contact?service=Not%20sure%20yet" className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-neutral-950 px-4 text-sm font-semibold text-white hover:bg-neutral-800">
                {L("Request client access", "ক্লায়েন্ট অ্যাক্সেস চান")}
              </Link>
            </div>
          )}

          {quotes.length > 0 && (
            <Card
              title={L("My quote requests", "আমার কোটেশন অনুরোধ")}
              icon={<ReceiptText className="h-4 w-4" />}
              action={<Link href="/pricing#order" className="text-xs font-semibold text-neutral-500 hover:text-neutral-950">{L("New request →", "নতুন অনুরোধ →")}</Link>}
            >
              <ul className="flex flex-col divide-y divide-neutral-100">
                {quotes.map((q) => (
                  <li key={q.reference} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="font-mono text-sm font-semibold text-neutral-950">{q.reference}</p>
                      <p className="text-xs text-neutral-500">
                        {q.plan === "care"
                          ? L(`৳${q.monthly.toLocaleString("en-IN")}/month`, `মাসে ৳${num(q.monthly)}`)
                          : `৳${num(q.estimate_low)} – ৳${num(q.estimate_high)}`}{" "}
                        · {timeAgo(q.created_at)}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-semibold text-neutral-700">
                      {L(...(QUOTE_STATUS[q.status] ?? [q.status, q.status]))}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* My comments */}
          <Card title={L("My recent comments", "আমার সাম্প্রতিক মন্তব্য")} icon={<MessageCircle className="h-4 w-4" />} action={<Link href="/blog" className="text-xs font-semibold text-neutral-500 hover:text-neutral-950">{L("Read the blog →", "ব্লগ পড়ুন →")}</Link>}>
            {myComments.length === 0 ? (
              <p className="text-sm text-neutral-500">
                {L("You haven't commented yet. Join the conversation on the blog.", "আপনি এখনো কোনো মন্তব্য করেননি। ব্লগের আলোচনায় যোগ দিন।")}
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {myComments.map((c) => (
                  <li key={c.id}>
                    <Link href={`/blog/${c.slug}#comment-${c.id}`} className="group block rounded-2xl border border-neutral-100 p-4 transition hover:border-neutral-200 hover:bg-neutral-50">
                      <p className="text-xs text-neutral-500">
                        {L(
                          <>
                            {c.parent_id ? "Replied on" : "Commented on"} <span className="font-medium text-neutral-800">{c.title}</span>
                          </>,
                          <>
                            <span className="font-medium text-neutral-800">{c.title}</span> লেখায় {c.parent_id ? "উত্তর দিয়েছেন" : "মন্তব্য করেছেন"}
                          </>,
                        )}{" "}
                        · {timeAgo(c.created_at)}
                      </p>
                      <p className="mt-1.5 line-clamp-2 text-sm text-neutral-700">{c.content}</p>
                      <p className="mt-2 flex items-center gap-3 text-xs text-neutral-500">
                        <span>👍 {stat(c.likes)}</span>
                        {!c.parent_id && <span className="inline-flex items-center gap-1"><MessageCircle className="h-3 w-3" /> {stat(c.replies)} {L(c.replies === 1 ? "reply" : "replies", "উত্তর")}</span>}
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
            <Card title={L("Complete your profile", "প্রোফাইল সম্পূর্ণ করুন")} icon={<UserRound className="h-4 w-4" />}>
              <div className="mb-3 flex justify-between text-xs text-neutral-500">
                <span>{L(`${completeness}% complete`, `${stat(completeness)}% সম্পূর্ণ`)}</span>
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

          <Card title={L("Notifications", "নোটিফিকেশন")} icon={<Bell className="h-4 w-4" />} action={<Link href="/notifications" className="text-xs font-semibold text-neutral-500 hover:text-neutral-950">{L("All →", "সব →")}</Link>}>
            {notifications.length === 0 ? (
              <p className="text-sm text-neutral-500">{L("No updates yet.", "এখনো কোনো আপডেট নেই।")}</p>
            ) : (
              <ul className="flex flex-col gap-1">
                {notifications.map((n) => (
                  <li key={n.id}>
                    <Link href={n.link || "/notifications"} className="flex gap-2.5 rounded-xl p-2 transition hover:bg-neutral-50">
                      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read_at ? "bg-neutral-200" : "bg-blue-500"}`} />
                      <span className="min-w-0">
                        <span className="block truncate text-sm text-neutral-800">{localizeNotification({ title: n.title as string, message: null }, locale).title}</span>
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
                <span className="block text-sm font-semibold text-neutral-950">{L("Admin panel", "অ্যাডমিন প্যানেল")}</span>
                <span className="text-xs text-neutral-500">{L("Manage content, clients and users", "কনটেন্ট, ক্লায়েন্ট ও ইউজার পরিচালনা")}</span>
              </span>
            </Link>
          )}
        </aside>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href?: string }) {
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
