import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, MessageCircle, Phone, Trash2 } from "lucide-react";

import { AdminHeader } from "@/app/admin/admin-ui";
import ConfirmButton from "@/app/components/confirm-button";
import SubmitButton from "@/app/components/submit-button";
import { formatDate } from "@/app/components/marketing";
import { requireAdmin } from "@/lib/auth/require-admin";
import { sql } from "@/lib/db";

import { deleteQuote, updateQuote } from "../actions";
import QuoteEmailForm from "./quote-email-form";
import { PLAN_NAMES, QUOTE_STATUSES, TIMELINES, addOnName, careName, serviceName, taka } from "../shared";

export const metadata = { title: "Quote request — Admin" };

export default async function AdminQuotePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const [q] = await sql`
    select q.*, p.full_name as account_name
    from quote_requests q left join profiles p on p.id = q.user_id
    where q.id = ${id}
  `;
  if (!q) notFound();
  // History of emails sent from here (empty if the table isn't migrated yet).
  const emails = await sql`
    select m.id, m.subject, m.body, m.status, m.error, m.created_at, p.full_name as sender
    from quote_messages m left join profiles p on p.id = m.sender_id
    where m.quote_id = ${id}
    order by m.created_at desc
  `.catch(() => [] as never[]);
  const estimate =
    q.plan === "care"
      ? `${taka(q.monthly)}/month`
      : `${q.plan === "custom" ? "from " : ""}${taka(q.estimate_low)}${q.estimate_high > q.estimate_low ? ` – ${taka(q.estimate_high)}` : ""}${q.plan !== "care" && q.monthly ? ` + ${taka(q.monthly)}/month` : ""}`;

  const whatsapp = q.phone ? `https://wa.me/${String(q.phone).replace(/[^0-9]/g, "").replace(/^0/, "880")}` : null;
  const rows: [string, string][] = [
    ["Plan", PLAN_NAMES[q.plan] ?? q.plan],
    ...(q.plan !== "care" && q.plan !== "social"
      ? ([
          ["Project type", serviceName(q.service)],
          ["Pages / screens", String(q.pages)],
        ] as [string, string][])
      : []),
    ...(q.plan !== "care"
      ? ([
          ["Add-ons & services", (q.add_ons as string[]).map(addOnName).join(", ") || "None"],
          [
            "One-time",
            q.plan === "social"
              ? taka(q.estimate_low)
              : `${q.plan === "custom" ? "from " : ""}${taka(q.estimate_low)} – ${taka(q.estimate_high)}`,
          ],
        ] as [string, string][])
      : []),
    ["Care plan", q.care_plan === null ? "None" : careName(q.care_plan)],
    ["Monthly total", q.monthly ? `${taka(q.monthly)}/month` : "—"],
    ["Timeline", q.timeline ? TIMELINES[q.timeline] ?? q.timeline : "—"],
    ["Preferred contact", q.preferred_contact],
    ["Language", q.locale === "bn" ? "Bangla" : "English"],
    ["Received", formatDate(q.created_at, true)],
  ];

  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin/quotes" className="inline-flex w-fit items-center gap-2 text-sm text-neutral-500 hover:text-neutral-950">
        <ArrowLeft className="h-4 w-4" /> All quote requests
      </Link>
      <AdminHeader
        title={`${q.name} · ${q.reference}`}
        description={q.organisation ? String(q.organisation) : undefined}
        actions={
          <ConfirmButton
            action={deleteQuote.bind(null, q.id)}
            title="Delete quote request?"
            description="It moves to the bin, where you can restore it for 30 days."
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-100 bg-white px-4 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </ConfirmButton>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-6">
          <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-neutral-950">Selection</h2>
            <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              {rows.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs text-neutral-500">{k}</dt>
                  <dd className="mt-0.5 font-medium text-neutral-950">{v}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-neutral-950">Notes from the client</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-neutral-700">{q.message || "—"}</p>
          </section>

          <QuoteEmailForm
            quoteId={q.id}
            reference={q.reference}
            name={q.name}
            email={q.email}
            locale={q.locale}
            estimate={estimate}
            status={q.status}
          />

          <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-neutral-950">
              Email history <span className="font-normal text-neutral-400">{emails.length}</span>
            </h2>
            {emails.length === 0 ? (
              <p className="mt-3 text-sm text-neutral-500">No emails sent from here yet.</p>
            ) : (
              <ul className="mt-4 flex flex-col gap-3">
                {emails.map((m) => (
                  <li key={m.id}>
                    <details className="group rounded-xl border border-neutral-200 p-3 open:bg-neutral-50">
                      <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-neutral-900">{m.subject}</span>
                          <span className="mt-0.5 block text-xs text-neutral-500">
                            {formatDate(m.created_at, true)}
                            {m.sender ? ` · ${m.sender}` : ""}
                          </span>
                        </span>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            m.status === "sent" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                          }`}
                        >
                          {m.status === "sent" ? "Sent" : "Failed"}
                        </span>
                      </summary>
                      <p className="mt-3 whitespace-pre-wrap border-t border-neutral-200 pt-3 text-sm leading-6 text-neutral-700">{m.body}</p>
                      {m.error && <p className="mt-2 text-xs text-red-600">{m.error}</p>}
                    </details>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="flex flex-col gap-6">
          <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-neutral-950">Contact</h2>
            <ul className="mt-4 flex flex-col gap-3 text-sm">
              <li>
                <a href={`mailto:${q.email}?subject=${encodeURIComponent(`Your quote ${q.reference}`)}`} className="inline-flex items-center gap-2 font-medium text-neutral-900 hover:underline">
                  <Mail className="h-4 w-4 text-neutral-400" /> {q.email}
                </a>
              </li>
              {q.phone && (
                <li className="flex flex-wrap items-center gap-3">
                  <a href={`tel:${q.phone}`} className="inline-flex items-center gap-2 font-medium text-neutral-900 hover:underline">
                    <Phone className="h-4 w-4 text-neutral-400" /> {q.phone}
                  </a>
                  {whatsapp && (
                    <a href={whatsapp} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline">
                      <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                    </a>
                  )}
                </li>
              )}
              {q.user_id && <li className="text-xs text-neutral-500">Signed-in account: {q.account_name || "—"}</li>}
            </ul>
          </section>
          <form key={`${q.status}-${String(q.updated_at)}`} action={updateQuote.bind(null, q.id)} className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-neutral-950">Status &amp; internal note</h2>
            <label htmlFor="status" className="mt-4 block text-xs text-neutral-500">
              Status
            </label>
            <select id="status" name="status" defaultValue={q.status} className="mt-1 h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm">
              {QUOTE_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <label htmlFor="admin_note" className="mt-4 block text-xs text-neutral-500">
              Internal note (never shown to the client)
            </label>
            <textarea id="admin_note" name="admin_note" rows={4} defaultValue={q.admin_note ?? ""} className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm" />
            <SubmitButton className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-neutral-950 px-4 text-sm font-semibold text-white hover:bg-neutral-800" pendingText="Saving…">
              Save
            </SubmitButton>
          </form>
        </div>
      </div>
    </div>
  );
}
