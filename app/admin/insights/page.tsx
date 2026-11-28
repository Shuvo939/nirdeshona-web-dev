import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { AdminHeader, FilterTabs } from "@/app/admin/admin-ui";
import { PLAN_NAMES, QUOTE_STATUSES, serviceName, taka } from "@/app/admin/quotes/shared";
import ReactionIcon from "@/app/components/blog/reaction-icon";
import { REACTION_META, REACTION_ORDER } from "@/app/components/blog/reaction-meta";
import { requireAdmin } from "@/lib/auth/require-admin";
import type { ReactionType } from "@/lib/comments";
import { sql } from "@/lib/db";

import { DailyBars } from "./charts";

export const metadata: Metadata = { title: "Insights — Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

const RANGES = [7, 30, 90] as const;
type Row = Record<string, unknown>;
const n = (v: unknown) => Number(v ?? 0);
const fmt = (v: unknown) => n(v).toLocaleString("en-US");

// Today in Dhaka, as a SQL date expression.
const today = () => sql`(now() at time zone 'Asia/Dhaka')::date`;

/**
 * Runs queries a few at a time instead of all at once, so this page never
 * takes over the connection pool the public site depends on.
 */
async function inBatches(tasks: (() => PromiseLike<unknown>)[], size = 4) {
  const out: unknown[] = [];
  for (let i = 0; i < tasks.length; i += size) {
    out.push(...(await Promise.all(tasks.slice(i, i + size).map((t) => t()))));
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return out as any[];
}

/** Count rows of `table` in this period and the one before it. */
function periodCount(table: string, column: string, days: number, where = sql``) {
  return sql`
    select
      count(*) filter (where ${sql(column)} > now() - make_interval(days => ${days}::int))::int as cur,
      count(*) filter (where ${sql(column)} <= now() - make_interval(days => ${days}::int)
                         and ${sql(column)} > now() - make_interval(days => ${days * 2}::int))::int as prev
    from ${sql(table)} where true ${where}
  `;
}

export default async function InsightsPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  await requireAdmin();
  const { range } = await searchParams;
  const days = RANGES.find((r) => String(r) === range) ?? 30;

  const [
    [views],
    [readers],
    [signups],
    [active],
    [comments],
    [postReacts],
    [commentReacts],
    [quotes],
    [contacts],
    daily,
    topPosts,
    reactionMix,
    quoteStatus,
    quotePlans,
    quoteServices,
    [quoteMeta],
    contactBreakdown,
    ticketStatus,
    [ticketTiming],
    roles,
    [userMeta],
    topCommenters,
    storage,
    [projectMedia],
    categories,
    postStatus,
    security,
    [moderation],
    adminActivity,
  ] = await inBatches([
    () => sql`
      select
        coalesce(sum(views) filter (where day > ${today()} - ${days}::int), 0)::int as cur,
        coalesce(sum(views) filter (where day <= ${today()} - ${days}::int and day > ${today()} - ${days * 2}::int), 0)::int as prev
      from post_views_daily
    `,
    () => periodCount("post_view_tracking", "last_viewed_at", days),
    () => periodCount("profiles", "created_at", days),
    () => periodCount("profiles", "last_seen_at", days),
    () => periodCount("comments", "created_at", days),
    () => periodCount("post_reactions", "created_at", days),
    () => periodCount("comment_likes", "created_at", days),
    () => periodCount("quote_requests", "created_at", days),
    () => periodCount("contact_requests", "created_at", days),
    () => sql`
      select d::date::text as day,
        coalesce((select sum(v.views) from post_views_daily v where v.day = d::date), 0)::int as views,
        (select count(*) from profiles p where (p.created_at at time zone 'Asia/Dhaka')::date = d::date)::int as signups,
        ((select count(*) from comments c where (c.created_at at time zone 'Asia/Dhaka')::date = d::date)
          + (select count(*) from post_reactions r where (r.created_at at time zone 'Asia/Dhaka')::date = d::date)
          + (select count(*) from comment_likes l where (l.created_at at time zone 'Asia/Dhaka')::date = d::date))::int as engagement
      from generate_series(${today()} - ${days - 1}::int, ${today()}, interval '1 day') d
      order by d
    `,
    () => sql`
      select p.slug, p.title, coalesce(v.views, 0)::int as views, p.views_count::int as total_views,
        (select count(*) from post_view_tracking t where t.post_id = p.id)::int as readers,
        (select count(*) from post_reactions r where r.post_id = p.id)::int as reactions,
        (select count(*) from comments c where c.post_id = p.id and c.status = 'visible')::int as comments
      from posts p
      left join (select post_id, sum(views)::int as views from post_views_daily where day > ${today()} - ${days}::int group by 1) v on v.post_id = p.id
      where p.status = 'published'
      order by coalesce(v.views, 0) desc, p.views_count desc
      limit 8
    `,
    () => sql`
      select reaction_type, sum(n)::int as n from (
        select reaction_type, count(*) as n from post_reactions group by 1
        union all
        select reaction_type, count(*) as n from comment_likes group by 1
      ) x group by 1
    `,
    () => sql`
      select status, count(*)::int as n, coalesce(sum(estimate_low), 0)::bigint as low,
             coalesce(sum(estimate_high), 0)::bigint as high, coalesce(sum(monthly), 0)::bigint as monthly
      from quote_requests group by 1
    `,
    () => sql`select plan, count(*)::int as n from quote_requests group by 1 order by 2 desc`,
    () => sql`select service, count(*)::int as n from quote_requests group by 1 order by 2 desc limit 6`,
    () => sql`
      select
        count(*) filter (where locale = 'bn')::int as bn,
        count(*) filter (where locale = 'en')::int as en,
        count(*) filter (where user_id is not null)::int as signed_in,
        count(*)::int as total
      from quote_requests
    `,
    () => sql`
      select 'status' as kind, coalesce(status, 'new') as key, count(*)::int as n from contact_requests group by 2
      union all
      select 'service', coalesce(nullif(service, ''), '—'), count(*)::int from contact_requests group by 2
      union all
      select 'budget', coalesce(nullif(budget, ''), '—'), count(*)::int from contact_requests group by 2
      union all
      select 'method', coalesce(nullif(preferred_contact_method, ''), '—'), count(*)::int from contact_requests group by 2
    `,
    () => sql`select status::text, priority::text, count(*)::int as n from support_tickets group by 1, 2`,
    () => sql`
      select
        (select avg(extract(epoch from (fr.first_at - t.created_at))) / 3600
           from support_tickets t
           join lateral (
             select min(m.created_at) as first_at from ticket_messages m
             join profiles pr on pr.id = m.sender_id
             where m.ticket_id = t.id and pr.role = 'ADMIN'
           ) fr on fr.first_at is not null
           where t.created_at > now() - interval '90 days') as first_response_h,
        (select avg(extract(epoch from (updated_at - created_at))) / 3600
           from support_tickets where status in ('RESOLVED', 'CLOSED') and created_at > now() - interval '90 days') as resolve_h
    `,
    () => sql`select role::text, count(*)::int as n from profiles group by 1`,
    () => sql`
      select
        count(*)::int as total,
        count(*) filter (where is_banned)::int as banned,
        count(*) filter (where last_seen_at > now() - interval '1 day')::int as d1,
        count(*) filter (where last_seen_at > now() - interval '7 days')::int as d7,
        count(*) filter (where avatar_url is not null)::int as with_avatar,
        count(*) filter (where phone is not null and phone <> '')::int as with_phone
      from profiles
    `,
    () => sql`
      select pr.full_name, count(*)::int as n
      from comments c join profiles pr on pr.id = c.user_id
      where c.created_at > now() - make_interval(days => ${days}::int)
      group by 1 order by 2 desc limit 5
    `,
    () => sql`
      select split_part(coalesce(mime_type, 'other/unknown'), '/', 1) as kind, count(*)::int as n, coalesce(sum(file_size), 0)::bigint as bytes
      from files group by 1 order by 3 desc
    `,
    () => sql`select count(*)::int as n from project_media`,
    () => sql`
      select pc.name, count(p.id)::int as posts, coalesce(sum(p.views_count), 0)::int as views
      from post_categories pc left join posts p on p.category_id = pc.id and p.status = 'published'
      group by pc.id, pc.name order by 3 desc
    `,
    () => sql`select status, count(*)::int as n from posts group by 1`,
    () => sql`
      select bucket, count(*)::int as hits, count(distinct key)::int as sources
      from rate_limit_hits where created_at > now() - interval '48 hours'
      group by 1 order by 2 desc
    `,
    () => sql`
      select
        (select count(*) from comment_reports where resolved_at is null)::int as open_reports,
        (select count(*) from comments where status <> 'visible')::int as hidden_comments,
        (select count(*) from captcha_used where used_at > now() - interval '24 hours')::int as captcha_24h
    `,
    () => sql`
      select coalesce(p.full_name, 'System') as name, count(*)::int as n
      from activity_log a left join profiles p on p.id = a.actor_id
      where a.created_at > now() - make_interval(days => ${days}::int)
      group by 1 order by 2 desc limit 6
    `,
  ]);

  const reactionsCur = n(postReacts.cur) + n(commentReacts.cur);
  const reactionsPrev = n(postReacts.prev) + n(commentReacts.prev);
  const engagementRate = n(views.cur) ? ((n(comments.cur) + reactionsCur) / n(views.cur)) * 100 : 0;

  const qs = Object.fromEntries((quoteStatus as Row[]).map((r) => [String(r.status), r]));
  const quoteTotal = (quoteStatus as Row[]).reduce((a, r) => a + n(r.n), 0);
  const openStatuses = ["new", "contacted", "quoted"];
  const pipeLow = openStatuses.reduce((a, s) => a + n(qs[s]?.low), 0);
  const pipeHigh = openStatuses.reduce((a, s) => a + n(qs[s]?.high), 0);
  const decided = n(qs.accepted?.n) + n(qs.declined?.n);
  const winRate = decided ? (n(qs.accepted?.n) / decided) * 100 : null;

  const contactBy = (kind: string) => (contactBreakdown as Row[]).filter((r) => r.kind === kind).sort((a, b) => n(b.n) - n(a.n));
  const ticketsOpen = (ticketStatus as Row[]).filter((r) => ["OPEN", "IN_PROGRESS", "WAITING_FOR_CLIENT"].includes(String(r.status)));
  const byPriority = ["URGENT", "HIGH", "NORMAL", "LOW"].map((p) => ({ label: p.charAt(0) + p.slice(1).toLowerCase(), value: ticketsOpen.filter((r) => r.priority === p).reduce((a, r) => a + n(r.n), 0) }));
  const byTicketStatus = ["OPEN", "IN_PROGRESS", "WAITING_FOR_CLIENT", "RESOLVED", "CLOSED"].map((s) => ({
    label: s.replace(/_/g, " ").toLowerCase().replace(/^./, (c) => c.toUpperCase()),
    value: (ticketStatus as Row[]).filter((r) => r.status === s).reduce((a, r) => a + n(r.n), 0),
  }));
  const reactionCounts = Object.fromEntries((reactionMix as Row[]).map((r) => [String(r.reaction_type), n(r.n)]));
  const reactionTotal = Object.values(reactionCounts).reduce((a, b) => a + b, 0);
  const storageBytes = (storage as Row[]).reduce((a, r) => a + n(r.bytes), 0);

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Insights"
        description={`Readers, engagement, sales pipeline and support — last ${days} days compared with the ${days} days before.`}
      />
      <FilterTabs active={String(days)} tabs={RANGES.map((r) => ({ value: String(r), label: `${r} days`, href: `/admin/insights?range=${r}` }))} />

      {/* ---------- headline numbers ---------- */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Post views" cur={n(views.cur)} prev={n(views.prev)} />
        <Kpi label="Readers" hint="unique visitors who read a post" cur={n(readers.cur)} prev={n(readers.prev)} />
        <Kpi label="Reactions" cur={reactionsCur} prev={reactionsPrev} />
        <Kpi label="Comments" cur={n(comments.cur)} prev={n(comments.prev)} />
        <Kpi label="New sign-ups" cur={n(signups.cur)} prev={n(signups.prev)} />
        <Kpi label="Active users" hint="seen on the site" cur={n(active.cur)} prev={n(active.prev)} />
        <Kpi label="Quote requests" cur={n(quotes.cur)} prev={n(quotes.prev)} href="/admin/quotes" />
        <Kpi label="Contact requests" cur={n(contacts.cur)} prev={n(contacts.prev)} href="/admin/contacts" />
      </div>

      {/* ---------- over time ---------- */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Post views per day" className="lg:col-span-2">
          <DailyBars data={(daily as Row[]).map((d) => ({ day: String(d.day), value: n(d.views) }))} unit="views" height={170} />
        </Card>
        <Card title="Engagement rate" subtitle="reactions + comments per 100 views">
          <p className="text-4xl font-bold tracking-tight text-neutral-950">{engagementRate.toFixed(1)}</p>
          <p className="mt-1 text-sm text-neutral-500">
            {fmt(reactionsCur + n(comments.cur))} interactions on {fmt(views.cur)} views
          </p>
          <div className="mt-5 border-t border-neutral-100 pt-4">
            <p className="mb-2 text-xs font-medium text-neutral-500">Reaction mix (all time)</p>
            <div className="space-y-2">
              {REACTION_ORDER.map((r) => (
                <div key={r} className="flex items-center gap-2 text-sm">
                  <ReactionIcon type={r as ReactionType} size={18} />
                  <span className="w-20 text-neutral-700">{REACTION_META[r as ReactionType].label}</span>
                  <Bar value={reactionCounts[r] ?? 0} max={Math.max(1, ...Object.values(reactionCounts))} />
                  <span className="w-14 text-right tabular-nums text-neutral-950">
                    {reactionTotal ? Math.round(((reactionCounts[r] ?? 0) / reactionTotal) * 100) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
        <Card title="Interactions per day" subtitle="reactions + comments">
          <DailyBars data={(daily as Row[]).map((d) => ({ day: String(d.day), value: n(d.engagement) }))} unit="interactions" height={110} />
        </Card>
        <Card title="Sign-ups per day">
          <DailyBars data={(daily as Row[]).map((d) => ({ day: String(d.day), value: n(d.signups) }))} unit="sign-ups" height={110} />
        </Card>
        <Card title="Users">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <Fact label="Total accounts" value={fmt(userMeta.total)} />
            <Fact label="Active today" value={fmt(userMeta.d1)} />
            <Fact label="Active this week" value={fmt(userMeta.d7)} />
            <Fact label="Banned" value={fmt(userMeta.banned)} />
            <Fact label="With photo" value={pct(userMeta.with_avatar, userMeta.total)} />
            <Fact label="With phone" value={pct(userMeta.with_phone, userMeta.total)} />
          </dl>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {(roles as Row[]).map((r) => (
              <span key={String(r.role)} className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700">
                {String(r.role).charAt(0) + String(r.role).slice(1).toLowerCase()} · {fmt(r.n)}
              </span>
            ))}
          </div>
        </Card>
      </div>

      {/* ---------- content ---------- */}
      <Card title={`Top posts — last ${days} days`} subtitle="ranked by views in this period">
        <div className="-mx-5 overflow-x-auto sm:mx-0">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-neutral-100 text-left text-xs text-neutral-500">
                <th className="px-5 py-2 font-medium sm:pl-0">Post</th>
                <th className="px-2 py-2 text-right font-medium">Views</th>
                <th className="px-2 py-2 text-right font-medium">All-time</th>
                <th className="px-2 py-2 text-right font-medium">Readers</th>
                <th className="px-2 py-2 text-right font-medium">Reactions</th>
                <th className="px-5 py-2 text-right font-medium sm:pr-0">Comments</th>
              </tr>
            </thead>
            <tbody>
              {(topPosts as Row[]).map((p) => (
                <tr key={String(p.slug)} className="border-b border-neutral-100 last:border-0">
                  <td className="max-w-[260px] truncate px-5 py-2.5 sm:pl-0">
                    <Link href={`/blog/${p.slug}`} className="font-medium text-neutral-950 hover:underline">
                      {String(p.title)}
                    </Link>
                  </td>
                  <td className="px-2 py-2.5 text-right font-semibold tabular-nums text-neutral-950">{fmt(p.views)}</td>
                  <td className="px-2 py-2.5 text-right tabular-nums text-neutral-600">{fmt(p.total_views)}</td>
                  <td className="px-2 py-2.5 text-right tabular-nums text-neutral-600">{fmt(p.readers)}</td>
                  <td className="px-2 py-2.5 text-right tabular-nums text-neutral-600">{fmt(p.reactions)}</td>
                  <td className="px-5 py-2.5 text-right tabular-nums text-neutral-600 sm:pr-0">{fmt(p.comments)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Categories" subtitle="published posts · all-time views">
          <BarList rows={(categories as Row[]).map((c) => ({ label: `${c.name} (${fmt(c.posts)})`, value: n(c.views) }))} />
        </Card>
        <Card title="Posts by status">
          <BarList rows={(postStatus as Row[]).map((r) => ({ label: cap(String(r.status)), value: n(r.n) }))} />
        </Card>
        <Card title="Most active commenters" subtitle={`last ${days} days`}>
          {(topCommenters as Row[]).length ? (
            <BarList rows={(topCommenters as Row[]).map((r) => ({ label: String(r.full_name ?? "Member"), value: n(r.n) }))} />
          ) : (
            <Empty>No comments in this period.</Empty>
          )}
        </Card>
      </div>

      {/* ---------- sales ---------- */}
      <h2 className="pt-2 text-lg font-semibold tracking-tight text-neutral-950">Sales pipeline</h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Open pipeline" value={pipeLow ? `${taka(pipeLow)}–${taka(pipeHigh)}` : "—"} hint="new + contacted + quoted" />
        <Stat label="Accepted value" value={n(qs.accepted?.low) ? `${taka(n(qs.accepted?.low))}–${taka(n(qs.accepted?.high))}` : "—"} hint={`${fmt(qs.accepted?.n)} accepted`} />
        <Stat label="Recurring (accepted)" value={n(qs.accepted?.monthly) ? `${taka(n(qs.accepted?.monthly))}/mo` : "—"} hint="care plans & social" />
        <Stat label="Win rate" value={winRate === null ? "—" : `${winRate.toFixed(0)}%`} hint={`${fmt(decided)} decided`} />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Quote funnel" subtitle={`${fmt(quoteTotal)} requests all-time`}>
          <BarList rows={QUOTE_STATUSES.map((s) => ({ label: s.label, value: n(qs[s.value]?.n) }))} />
        </Card>
        <Card title="Requested plans">
          <BarList rows={(quotePlans as Row[]).map((r) => ({ label: PLAN_NAMES[String(r.plan)] ?? String(r.plan), value: n(r.n) }))} />
        </Card>
        <Card title="Requested services">
          <BarList rows={(quoteServices as Row[]).map((r) => ({ label: r.service ? serviceName(String(r.service)) : "—", value: n(r.n) }))} />
          <div className="mt-4 flex flex-wrap gap-1.5 border-t border-neutral-100 pt-3 text-xs text-neutral-600">
            <span className="rounded-full bg-neutral-100 px-2.5 py-1">Bangla · {pct(quoteMeta.bn, quoteMeta.total)}</span>
            <span className="rounded-full bg-neutral-100 px-2.5 py-1">English · {pct(quoteMeta.en, quoteMeta.total)}</span>
            <span className="rounded-full bg-neutral-100 px-2.5 py-1">Signed in · {pct(quoteMeta.signed_in, quoteMeta.total)}</span>
          </div>
        </Card>
        <Card title="Contact requests by status">
          <BarList rows={contactBy("status").map((r) => ({ label: cap(String(r.key)), value: n(r.n) }))} />
        </Card>
        <Card title="Contact: services asked about">
          <BarList rows={contactBy("service").slice(0, 6).map((r) => ({ label: String(r.key), value: n(r.n) }))} />
        </Card>
        <Card title="Contact: budgets & channel">
          <BarList rows={contactBy("budget").slice(0, 5).map((r) => ({ label: String(r.key), value: n(r.n) }))} />
          <div className="mt-4 flex flex-wrap gap-1.5 border-t border-neutral-100 pt-3 text-xs text-neutral-600">
            {contactBy("method").map((r) => (
              <span key={String(r.key)} className="rounded-full bg-neutral-100 px-2.5 py-1">
                {cap(String(r.key))} · {fmt(r.n)}
              </span>
            ))}
          </div>
        </Card>
      </div>

      {/* ---------- support & operations ---------- */}
      <h2 className="pt-2 text-lg font-semibold tracking-tight text-neutral-950">Support & operations</h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="First reply time" value={hours(ticketTiming.first_response_h)} hint="avg, tickets of last 90 days" />
        <Stat label="Time to resolve" value={hours(ticketTiming.resolve_h)} hint="avg, resolved / closed" />
        <Stat label="Files on R2" value={fmt(storage.reduce((a: number, r: Row) => a + n(r.n), 0))} hint={`${bytes(storageBytes)} · ${fmt(projectMedia.n)} project images`} />
        <Stat label="Moderation" value={fmt(moderation.open_reports)} hint={`open reports · ${fmt(moderation.hidden_comments)} hidden comments`} href="/admin/comments" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Tickets by status">
          <BarList rows={byTicketStatus} />
        </Card>
        <Card title="Open tickets by priority">
          {byPriority.some((r) => r.value) ? <BarList rows={byPriority} /> : <Empty>No open tickets. 🎉</Empty>}
        </Card>
        <Card title="Storage by type">
          <BarList rows={(storage as Row[]).map((r) => ({ label: `${cap(String(r.kind))} (${fmt(r.n)})`, value: n(r.bytes), display: bytes(n(r.bytes)) }))} />
        </Card>
        <Card title="Abuse protection" subtitle="rate-limited requests, last 48 hours">
          {(security as Row[]).length ? (
            <BarList rows={(security as Row[]).map((r) => ({ label: `${String(r.bucket)} · ${fmt(r.sources)} sources`, value: n(r.hits) }))} />
          ) : (
            <Empty>No rate-limited traffic.</Empty>
          )}
          <p className="mt-3 text-xs text-neutral-500">{fmt(moderation.captcha_24h)} security checks solved in the last 24 hours.</p>
        </Card>
        <Card title="Team activity" subtitle={`actions logged, last ${days} days`} className="lg:col-span-2">
          {(adminActivity as Row[]).length ? (
            <BarList rows={(adminActivity as Row[]).map((r) => ({ label: String(r.name), value: n(r.n) }))} />
          ) : (
            <Empty>No admin actions in this period.</Empty>
          )}
          <Link href="/admin/activity" className="mt-3 inline-block text-xs font-medium text-neutral-600 hover:text-neutral-950 hover:underline">
            Open activity log →
          </Link>
        </Card>
      </div>
    </div>
  );
}

/* ---------------- pieces ---------------- */

function Card({ title, subtitle, className = "", children }: { title: string; subtitle?: string; className?: string; children: ReactNode }) {
  return (
    <section className={`rounded-2xl border border-neutral-200 bg-white p-5 ${className}`}>
      <h3 className="text-sm font-semibold text-neutral-950">{title}</h3>
      {subtitle && <p className="mt-0.5 text-xs text-neutral-500">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Kpi({ label, hint, cur, prev, href }: { label: string; hint?: string; cur: number; prev: number; href?: string }) {
  const diff = prev ? ((cur - prev) / prev) * 100 : cur ? 100 : 0;
  // From zero, a percentage means nothing — say "new" instead.
  const Icon = diff > 0 ? ArrowUpRight : diff < 0 ? ArrowDownRight : Minus;
  const tone = diff > 0 ? "text-emerald-700" : diff < 0 ? "text-red-600" : "text-neutral-500";
  const body = (
    <>
      <p className="text-xs font-medium text-neutral-500">{label}</p>
      <p className="mt-1.5 text-2xl font-bold tabular-nums tracking-tight text-neutral-950">{cur.toLocaleString("en-US")}</p>
      <p className={`mt-1 inline-flex items-center gap-0.5 text-xs font-medium ${tone}`}>
        <Icon className="h-3.5 w-3.5" aria-hidden />
        {!prev && cur ? "new this period" : diff === 0 ? "no change" : `${diff > 0 ? "+" : ""}${diff.toFixed(0)}%`}
        <span className="font-normal text-neutral-400">&nbsp;vs {prev.toLocaleString("en-US")}</span>
      </p>
      {hint && <p className="mt-1 text-[11px] text-neutral-400">{hint}</p>}
    </>
  );
  const cls = "rounded-2xl border border-neutral-200 bg-white p-4";
  return href ? (
    <Link href={href} className={`${cls} transition hover:border-neutral-300`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

function Stat({ label, value, hint, href }: { label: string; value: string; hint?: string; href?: string }) {
  const body = (
    <>
      <p className="text-xs font-medium text-neutral-500">{label}</p>
      <p className="mt-1.5 truncate text-xl font-bold tabular-nums tracking-tight text-neutral-950">{value}</p>
      {hint && <p className="mt-1 truncate text-[11px] text-neutral-400">{hint}</p>}
    </>
  );
  const cls = "min-w-0 rounded-2xl border border-neutral-200 bg-white p-4";
  return href ? (
    <Link href={href} className={`${cls} transition hover:border-neutral-300`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

function Bar({ value, max }: { value: number; max: number }) {
  return (
    <span className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-neutral-100">
      <span className="block h-full rounded-full bg-neutral-800" style={{ width: `${max ? (value / max) * 100 : 0}%` }} />
    </span>
  );
}

function BarList({ rows }: { rows: { label: string; value: number; display?: string }[] }) {
  if (!rows.length || rows.every((r) => !r.value)) return <Empty>Nothing yet.</Empty>;
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="space-y-2.5">
      {rows.map((r) => (
        <li key={r.label} className="text-sm" title={`${r.label}: ${r.display ?? r.value.toLocaleString("en-US")}`}>
          <div className="mb-1 flex items-baseline justify-between gap-3">
            <span className="min-w-0 truncate text-neutral-700">{r.label}</span>
            <span className="shrink-0 tabular-nums font-medium text-neutral-950">{r.display ?? r.value.toLocaleString("en-US")}</span>
          </div>
          <span className="flex">
            <Bar value={r.value} max={max} />
          </span>
        </li>
      ))}
    </ul>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-neutral-500">{label}</dt>
      <dd className="mt-0.5 font-semibold tabular-nums text-neutral-950">{value}</dd>
    </div>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="py-3 text-sm text-neutral-400">{children}</p>;
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace(/[_-]/g, " ");
const pct = (a: unknown, b: unknown) => (n(b) ? `${Math.round((n(a) / n(b)) * 100)}%` : "—");
function hours(h: unknown) {
  if (h === null || h === undefined) return "—";
  const v = Number(h);
  return v < 1 ? `${Math.max(1, Math.round(v * 60))} min` : v < 48 ? `${v.toFixed(1)} h` : `${(v / 24).toFixed(1)} days`;
}
function bytes(b: number) {
  if (!b) return "0 B";
  const u = ["B", "KB", "MB", "GB"];
  const i = Math.min(u.length - 1, Math.floor(Math.log(b) / Math.log(1024)));
  return `${(b / 1024 ** i).toFixed(i ? 1 : 0)} ${u[i]}`;
}
