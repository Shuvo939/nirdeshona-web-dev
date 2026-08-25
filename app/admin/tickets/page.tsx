import { sql } from "@/lib/db";

export default async function AdminTicketsPage() {
  const tickets = await sql`
    select t.id, t.ticket_number, t.subject, t.status, t.priority, t.updated_at, c.name as client_name
    from support_tickets t
    join clients c on c.id = t.client_id
    order by t.updated_at desc
  `;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Support Tickets</h1>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b text-neutral-500">
            <th className="py-2">#</th>
            <th>Client</th>
            <th>Subject</th>
            <th>Status</th>
            <th>Priority</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((t) => (
            <tr key={t.id} className="border-b">
              <td className="py-2">
                <a href={`/admin/tickets/${t.id}`} className="text-blue-600 hover:underline">
                  #{t.ticket_number}
                </a>
              </td>
              <td>{t.client_name}</td>
              <td>{t.subject}</td>
              <td>{t.status}</td>
              <td>{t.priority}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
