import Link from "next/link";
import { CheckCircle2, ExternalLink, Eye, EyeOff, Flag, Trash2 } from "lucide-react";

import ConfirmButton from "@/app/components/confirm-button";
import { sql } from "@/lib/db";

import { AdminHeader, Avatar, Empty, FilterTabs, Pager, SearchBox, pageParam, timeAgo } from "../admin-ui";
import { deleteCommentAdmin, dismissReports, setCommentStatus } from "./actions";
import { requireAdmin } from "@/lib/auth/require-admin";
import SubmitButton from "@/app/components/submit-button";

export const dynamic = "force-dynamic";
const PER_PAGE = 20;

export default async function AdminCommentsPage({ searchParams }: { searchParams: Promise<{ f?: string; q?: string; page?: string }> }) {
  await requireAdmin();

  const sp = await searchParams;
  const filter = ["all", "reported", "hidden"].includes(sp.f ?? "") ? sp.f! : "all";
  const q = sp.q?.trim().slice(0, 80) || null;
  const pattern = q ? `%${q}%` : null;
  const page = pageParam(sp.page);

  const where = sql`
    (${filter} <> 'all' or c.status = 'visible')
    and (${filter} <> 'hidden' or c.status = 'hidden')
    and (${filter} <> 'reported' or exists (select 1 from comment_reports r where r.comment_id = c.id and r.resolved_at is null))
    and (${pattern}::text is null or c.content ilike ${pattern} or p.full_name ilike ${pattern} or po.title ilike ${pattern})
  `;

  const [rows, [{ total }], [counts]] = await Promise.all([
    sql`
      select c.id, c.content, c.status, c.created_at, c.edited_at, c.parent_id, c.user_id,
             p.full_name, p.avatar_url, p.is_banned, u.email, po.slug, po.title,
             (select count(*)::int from comment_likes l where l.comment_id = c.id) as likes,
             (select count(*)::int from comments r where r.parent_id = c.id) as replies,
             (select coalesce(json_agg(json_build_object('reason', r.reason, 'at', r.created_at)), '[]'::json)
                from comment_reports r where r.comment_id = c.id and r.resolved_at is null) as reports
      from comments c
      join profiles p on p.id = c.user_id
      left join auth.users u on u.id = c.user_id
      join posts po on po.id = c.post_id
      where ${where}
      order by c.created_at desc
      limit ${PER_PAGE} offset ${(page - 1) * PER_PAGE}
    `,
    sql`select count(*)::int as total from comments c join profiles p on p.id = c.user_id join posts po on po.id = c.post_id where ${where}`,
    sql`
      select count(*) filter (where status = 'visible')::int as visible,
             count(*) filter (where status = 'hidden')::int as hidden,
             (select count(distinct comment_id)::int from comment_reports where resolved_at is null) as reported
      from comments
    `,
  ]);

  const href = (next: { f?: string; page?: number }) => {
    const p = new URLSearchParams();
    const f = next.f ?? filter;
    if (f !== "all") p.set("f", f);
    if (q) p.set("q", q);
    if (next.page && next.page > 1) p.set("page", String(next.page));
    const s = p.toString();
    return s ? `/admin/comments?${s}` : "/admin/comments";
  };

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader title="Comments" description="Moderate the conversation on your blog." />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterTabs
          active={filter}
          tabs={[
            { value: "all", label: "Visible", href: href({ f: "all" }), count: counts.visible },
            { value: "reported", label: "Reported", href: href({ f: "reported" }), count: counts.reported },
            { value: "hidden", label: "Hidden", href: href({ f: "hidden" }), count: counts.hidden },
          ]}
        />
        <SearchBox action="/admin/comments" defaultValue={q ?? ""} placeholder="Search text, author or post…" hidden={filter !== "all" ? { f: filter } : {}} />
      </div>

      {rows.length === 0 ? (
        <Empty>{filter === "reported" ? "No reported comments. All clear!" : "No comments found."}</Empty>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((c) => (
            <li key={c.id} className={`rounded-2xl border bg-white p-4 sm:p-5 ${c.reports.length ? "border-amber-200" : "border-neutral-200"}`}>
              <div className="flex items-start gap-3">
                <Avatar name={c.full_name} url={c.avatar_url} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                    <span className="font-semibold text-neutral-950">{c.full_name || "Member"}</span>
                    <span className="text-xs text-neutral-400">{c.email}</span>
                    {c.is_banned && <span className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-600">Suspended</span>}
                    {c.status === "hidden" && <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-600">Hidden</span>}
                  </div>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {c.parent_id ? "Reply" : "Comment"} on{" "}
                    <Link href={`/blog/${c.slug}#comment-${c.id}`} className="font-medium text-neutral-700 hover:underline">
                      {c.title}
                    </Link>{" "}
                    · {timeAgo(c.created_at)}
                    {c.edited_at ? " · edited" : ""} · 👍 {c.likes} · 💬 {c.replies}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap break-words rounded-xl bg-neutral-50 px-3 py-2 text-sm leading-6 text-neutral-800">{c.content}</p>

                  {c.reports.length > 0 && (
                    <div className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
                      <p className="flex items-center gap-1.5 font-semibold">
                        <Flag className="h-3.5 w-3.5" /> Reported {c.reports.length} time{c.reports.length === 1 ? "" : "s"}
                      </p>
                      <p className="mt-0.5">{[...new Set(c.reports.map((r: { reason: string }) => r.reason))].join(" · ")}</p>
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2">
                    {c.status === "visible" ? (
                      <form action={setCommentStatus.bind(null, c.id, "hidden")}>
                        <Btn icon={<EyeOff className="h-3.5 w-3.5" />}>Hide</Btn>
                      </form>
                    ) : (
                      <form action={setCommentStatus.bind(null, c.id, "visible")}>
                        <Btn icon={<Eye className="h-3.5 w-3.5" />}>Restore</Btn>
                      </form>
                    )}
                    {c.reports.length > 0 && (
                      <form action={dismissReports.bind(null, c.id)}>
                        <Btn icon={<CheckCircle2 className="h-3.5 w-3.5" />}>Dismiss reports</Btn>
                      </form>
                    )}
                    <ConfirmButton
                      action={deleteCommentAdmin.bind(null, c.id)}
                      title="Delete this comment?"
                      description="The comment and its replies go to the bin, where you can restore them for 30 days."
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-700 hover:bg-red-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </ConfirmButton>
                    <Link href={`/admin/users?q=${encodeURIComponent(c.email ?? "")}`} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-neutral-200 px-3 text-xs font-semibold text-neutral-700 hover:bg-neutral-50">
                      Manage user
                    </Link>
                    <Link href={`/blog/${c.slug}#comment-${c.id}`} target="_blank" className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-neutral-500 hover:text-neutral-950">
                      <ExternalLink className="h-3.5 w-3.5" /> View
                    </Link>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Pager page={page} total={total} perPage={PER_PAGE} href={(p) => href({ page: p })} />
    </div>
  );
}

function Btn({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <SubmitButton icon={icon} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-60">
      {children}
    </SubmitButton>
  );
}
