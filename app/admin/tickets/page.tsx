import Link from "next/link";

import { StatusBadge, TICKET_PRIORITY, TICKET_STATUS, formatDate } from "@/app/components/marketing";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";

export const dynamic = "force-dynamic";

const FILTERS = [
  { value: "active", label: "Active" },
  { value: "WAITING_FOR_CLIENT", label: "Awaiting client" },
  { value: "closed", label: "Resolved / closed" },
  { value: "all", label: "All" },
];

export default async function AdminTicketsPage({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  await requireAdmin();

  const { f } = await searchParams;
  const filter = FILTERS.some((x) => x.value === f) ? f! : "active";

  const tickets = await sql`
    select t.id, t.ticket_number, t.subject, t.status, t.priority, t.updated_at, c.name as client_name,
      (select count(*)::int from ticket_messages m where m.ticket_id = t.id) as message_count,
      (select pr.role from ticket_messages m join profiles pr on pr.id = m.sender_id
        where m.ticket_id = t.id order by m.created_at desc limit 1) as last_sender_role
    from support_tickets t
    join clients c on c.id = t.client_id
    where ${filter} = 'all'
      or (${filter} = 'active' and t.status in ('OPEN', 'IN_PROGRESS'))
      or (${filter} = 'WAITING_FOR_CLIENT' and t.status = 'WAITING_FOR_CLIENT')
      or (${filter} = 'closed' and t.status in ('RESOLVED', 'CLOSED'))
    order by case t.priority when 'URGENT' then 0 when 'HIGH' then 1 else 2 end, t.updated_at desc
  `;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-950">Support tickets</h1>
          <p className="mt-1 text-sm text-neutral-500">Urgent and high-priority tickets are listed first.</p>
        </div>
        <div className="flex flex-wrap gap-1 rounded-xl border border-neutral-200 bg-white p-1">
          {FILTERS.map((x) => (
            <Link
              key={x.value}
              href={x.value === "active" ? "/admin/tickets" : `/admin/tickets?f=${x.value}`}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${filter === x.value ? "bg-neutral-950 text-white" : "text-neutral-600 hover:bg-neutral-100"}`}
            >
              {x.label}
            </Link>
          ))}
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center text-sm text-neutral-500">No tickets here.</div>
      ) : (
        <div className="flex flex-col gap-2">
          {tickets.map((t) => (
            <Link
              key={t.id}
              href={`/admin/tickets/${t.id}`}
              className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4 transition hover:border-neutral-300 hover:shadow-sm sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs text-neutral-500">
                  #{t.ticket_number} · {t.client_name}
                </p>
                <p className="mt-0.5 truncate font-medium text-neutral-950">{t.subject}</p>
                <p className="mt-1 text-xs text-neutral-500">
                  <span className={TICKET_PRIORITY[t.priority]?.className}>{TICKET_PRIORITY[t.priority]?.label}</span> · {t.message_count} messages · {formatDate(t.updated_at, true)}
                  {t.last_sender_role && t.last_sender_role !== "ADMIN" && t.status !== "CLOSED" && (
                    <span className="ml-2 rounded-full bg-blue-50 px-2 py-0.5 font-medium text-blue-700">Client replied</span>
                  )}
                </p>
              </div>
              <StatusBadge map={TICKET_STATUS} value={t.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
