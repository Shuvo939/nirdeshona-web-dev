import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, LifeBuoy } from "lucide-react";

import { getClientMemberships, requireUser } from "@/lib/auth/session";
import { sql } from "@/lib/db";

import NewTicketForm from "./new-ticket-form";

export const metadata: Metadata = { title: "New support ticket — Nirdeshona Web", robots: { index: false } };

export default async function NewTicketPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const user = await requireUser("/client/tickets/new");
  const { project } = await searchParams;
  const clients = await getClientMemberships(user.id);

  const projects = clients.length
    ? ((await sql`
        select id, title, client_id from projects
        where client_id = any(${clients.map((c) => c.id)}::uuid[])
        order by title asc
      `) as unknown as { id: string; title: string; client_id: string }[])
    : [];

  return (
    <main className="min-h-[calc(100vh-72px)] bg-neutral-50">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <Link href="/client" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-950">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>

        <div className="mt-6 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-neutral-950 text-white">
            <LifeBuoy className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">Open a support ticket</h1>
            <p className="mt-1 text-sm text-neutral-600">Tell us what you need — a bug, a change request or a question.</p>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-8">
          {clients.length === 0 ? (
            <div className="text-center">
              <p className="text-sm text-neutral-600">
                Your account isn&apos;t linked to a client organisation yet, so tickets can&apos;t be opened. Please contact us and
                we&apos;ll activate your client access.
              </p>
              <Link href="/contact" className="mt-5 inline-flex h-11 items-center rounded-full bg-neutral-950 px-5 text-sm font-semibold text-white">
                Contact us
              </Link>
            </div>
          ) : (
            <NewTicketForm
              clients={clients.map((c) => ({ id: c.id, name: c.name }))}
              projects={projects}
              defaultProjectId={project}
            />
          )}
        </div>
      </div>
    </main>
  );
}
