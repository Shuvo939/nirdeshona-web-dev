import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sql } from "@/lib/db";

export default async function ClientDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [profile] = await sql`
    select full_name, role
    from profiles
    where id = ${user.id}
    limit 1
  `;

  const memberships = await sql`
    select c.id, c.name, c.slug, c.logo_url
    from clients c
    join client_members cm on cm.client_id = c.id
    where cm.user_id = ${user.id}
    order by c.name asc
  `;

  if (memberships.length === 0) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="rounded-xl border bg-white p-8">
          <h1 className="text-2xl font-semibold">
            Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}
          </h1>

          <p className="mt-3 text-neutral-600">
            Your account has been created successfully, but it has not been
            linked to a client yet.
          </p>

          <p className="mt-2 text-sm text-neutral-500">
            Please contact Nirdeshona to get your client account activated.
          </p>

          <Link
            href="/contact"
            className="mt-6 inline-block rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Contact us
          </Link>
        </div>
      </main>
    );
  }

  const clientIds = memberships.map((m) => m.id);

  const projects = await sql`
    select
      id,
      slug,
      title,
      short_description,
      status,
      progress_percent,
      cover_image_url
    from projects
    where client_id = any(${clientIds})
    order by created_at desc
  `;

  const tickets = await sql`
    select
      id,
      ticket_number,
      subject,
      status,
      priority,
      created_at
    from support_tickets
    where client_id = any(${clientIds})
    order by created_at desc
    limit 10
  `;

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <p className="text-sm text-neutral-500">Client Dashboard</p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Welcome
          {profile?.full_name ? `, ${profile.full_name}` : ""}
        </h1>

        <p className="mt-2 text-neutral-600">
          Manage your projects and support requests from here.
        </p>
      </div>

      {/* Clients */}
      {memberships.length > 1 && (
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold">My Organizations</h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {memberships.map((client) => (
              <div key={client.id} className="rounded-xl border p-5">
                <h3 className="font-medium">{client.name}</h3>

                <p className="mt-1 text-sm text-neutral-500">
                  {client.slug}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      <section className="mb-12">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">My Projects</h2>

            <p className="mt-1 text-sm text-neutral-500">
              Your current and previous projects.
            </p>
          </div>

          <span className="rounded-full bg-neutral-100 px-3 py-1 text-sm">
            {projects.length}
          </span>
        </div>

        {projects.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center">
            <p className="text-neutral-600">No projects yet.</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {projects.map((project) => (
              <div
                key={project.id}
                className="overflow-hidden rounded-xl border bg-white"
              >
                {project.cover_image_url && (
                  <img
                    src={project.cover_image_url}
                    alt={project.title}
                    className="h-44 w-full object-cover"
                  />
                )}

                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">{project.title}</h3>

                      {project.short_description && (
                        <p className="mt-1 text-sm text-neutral-600">
                          {project.short_description}
                        </p>
                      )}
                    </div>

                    <span className="shrink-0 rounded-full bg-neutral-100 px-2.5 py-1 text-xs">
                      {project.status.replaceAll("_", " ")}
                    </span>
                  </div>

                  <div className="mt-5">
                    <div className="mb-2 flex justify-between text-xs text-neutral-500">
                      <span>Progress</span>
                      <span>{project.progress_percent}%</span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                      <div
                        className="h-full rounded-full bg-black"
                        style={{
                          width: `${project.progress_percent}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Tickets */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Support Tickets</h2>

            <p className="mt-1 text-sm text-neutral-500">
              Recent support conversations.
            </p>
          </div>

          <Link
            href="/client/tickets/new"
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            New Ticket
          </Link>
        </div>

        {tickets.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center">
            <p className="text-neutral-600">No support tickets yet.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border">
            <div className="divide-y">
              {tickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/client/tickets/${ticket.id}`}
                  className="flex items-center justify-between gap-4 p-5 transition hover:bg-neutral-50"
                >
                  <div>
                    <p className="text-sm text-neutral-500">
                      #{ticket.ticket_number}
                    </p>

                    <p className="mt-1 font-medium">{ticket.subject}</p>

                    <p className="mt-1 text-xs text-neutral-500">
                      Priority: {ticket.priority}
                    </p>
                  </div>

                  <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs">
                    {ticket.status.replaceAll("_", " ")}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}