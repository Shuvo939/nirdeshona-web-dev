"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { logActivity } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/require-admin";
import { sql } from "@/lib/db";
import { deliverEmail } from "@/lib/email";
import { site } from "@/lib/site";
import { moveToTrash } from "@/lib/trash";

import { QUOTE_STATUSES } from "./shared";

export async function updateQuote(id: string, formData: FormData) {
  const { userId } = await requireAdmin();
  const status = String(formData.get("status") ?? "");
  const note = String(formData.get("admin_note") ?? "").trim().slice(0, 4000);
  if (!QUOTE_STATUSES.some((s) => s.value === status)) throw new Error("Invalid status.");

  await sql`update quote_requests set status = ${status}, admin_note = ${note || null}, updated_at = now() where id = ${id}`;
  await logActivity(userId, { action: "quote.update", entity: "quote", summary: `Updated a quote request (${status})` });
  revalidatePath("/admin/quotes");
  revalidatePath(`/admin/quotes/${id}`);
}

export async function deleteQuote(id: string) {
  const { userId } = await requireAdmin();
  await moveToTrash("quote", id, userId);
  await logActivity(userId, { action: "quote.delete", entity: "quote", summary: "Moved a quote request to the bin" });
  revalidatePath("/admin/quotes");
  redirect("/admin/quotes");
}

export type QuoteEmailState = { ok: boolean; message: string; at?: number } | null;

/** Email the client from a quote request. Saves the email in the quote's history. */
export async function sendQuoteEmail(id: string, _prev: QuoteEmailState, formData: FormData): Promise<QuoteEmailState> {
  const { userId } = await requireAdmin();
  const subject = String(formData.get("subject") ?? "").trim().slice(0, 200);
  const body = String(formData.get("body") ?? "").trim().slice(0, 10000);
  const markContacted = formData.get("mark_contacted") === "on";
  if (!subject || body.length < 5) return { ok: false, message: "Add a subject and a message." };

  const [q] = await sql`select id, reference, name, email, status, locale from quote_requests where id = ${id}`;
  if (!q) return { ok: false, message: "This quote request no longer exists." };

  const replyTo = process.env.EMAIL_REPLY_TO || process.env.ADMIN_EMAIL || site.email;
  const result = await deliverEmail({
    to: q.email,
    subject,
    heading: subject,
    body,
    replyTo,
    cta: {
      label: q.locale === "bn" ? "উত্তর দিন" : "Reply",
      url: `mailto:${replyTo}?subject=${encodeURIComponent(`Re: ${subject}`)}`,
    },
  });

  await sql`
    insert into quote_messages (quote_id, sender_id, subject, body, status, error, provider_id)
    values (${id}, ${userId}, ${subject}, ${body}, ${result.ok ? "sent" : "failed"}, ${result.ok ? null : result.error}, ${result.ok ? result.id : null})
  `.catch((error) => {
    // Table not migrated yet: the email still goes out; only the history is skipped.
    if ((error as { code?: string })?.code !== "42P01") throw error;
  });

  if (!result.ok) {
    revalidatePath(`/admin/quotes/${id}`);
    return { ok: false, message: `Not sent: ${result.error}` };
  }

  if (markContacted && q.status === "new") {
    await sql`update quote_requests set status = 'contacted', updated_at = now() where id = ${id}`;
  }
  await logActivity(userId, { action: "quote.email", entity: "quote", summary: `Emailed ${q.name} about ${q.reference}` });
  revalidatePath("/admin/quotes");
  revalidatePath(`/admin/quotes/${id}`);
  return { ok: true, message: `Email sent to ${q.email}.`, at: Date.now() };
}
