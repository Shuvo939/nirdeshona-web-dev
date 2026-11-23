import Link from "next/link";
import { Building2, Plus } from "lucide-react";

import { sql } from "@/lib/db";

import { saveClient } from "./actions";
import ClientForm from "./client-form";
import { requireAdmin } from "@/lib/auth/require-admin";

export const dynamic = "force-dynamic";

export default async function AdminClientsPage() {
  await requireAdmin();

  const clients = await sql`
    select c.id, c.name, c.slug, c.logo_url, c.contact_email, c.created_at,
      (select count(*)::int from client_members m where m.client_id = c.id) as members,
      (select count(*)::int from projects p where p.client_id = c.id) as projects,
      (select count(*)::int from support_tickets t where t.client_id = c.id and t.status not in ('RESOLVED','CLOSED')) as open_tickets
    from clients c
    order by c.created_at desc
  `;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-950">Clients</h1>
        <p className="mt-1 text-sm text-neutral-500">Organisations you work with, and the users who can access their portal.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_420px]">
        <div className="flex flex-col gap-3">
          {clients.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center text-sm text-neutral-500">
              <Building2 className="mx-auto mb-3 h-6 w-6 text-neutral-300" />
              No clients yet. Add your first one.
            </div>
          ) : (
            clients.map((c) => (
              <Link
                key={c.id}
                href={`/admin/clients/${c.id}`}
                className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-4 transition hover:border-neutral-300 hover:shadow-sm"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-neutral-100 font-semibold text-neutral-600">
                  {c.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.logo_url} alt="" className="h-full w-full object-contain p-1.5" />
                  ) : (
                    c.name.slice(0, 1).toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-neutral-950">{c.name}</p>
                  <p className="truncate text-xs text-neutral-500">{c.contact_email || c.slug}</p>
                </div>
                <div className="hidden gap-5 text-center text-xs text-neutral-500 sm:flex">
                  <Count n={c.members} label="Users" />
                  <Count n={c.projects} label="Projects" />
                  <Count n={c.open_tickets} label="Open tickets" />
                </div>
              </Link>
            ))
          )}
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 xl:sticky xl:top-6 xl:self-start">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-neutral-950">
            <Plus className="h-4 w-4" /> Add client
          </h2>
          <ClientForm action={saveClient.bind(null, null)} submitLabel="Create client" />
        </div>
      </div>
    </div>
  );
}

function Count({ n, label }: { n: number; label: string }) {
  return (
    <div>
      <p className="text-base font-semibold text-neutral-900">{n}</p>
      <p>{label}</p>
    </div>
  );
}
