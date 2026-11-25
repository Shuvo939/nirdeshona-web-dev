import type { Metadata } from "next";
import Link from "@/app/components/locale-link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, Calendar, Flag, FolderKanban, Lock, RotateCcw } from "lucide-react";

import { replyToTicketAsClient, setTicketClosed } from "@/app/(account)/client/actions";
import { StatusBadge, TICKET_PRIORITY, TICKET_STATUS, formatDate, statusLabel } from "@/app/components/marketing";
import ReplyForm from "@/app/components/tickets/reply-form";
import TicketThread from "@/app/components/tickets/ticket-thread";
import { requireUser } from "@/lib/auth/session";
import { sql } from "@/lib/db";
import { canAccessTicket, getTicket, getTicketMessages } from "@/lib/tickets";
import SubmitButton from "@/app/components/submit-button";
import { getI18n, msg } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await msg("Support ticket — Nirdeshona Web", "সাপোর্ট টিকেট — নির্দেশনা ওয়েব"), robots: { index: false } };
}

export default async function ClientTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { L, locale, num } = await getI18n();
  const { id } = await params;
  const user = await requireUser(`/client/tickets/${id}`);
  const ticket = await getTicket(id);
  if (!ticket || !(await canAccessTicket(user, ticket))) notFound();

  const [messages] = await Promise.all([
    getTicketMessages(ticket.id),
    sql`update notifications set read_at = now()
        where user_id = ${user.id} and read_at is null and link = ${`/client/tickets/${ticket.id}`}`,
  ]);
  const closed = ticket.status === "CLOSED";
  const reply = replyToTicketAsClient.bind(null, ticket.id);
  const toggle = setTicketClosed.bind(null, ticket.id, !closed);
  const priority = TICKET_PRIORITY[ticket.priority];

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-0">
      <div>
        <Link href="/client" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-950">
          <ArrowLeft className="h-4 w-4" /> {L("Back to projects & tickets", "প্রজেক্ট ও টিকেটে ফিরে যান")}
        </Link>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm text-neutral-500">{L("Ticket", "টিকেট")} #{num(ticket.ticket_number)}</p>
            <h1 className="mt-1 break-words text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">{ticket.subject}</h1>
          </div>
          <StatusBadge map={TICKET_STATUS} value={ticket.status} />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_280px]">
          <div className="flex min-w-0 flex-col gap-6">
            <div className="rounded-3xl border border-neutral-200 bg-neutral-50/60 p-4 sm:p-6">
              <TicketThread messages={messages} viewerId={user.id} locale={locale} />
            </div>
            <ReplyForm
              action={reply}
              ticketId={ticket.id}
              placeholder={L("Add more details or reply to the team…", "আরও তথ্য যোগ করুন বা টিমকে উত্তর দিন…")}
              disabled={closed}
              disabledText={L("This ticket is closed. Reopen it if you need more help.", "এই টিকেটটি বন্ধ। আরও সাহায্য লাগলে আবার খুলুন।")}
            />
          </div>

          <aside className="flex flex-col gap-4">
            <div className="rounded-3xl border border-neutral-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-neutral-950">{L("Details", "বিস্তারিত")}</h2>
              <dl className="mt-4 flex flex-col gap-3 text-sm">
                <Detail icon={<Building2 className="h-4 w-4" />} label={L("Organisation", "প্রতিষ্ঠান")} value={ticket.client_name} />
                {ticket.project_title && (
                  <Detail icon={<FolderKanban className="h-4 w-4" />} label={L("Project", "প্রজেক্ট")} value={ticket.project_title} />
                )}
                <Detail
                  icon={<Flag className="h-4 w-4" />}
                  label={L("Priority", "অগ্রাধিকার")}
                  value={<span className={priority?.className}>{statusLabel(TICKET_PRIORITY, ticket.priority, locale)}</span>}
                />
                <Detail icon={<Calendar className="h-4 w-4" />} label={L("Opened", "খোলা হয়েছে")} value={formatDate(ticket.created_at, true, locale)} />
                <Detail icon={<Calendar className="h-4 w-4" />} label={L("Last activity", "সর্বশেষ কার্যক্রম")} value={formatDate(ticket.updated_at, true, locale)} />
              </dl>
            </div>
            <form action={toggle}>
              <SubmitButton
                icon={closed ? <RotateCcw className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white text-sm font-semibold text-neutral-800 transition hover:bg-neutral-100 disabled:opacity-70"
              >
                {closed ? L("Reopen ticket", "টিকেট আবার খুলুন") : L("Mark as solved & close", "সমাধান হয়েছে, বন্ধ করুন")}
              </SubmitButton>
            </form>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-neutral-400">{icon}</span>
      <div className="min-w-0">
        <dt className="text-xs text-neutral-500">{label}</dt>
        <dd className="break-words font-medium text-neutral-900">{value}</dd>
      </div>
    </div>
  );
}
