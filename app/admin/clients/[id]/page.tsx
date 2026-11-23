import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trash2, UserMinus } from "lucide-react";

import { PROJECT_STATUS, StatusBadge, TICKET_STATUS, formatDate } from "@/app/components/marketing";
import ConfirmButton from "@/app/components/confirm-button";
import { sql } from "@/lib/db";

import { addClientMember, deleteClient, removeClientMember, saveClient } from "../actions";
import AddMemberForm from "../add-member-form";
import ClientForm from "../client-form";

export const dynamic = "force-dynamic";

export default async function AdminClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const [client] = await sql`select * from clients where id = ${id}`;
  if (!client) notFound();

  const [members, projects, tickets] = await Promise.all([
    sql`
      select p.id, p.full_name, p.avatar_url, p.role, u.email, cm.created_at
      from client_members cm
      join profiles p on p.id = cm.user_id
      join auth.users u on u.id = p.id
      where cm.client_id = ${id}
      order by cm.created_at asc
    `,
    sql`select id, title, slug, status, progress_percent from projects where client_id = ${id} order by created_at desc`,
    sql`select id, ticket_number, subject, status, updated_at from support_tickets where client_id = ${id} order by updated_at desc limit 10`,
  ]);

  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin/clients" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-950">
        <ArrowLeft className="h-4 w-4" /> All clients
      </Link>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-950">{client.name}</h1>
          <p className="text-sm text-neutral-500">Client since {formatDate(client.created_at)}</p>
        </div>
        <ConfirmButton
          action={deleteClient.bind(null, id)}
          title={`Delete ${client.name}?`}
          description="This removes the client, its portal access and all of its support tickets. Projects stay but become unassigned. This can't be undone."
          confirmLabel="Delete client"
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-700 hover:bg-red-100"
        >
          <Trash2 className="h-4 w-4" /> Delete client
        </ConfirmButton>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="mb-4 text-base font-semibold text-neutral-950">Details</h2>
          <ClientForm
            action={saveClient.bind(null, id)}
            submitLabel="Save changes"
            initial={{
              name: client.name,
              slug: client.slug,
              contact_email: client.contact_email ?? "",
              contact_phone: client.contact_phone ?? "",
              logo_url: client.logo_url ?? "",
              notes: client.notes ?? "",
            }}
          />
        </section>

        <div className="flex flex-col gap-6">
          <section className="rounded-2xl border border-neutral-200 bg-white p-5">
            <h2 className="text-base font-semibold text-neutral-950">Portal users</h2>
            <p className="mb-4 mt-1 text-xs text-neutral-500">Users linked here can see this client&apos;s projects and tickets.</p>
            <AddMemberForm action={addClientMember.bind(null, id)} />
            <ul className="mt-4 divide-y divide-neutral-100">
              {members.length === 0 && <li className="py-3 text-sm text-neutral-500">No users linked yet.</li>}
              {members.map((m) => (
                <li key={m.id} className="flex items-center gap-3 py-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-100 text-xs font-semibold">
                    {m.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      (m.full_name || m.email).slice(0, 1).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-900">{m.full_name || "—"}</p>
                    <p className="truncate text-xs text-neutral-500">{m.email}</p>
                  </div>
                  <form action={removeClientMember.bind(null, id, m.id)}>
                    <button type="submit" title="Remove access" className="rounded-lg p-2 text-neutral-400 hover:bg-red-50 hover:text-red-600">
                      <UserMinus className="h-4 w-4" />
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-neutral-950">Projects</h2>
              <Link href="/admin/projects/new" className="text-xs font-medium text-neutral-500 hover:text-neutral-950">
                New project
              </Link>
            </div>
            <ul className="flex flex-col gap-2">
              {projects.length === 0 && <li className="text-sm text-neutral-500">No projects assigned.</li>}
              {projects.map((p) => (
                <li key={p.id}>
                  <Link href={`/admin/projects/${p.id}/edit`} className="flex items-center justify-between gap-3 rounded-xl border border-neutral-100 px-3 py-2.5 hover:bg-neutral-50">
                    <span className="truncate text-sm font-medium">{p.title}</span>
                    <span className="flex shrink-0 items-center gap-2 text-xs text-neutral-500">
                      {p.progress_percent}% <StatusBadge map={PROJECT_STATUS} value={p.status} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-5">
            <h2 className="mb-3 text-base font-semibold text-neutral-950">Recent tickets</h2>
            <ul className="flex flex-col gap-2">
              {tickets.length === 0 && <li className="text-sm text-neutral-500">No tickets.</li>}
              {tickets.map((t) => (
                <li key={t.id}>
                  <Link href={`/admin/tickets/${t.id}`} className="flex items-center justify-between gap-3 rounded-xl border border-neutral-100 px-3 py-2.5 hover:bg-neutral-50">
                    <span className="truncate text-sm">
                      <span className="text-neutral-400">#{t.ticket_number}</span> {t.subject}
                    </span>
                    <StatusBadge map={TICKET_STATUS} value={t.status} />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
