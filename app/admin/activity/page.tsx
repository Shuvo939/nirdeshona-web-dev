import { Activity, Building2, ClipboardList, FolderKanban, ImageIcon, MessageCircle, MessageSquareText, Newspaper, Users } from "lucide-react";

import { sql } from "@/lib/db";

import { AdminHeader, Avatar, Empty, FilterTabs, Pager, pageParam, timeAgo } from "../admin-ui";

export const dynamic = "force-dynamic";
const PER_PAGE = 40;

const ENTITIES = [
  { value: "all", label: "Everything", icon: Activity },
  { value: "post", label: "Posts", icon: Newspaper },
  { value: "project", label: "Projects", icon: FolderKanban },
  { value: "comment", label: "Comments", icon: MessageCircle },
  { value: "client", label: "Clients", icon: Building2 },
  { value: "ticket", label: "Tickets", icon: ClipboardList },
  { value: "contact", label: "Contacts", icon: MessageSquareText },
  { value: "user", label: "Users", icon: Users },
  { value: "media", label: "Media", icon: ImageIcon },
];

export default async function AdminActivityPage({ searchParams }: { searchParams: Promise<{ e?: string; page?: string }> }) {
  const sp = await searchParams;
  const entity = ENTITIES.some((x) => x.value === sp.e) ? sp.e! : "all";
  const page = pageParam(sp.page);

  const [rows, [{ total }]] = await Promise.all([
    sql`
      select a.id, a.action, a.entity, a.summary, a.created_at, p.full_name, p.avatar_url
      from activity_log a left join profiles p on p.id = a.actor_id
      where ${entity} = 'all' or a.entity = ${entity}
      order by a.created_at desc
      limit ${PER_PAGE} offset ${(page - 1) * PER_PAGE}
    `,
    sql`select count(*)::int as total from activity_log where ${entity} = 'all' or entity = ${entity}`,
  ]);

  const href = (e: string, p = 1) => {
    const s = new URLSearchParams();
    if (e !== "all") s.set("e", e);
    if (p > 1) s.set("page", String(p));
    return `/admin/activity${s.toString() ? `?${s}` : ""}`;
  };

  // Group rows by Dhaka calendar day.
  const groups: { day: string; items: typeof rows }[] = [];
  for (const r of rows) {
    const day = new Date(r.created_at).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Dhaka" });
    const last = groups[groups.length - 1];
    if (last?.day === day) last.items.push(r);
    else groups.push({ day, items: [r] as typeof rows });
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader title="Activity log" description="Every staff action, newest first." />
      <FilterTabs active={entity} tabs={ENTITIES.map((x) => ({ value: x.value, label: x.label, href: href(x.value) }))} />

      {rows.length === 0 ? (
        <Empty>No activity recorded yet.</Empty>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map((g) => (
            <section key={g.day}>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">{g.day}</h2>
              <ul className="divide-y divide-neutral-100 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                {g.items.map((r) => {
                  const Icon = ENTITIES.find((x) => x.value === r.entity)?.icon ?? Activity;
                  return (
                    <li key={r.id} className="flex items-center gap-3 px-4 py-3">
                      <Avatar name={r.full_name} url={r.avatar_url} size="h-8 w-8" />
                      <p className="min-w-0 flex-1 text-sm text-neutral-700">
                        <span className="font-semibold text-neutral-950">{r.full_name || "System"}</span>{" "}
                        {r.summary.charAt(0).toLowerCase() + r.summary.slice(1)}
                      </p>
                      <span className="hidden items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-500 sm:inline-flex">
                        <Icon className="h-3 w-3" /> {r.entity}
                      </span>
                      <time className="shrink-0 text-xs text-neutral-400" dateTime={new Date(r.created_at).toISOString()}>
                        {timeAgo(r.created_at)}
                      </time>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
      <Pager page={page} total={total} perPage={PER_PAGE} href={(p) => href(entity, p)} />
    </div>
  );
}
