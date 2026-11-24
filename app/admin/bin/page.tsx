import Link from "next/link";
import { CheckCircle2, Clock, FileText, Folder, Image as ImageIcon, Inbox, MessageCircle, Building2, Trash2 } from "lucide-react";

import { AdminHeader, Empty, FilterTabs, timeAgo } from "@/app/admin/admin-ui";
import { requireAdmin } from "@/lib/auth/require-admin";
import { sql } from "@/lib/db";
import { purgeExpiredTrash, TRASH_LABELS, type TrashEntity } from "@/lib/trash";

import { deleteForever, emptyBin, restoreItem } from "./actions";
import { BinRowActions, EmptyBinButton } from "./bin-actions";

export const dynamic = "force-dynamic";

const ICONS: Record<TrashEntity, typeof FileText> = {
  post: FileText,
  project: Folder,
  client: Building2,
  file: ImageIcon,
  contact: Inbox,
  comment: MessageCircle,
};

export default async function BinPage({ searchParams }: { searchParams: Promise<{ type?: string; notice?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const type = (Object.keys(TRASH_LABELS) as TrashEntity[]).includes(sp.type as TrashEntity) ? (sp.type as TrashEntity) : null;

  // Items past their 30 days are removed whenever the bin is opened (and daily by cron).
  await purgeExpiredTrash().catch((e) => console.error("purge failed", e));

  const [items, counts] = await Promise.all([
    sql`
      select t.id, t.entity, t.label, t.deleted_at, t.purge_after, p.full_name as deleted_by_name,
             greatest(0, ceil(extract(epoch from (t.purge_after - now())) / 86400))::int as days_left
      from trash t left join profiles p on p.id = t.deleted_by
      where ${type}::text is null or t.entity = ${type}
      order by t.deleted_at desc
      limit 200
    ` as unknown as Promise<{ id: string; entity: TrashEntity; label: string; deleted_at: string; deleted_by_name: string | null; days_left: number }[]>,
    sql`select entity, count(*)::int as total from trash group by entity` as unknown as Promise<{ entity: TrashEntity; total: number }[]>,
  ]);
  const total = counts.reduce((sum, c) => sum + c.total, 0);
  const countOf = (e: TrashEntity) => counts.find((c) => c.entity === e)?.total ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader
        title="Bin"
        description="Deleted items stay here for 30 days, then they're removed automatically. Restore anything you need before then."
        actions={<EmptyBinButton count={total} action={emptyBin} />}
      />

      {sp.notice && (
        <div className="flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> {sp.notice}
        </div>
      )}

      <FilterTabs
        active={type ?? "all"}
        tabs={[
          { value: "all", label: "All", href: "/admin/bin", count: total },
          ...(Object.keys(TRASH_LABELS) as TrashEntity[])
            .filter((e) => countOf(e) > 0 || e === type)
            .map((e) => ({ value: e, label: `${TRASH_LABELS[e]}s`, href: `/admin/bin?type=${e}`, count: countOf(e) })),
        ]}
      />

      {items.length === 0 ? (
        <Empty>
          <span className="flex flex-col items-center gap-2">
            <Trash2 className="h-6 w-6 text-neutral-300" />
            The bin is empty.
          </span>
        </Empty>
      ) : (
        <ul className="flex flex-col divide-y divide-neutral-100 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          {items.map((item) => {
            const Icon = ICONS[item.entity];
            return (
              <li key={item.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-neutral-950">{item.label}</p>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      {TRASH_LABELS[item.entity]} · deleted {timeAgo(item.deleted_at)}
                      {item.deleted_by_name ? ` by ${item.deleted_by_name}` : ""}
                    </p>
                    <p className={`mt-1 inline-flex items-center gap-1 text-[11px] font-medium ${item.days_left <= 3 ? "text-red-600" : "text-neutral-400"}`}>
                      <Clock className="h-3 w-3" />
                      {item.days_left <= 1 ? "Deleted forever within a day" : `Deleted forever in ${item.days_left} days`}
                    </p>
                  </div>
                </div>
                <BinRowActions id={item.id} label={item.label} restore={restoreItem} purge={deleteForever} />
              </li>
            );
          })}
        </ul>
      )}
      <p className="text-xs text-neutral-400">
        Deleting a post also moves its comments and reactions here; deleting a client moves its support tickets. Restoring brings them back.{" "}
        <Link href="/admin/activity" className="underline">
          See the activity log
        </Link>
      </p>
    </div>
  );
}
