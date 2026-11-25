import type { Metadata } from "next";
import Link from "@/app/components/locale-link";
import { ArrowLeft, LifeBuoy } from "lucide-react";

import { getClientMemberships, requireUser } from "@/lib/auth/session";
import { sql } from "@/lib/db";

import NewTicketForm from "./new-ticket-form";
import { getI18n, msg } from "@/lib/i18n/server";
import { tcol } from "@/lib/i18n/sql";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await msg("New support ticket — Nirdeshona Web", "নতুন সাপোর্ট টিকেট — নির্দেশনা ওয়েব"), robots: { index: false } };
}

export default async function NewTicketPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const { L, locale } = await getI18n();
  const user = await requireUser("/client/tickets/new");
  const { project } = await searchParams;
  const clients = await getClientMemberships(user.id);

  const projects = clients.length
    ? ((await sql`
        select id, ${tcol(locale, "title")} as title, client_id from projects
        where client_id = any(${clients.map((c) => c.id)}::uuid[])
        order by title asc
      `) as unknown as { id: string; title: string; client_id: string }[])
    : [];

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-0">
      <div className="max-w-3xl">
        <Link href="/client" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-950">
          <ArrowLeft className="h-4 w-4" /> {L("Back to projects & tickets", "প্রজেক্ট ও টিকেটে ফিরে যান")}
        </Link>

        <div className="mt-6 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-neutral-950 text-white">
            <LifeBuoy className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">{L("Open a support ticket", "সাপোর্ট টিকেট খুলুন")}</h1>
            <p className="mt-1 text-sm text-neutral-600">{L("Tell us what you need — a bug, a change request or a question.", "কী দরকার জানান — কোনো বাগ, পরিবর্তনের অনুরোধ বা প্রশ্ন।")}</p>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-8">
          {clients.length === 0 ? (
            <div className="text-center">
              <p className="text-sm text-neutral-600">
                {L(
                  "Your account isn't linked to a client organisation yet, so tickets can't be opened. Please contact us and we'll activate your client access.",
                  "আপনার অ্যাকাউন্ট এখনো কোনো ক্লায়েন্ট প্রতিষ্ঠানের সঙ্গে যুক্ত হয়নি, তাই টিকেট খোলা যাচ্ছে না। আমাদের সঙ্গে যোগাযোগ করুন, আমরা ক্লায়েন্ট অ্যাক্সেস চালু করে দেব।",
                )}
              </p>
              <Link href="/contact" className="mt-5 inline-flex h-11 items-center rounded-full bg-neutral-950 px-5 text-sm font-semibold text-white">
                {L("Contact us", "যোগাযোগ করুন")}
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
