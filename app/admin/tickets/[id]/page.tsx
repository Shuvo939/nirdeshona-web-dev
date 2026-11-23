import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { StatusBadge, TICKET_STATUS, formatDate } from "@/app/components/marketing";
import TicketThread from "@/app/components/tickets/ticket-thread";
import { getSessionUser } from "@/lib/auth/session";
import { sql } from "@/lib/db";
import { getTicket, getTicketMessages } from "@/lib/tickets";

import { replyToTicket, updateTicketMeta } from "../actions";
import AdminReplyForm from "./admin-reply-form";

export const dynamic = "force-dynamic";

const STATUSES = ["OPEN", "IN_PROGRESS", "WAITING_FOR_CLIENT", "RESOLVED", "CLOSED"];
const PRIORITIES = ["LOW", "NORMAL", "HIGH", "URGENT"];

export default async function AdminTicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = (await getSessionUser())!;
  const ticket = await getTicket(id);
  if (!ticket) notFound();

  const [messages] = await Promise.all([
    getTicketMessages(ticket.id),
    sql`update notifications set read_at = now()
        where user_id = ${user.id} and read_at is null and link = ${`/admin/tickets/${ticket.id}`}`,
  ]);

  const selectClass = "h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-neutral-950";

  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin/tickets" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-950">
        <ArrowLeft className="h-4 w-4" /> All tickets
      </Link>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm text-neutral-500">
            #{ticket.ticket_number} · <Link href={`/admin/clients/${ticket.client_id}`} className="hover:underline">{ticket.client_name}</Link>
            {ticket.project_title ? ` · ${ticket.project_title}` : ""}
          </p>
          <h1 className="mt-1 break-words text-2xl font-bold tracking-tight text-neutral-950">{ticket.subject}</h1>
        </div>
        <StatusBadge map={TICKET_STATUS} value={ticket.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_300px]">
        <div className="flex min-w-0 flex-col gap-5">
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50/60 p-4 sm:p-6">
            <TicketThread messages={messages} viewerId={user.id} />
          </div>
          <AdminReplyForm action={replyToTicket.bind(null, ticket.id)} ticketId={ticket.id} />
        </div>
        <aside className="flex flex-col gap-4">
          <form action={updateTicketMeta.bind(null, ticket.id)} className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-neutral-950">Manage</h2>
            <label className="text-xs text-neutral-500">
              Status
              <select name="status" defaultValue={ticket.status} className={`${selectClass} mt-1`}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {TICKET_STATUS[s].label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-neutral-500">
              Priority
              <select name="priority" defaultValue={ticket.priority} className={`${selectClass} mt-1`}>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0) + p.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className="mt-1 h-10 rounded-xl bg-neutral-950 text-sm font-semibold text-white hover:bg-neutral-800">
              Update ticket
            </button>
          </form>
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 text-sm">
            <dl className="flex flex-col gap-3">
              <div>
                <dt className="text-xs text-neutral-500">Opened by</dt>
                <dd className="font-medium">{ticket.created_by_name || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-neutral-500">Opened</dt>
                <dd className="font-medium">{formatDate(ticket.created_at, true)}</dd>
              </div>
              <div>
                <dt className="text-xs text-neutral-500">Last activity</dt>
                <dd className="font-medium">{formatDate(ticket.updated_at, true)}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
