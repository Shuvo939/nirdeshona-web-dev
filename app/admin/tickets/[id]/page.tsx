import { sql } from "@/lib/db";
import { notFound } from "next/navigation";
import { replyToTicket, updateTicketStatus } from "../actions";

const STATUSES = ["OPEN", "IN_PROGRESS", "WAITING_FOR_CLIENT", "RESOLVED", "CLOSED"];

export default async function AdminTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [ticket] = await sql`
    select t.*, c.name as client_name
    from support_tickets t
    join clients c on c.id = t.client_id
    where t.id = ${id}
  `;

  if (!ticket) notFound();

  const messages = await sql`
    select m.id, m.message, m.created_at, p.full_name, p.role
    from ticket_messages m
    join profiles p on p.id = m.sender_id
    where m.ticket_id = ${id}
    order by m.created_at asc
  `;

  const replyAction = replyToTicket.bind(null, id);
  const statusAction = updateTicketStatus.bind(null, id);

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            #{ticket.ticket_number} — {ticket.subject}
          </h1>
          <p className="text-sm text-neutral-500">{ticket.client_name}</p>
        </div>
        <form action={statusAction}>
          <select
            name="status"
            defaultValue={ticket.status}
            onChange={(e) => e.currentTarget.form?.requestSubmit()}
            className="rounded border p-2 text-sm"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </form>
      </div>

      <div className="mb-8 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className="rounded border p-3">
            <div className="mb-1 flex items-center justify-between text-xs text-neutral-500">
              <span>{m.full_name} {m.role === "ADMIN" ? "(support)" : ""}</span>
              <span>{new Date(m.created_at).toLocaleString()}</span>
            </div>
            <p className="text-sm whitespace-pre-wrap">{m.message}</p>
          </div>
        ))}
      </div>

      <form action={replyAction} className="space-y-3">
        <textarea
          name="message"
          required
          rows={4}
          placeholder="Write a reply…"
          className="w-full rounded border p-2"
        />
        <button type="submit" className="rounded bg-black px-4 py-2 text-sm text-white">
          Send Reply
        </button>
      </form>
    </div>
  );
}
