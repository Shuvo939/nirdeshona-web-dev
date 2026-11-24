"use server";

import { logActivity } from "@/lib/audit";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { FormState } from "@/app/(account)/client/actions";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getSessionUser } from "@/lib/auth/session";
import { sql } from "@/lib/db";
import { getTicket, notifyTicketActivity } from "@/lib/tickets";
import { parseAttachmentField } from "@/lib/tickets/attachments";
import { discardUnsentAttachments, insertAttachments, verifyAttachments } from "@/lib/tickets/save-attachments";

const STATUSES = ["OPEN", "IN_PROGRESS", "WAITING_FOR_CLIENT", "RESOLVED", "CLOSED"] as const;
const PRIORITIES = ["LOW", "NORMAL", "HIGH", "URGENT"] as const;

const STATUS_LABELS: Record<string, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  WAITING_FOR_CLIENT: "Waiting for your reply",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

export async function replyToTicket(ticketId: string, prev: FormState, formData: FormData): Promise<FormState> {
  const result = await replyToTicketInner(ticketId, prev, formData);
  if (result.error || result.fieldErrors) {
    const user = await getSessionUser();
    if (user) await discardUnsentAttachments(formData.get("attachments"), ticketId, user.id);
  }
  return result;
}

async function replyToTicketInner(ticketId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const { userId: actorId } = await requireAdmin();
  const user = (await getSessionUser())!;
  const ticket = await getTicket(ticketId);
  if (!ticket) return { error: "Ticket not found." };

  const message = String(formData.get("message") ?? "").trim();
  if (!message) return { fieldErrors: { message: "Write a message first" } };
  if (message.length > 5000) return { fieldErrors: { message: "Message is too long" } };

  const parsedStatus = z.enum(STATUSES).safeParse(formData.get("nextStatus"));
  const nextStatus = parsedStatus.success ? parsedStatus.data : "WAITING_FOR_CLIENT";

  const attachments = parseAttachmentField(formData.get("attachments"));
  if ("error" in attachments) return { error: attachments.error };
  const verified = await verifyAttachments(attachments, ticketId, user.id);
  if (!verified.ok) return { error: verified.error };

  await sql.begin(async (tx) => {
    const [msg] = await tx`
      insert into ticket_messages (ticket_id, sender_id, message) values (${ticketId}, ${user.id}, ${message}) returning id
    `;
    await insertAttachments(tx, msg.id, verified.files);
  });
  await sql`update support_tickets set updated_at = now(), status = ${nextStatus}::ticket_status where id = ${ticketId}`;

  await notifyTicketActivity({ ticket, actor: user, kind: "reply", message });

  await logActivity(actorId, { action: "ticket.reply", entity: "ticket", summary: `Replied to ticket #${ticket.ticket_number}` });
  revalidatePath(`/admin/tickets/${ticketId}`);
  revalidatePath("/admin/tickets");
  return { ok: true };
}

export async function updateTicketMeta(ticketId: string, formData: FormData) {
  const { userId: actorId } = await requireAdmin();
  const user = (await getSessionUser())!;
  const ticket = await getTicket(ticketId);
  if (!ticket) return;

  const status = z.enum(STATUSES).safeParse(formData.get("status"));
  const priority = z.enum(PRIORITIES).safeParse(formData.get("priority"));
  if (!status.success || !priority.success) return;

  await sql`
    update support_tickets
    set status = ${status.data}::ticket_status, priority = ${priority.data}::ticket_priority, updated_at = now()
    where id = ${ticketId}
  `;

  if (status.data !== ticket.status) {
    await notifyTicketActivity({
      ticket,
      actor: user,
      kind: "status",
      message: `Status changed to “${STATUS_LABELS[status.data]}”.`,
    });
  }

  await logActivity(actorId, { action: "ticket.update", entity: "ticket", summary: `Updated ticket #${ticket.ticket_number}` });
  revalidatePath(`/admin/tickets/${ticketId}`);
  revalidatePath("/admin/tickets");
}
