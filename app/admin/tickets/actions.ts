"use server";

import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";
import { revalidatePath } from "next/cache";

export async function replyToTicket(ticketId: string, formData: FormData) {
  const { userId } = await requireAdmin();
  const message = String(formData.get("message") ?? "").trim();
  if (!message) return;

  await sql`
    insert into ticket_messages (ticket_id, sender_id, message)
    values (${ticketId}, ${userId}, ${message})
  `;

  await sql`update support_tickets set updated_at = now() where id = ${ticketId}`;

  revalidatePath(`/admin/tickets/${ticketId}`);
}

export async function updateTicketStatus(ticketId: string, formData: FormData) {
  await requireAdmin();
  const status = String(formData.get("status"));

  await sql`
    update support_tickets set status = ${status}, updated_at = now() where id = ${ticketId}
  `;

  revalidatePath(`/admin/tickets/${ticketId}`);
  revalidatePath("/admin/tickets");
}
