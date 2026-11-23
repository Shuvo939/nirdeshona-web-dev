"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getSessionUser } from "@/lib/auth/session";
import { sql } from "@/lib/db";
import { canAccessTicket, getTicket, notifyTicketActivity } from "@/lib/tickets";
import { parseAttachmentField } from "@/lib/tickets/attachments";
import { insertAttachments, verifyAttachments } from "@/lib/tickets/save-attachments";

export type FormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  ok?: boolean;
};

const NewTicketSchema = z.object({
  clientId: z.string().uuid("Choose an organisation"),
  projectId: z.union([z.string().uuid(), z.literal("")]).optional(),
  subject: z.string().trim().min(4, "Subject must be at least 4 characters").max(160, "Subject is too long"),
  message: z.string().trim().min(10, "Please describe the issue in a little more detail").max(5000, "Message is too long"),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]),
});

function fieldErrors(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export async function createTicket(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getSessionUser();
  if (!user) return { error: "Please sign in again." };

  const parsed = NewTicketSchema.safeParse({
    clientId: formData.get("clientId"),
    projectId: formData.get("projectId") ?? "",
    subject: formData.get("subject"),
    message: formData.get("message"),
    priority: formData.get("priority") ?? "NORMAL",
  });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  const { clientId, projectId, subject, message, priority } = parsed.data;

  const [membership] = await sql`
    select 1 from client_members where client_id = ${clientId} and user_id = ${user.id}
  `;
  if (!membership && user.role !== "ADMIN") return { error: "You don't have access to that organisation." };

  if (projectId) {
    const [project] = await sql`select 1 from projects where id = ${projectId} and client_id = ${clientId}`;
    if (!project) return { fieldErrors: { projectId: "That project doesn't belong to this organisation." } };
  }

  // Simple rate limit: max 5 new tickets per user per hour.
  const [{ recent }] = await sql`
    select count(*)::int as recent from support_tickets
    where created_by = ${user.id} and created_at > now() - interval '1 hour'
  `;
  if (recent >= 5) return { error: "You've opened several tickets recently. Please wait a little before opening another." };

  const attachments = parseAttachmentField(formData.get("attachments"));
  if ("error" in attachments) return { error: attachments.error };
  // No ticket id yet, so only the user's own upload prefix is allowed.
  const verified = await verifyAttachments(attachments, "00000000-0000-0000-0000-000000000000", user.id);
  if (!verified.ok) return { error: verified.error };

  const ticket = await sql.begin(async (tx) => {
    const [row] = await tx`
      insert into support_tickets (client_id, project_id, created_by, subject, priority)
      values (${clientId}, ${projectId || null}, ${user.id}, ${subject}, ${priority})
      returning id, ticket_number, client_id, subject
    `;
    const [msg] = await tx`
      insert into ticket_messages (ticket_id, sender_id, message)
      values (${row.id}, ${user.id}, ${message})
      returning id
    `;
    await insertAttachments(tx, msg.id, verified.files);
    return row;
  });

  await notifyTicketActivity({
    ticket: ticket as never,
    actor: user,
    kind: "created",
    message,
  });

  revalidatePath("/client");
  redirect(`/client/tickets/${ticket.id}`);
}

const ReplySchema = z.object({
  message: z.string().trim().min(1, "Write a message first").max(5000, "Message is too long"),
});

export async function replyToTicketAsClient(ticketId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getSessionUser();
  if (!user) return { error: "Please sign in again." };

  const ticket = await getTicket(ticketId);
  if (!ticket || !(await canAccessTicket(user, ticket))) return { error: "Ticket not found." };
  if (ticket.status === "CLOSED") return { error: "This ticket is closed. Reopen it to reply." };

  const parsed = ReplySchema.safeParse({ message: formData.get("message") });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  const attachments = parseAttachmentField(formData.get("attachments"));
  if ("error" in attachments) return { error: attachments.error };
  const verified = await verifyAttachments(attachments, ticket.id, user.id);
  if (!verified.ok) return { error: verified.error };

  await sql.begin(async (tx) => {
    const [msg] = await tx`
      insert into ticket_messages (ticket_id, sender_id, message)
      values (${ticket.id}, ${user.id}, ${parsed.data.message})
      returning id
    `;
    await insertAttachments(tx, msg.id, verified.files);
  });
  // A client reply moves "waiting for client" / "resolved" back to open.
  await sql`
    update support_tickets
    set updated_at = now(),
        status = case when status in ('WAITING_FOR_CLIENT', 'RESOLVED') then 'OPEN'::ticket_status else status end
    where id = ${ticket.id}
  `;

  await notifyTicketActivity({ ticket, actor: user, kind: "reply", message: parsed.data.message });

  revalidatePath(`/client/tickets/${ticket.id}`);
  revalidatePath("/client");
  return { ok: true };
}

export async function setTicketClosed(ticketId: string, closed: boolean) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const ticket = await getTicket(ticketId);
  if (!ticket || !(await canAccessTicket(user, ticket))) redirect("/client");

  await sql`
    update support_tickets
    set status = ${closed ? "CLOSED" : "OPEN"}::ticket_status, updated_at = now()
    where id = ${ticket.id}
  `;

  await notifyTicketActivity({
    ticket,
    actor: user,
    kind: "status",
    message: closed ? "The client closed this ticket." : "The client reopened this ticket.",
  });

  revalidatePath(`/client/tickets/${ticket.id}`);
  revalidatePath("/client");
}

export async function markNotificationsRead() {
  const user = await getSessionUser();
  if (!user) return;
  await sql`update notifications set read_at = now() where user_id = ${user.id} and read_at is null`;
  revalidatePath("/notifications");
}
