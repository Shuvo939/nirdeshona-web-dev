import { sql } from "@/lib/db";

export default async function AdminOverviewPage() {
  const [[projectCount], [postCount], [openTickets], [clientCount]] =
    await Promise.all([
      sql`select count(*)::int as count from projects`,
      sql`select count(*)::int as count from posts`,
      sql`select count(*)::int as count from support_tickets where status in ('OPEN', 'IN_PROGRESS', 'WAITING_FOR_CLIENT')`,
      sql`select count(*)::int as count from clients`,
    ]);

  const cards = [
    { label: "Clients", value: clientCount.count },
    { label: "Projects", value: projectCount.count },
    { label: "Posts", value: postCount.count },
    { label: "Open Tickets", value: openTickets.count },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Overview</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border p-4">
            <p className="text-sm text-neutral-500">{c.label}</p>
            <p className="mt-1 text-2xl font-semibold">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
