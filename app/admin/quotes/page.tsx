import Link from "next/link";

import { AdminHeader, Empty, FilterTabs, timeAgo } from "@/app/admin/admin-ui";
import { requireAdmin } from "@/lib/auth/require-admin";
import { sql } from "@/lib/db";

import { PLAN_NAMES, QUOTE_STATUSES, serviceName, taka } from "./shared";

export const metadata = { title: "Quote requests — Admin" };

type Row = {
  id: string;
  reference: string;
  name: string;
  email: string;
  plan: string;
  service: string | null;
  estimate_low: number;
  estimate_high: number;
  monthly: number;
  status: string;
  created_at: string;
};

export default async function AdminQuotesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireAdmin();
  const { status = "all" } = await searchParams;
  const filter = QUOTE_STATUSES.some((s) => s.value === status) ? status : "all";

  const [rows, counts] = await Promise.all([
    sql`
      select id, reference, name, email, plan, service, estimate_low, estimate_high, monthly, status, created_at
      from quote_requests
      where ${filter === "all" ? sql`true` : sql`status = ${filter}`}
      order by created_at desc
      limit 200
    ` as unknown as Promise<Row[]>,
    sql`select status, count(*)::int as n from quote_requests group by status` as unknown as Promise<{ status: string; n: number }[]>,
  ]);
  const count = (s: string) => counts.find((c) => c.status === s)?.n ?? 0;
  const total = counts.reduce((sum, c) => sum + c.n, 0);

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader title="Quote requests" description="Requests confirmed through the order builder on the pricing page." />
      <FilterTabs
        active={filter}
        tabs={[
          { value: "all", label: "All", href: "/admin/quotes", count: total },
          ...QUOTE_STATUSES.map((s) => ({ value: s.value, label: s.label, href: `/admin/quotes?status=${s.value}`, count: count(s.value) })),
        ]}
      />
      {rows.length === 0 ? (
        <Empty>No quote requests yet.</Empty>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          <ul className="divide-y divide-neutral-100">
            {rows.map((q) => {
              const st = QUOTE_STATUSES.find((s) => s.value === q.status);
              return (
                <li key={q.id}>
                  <Link href={`/admin/quotes/${q.id}`} className="flex flex-col gap-2 px-4 py-4 transition hover:bg-neutral-50 sm:flex-row sm:items-center sm:gap-4 sm:px-5">
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-neutral-950">{q.name}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${st?.className ?? ""}`}>{st?.label ?? q.status}</span>
                      </p>
                      <p className="mt-0.5 truncate text-xs text-neutral-500">
                        {q.reference} · {q.email} · {PLAN_NAMES[q.plan]}
                        {q.service ? ` · ${serviceName(q.service)}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-4 sm:block sm:text-right">
                      <p className="text-sm font-semibold text-neutral-950">
                        {q.plan === "care" || (q.estimate_low === 0 && q.monthly)
                          ? `${taka(q.monthly)}/mo`
                          : `${taka(q.estimate_low)}${q.estimate_high > q.estimate_low ? ` – ${taka(q.estimate_high)}` : ""}${q.monthly ? ` + ${taka(q.monthly)}/mo` : ""}`}
                      </p>
                      <p className="text-xs text-neutral-400">{timeAgo(q.created_at)}</p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
