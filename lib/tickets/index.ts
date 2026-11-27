import { sql } from "@/lib/db";
import { notifyUsers } from "@/lib/notifications";
import type { SessionUser } from "@/lib/auth/session";
import { sendEmail } from "@/lib/email";
import { site } from "@/lib/site";

export type TicketRow = {
  id: string;
  ticket_number: number;
  client_id: string;
  client_name: string;
  project_id: string | null;
  project_title: string | null;
  subject: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  created_by_name: string | null;
};

export type TicketMessage = {
  id: string;
  message: string;
  created_at: string;
  sender_id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  attachments: { id: string; name: string; size: number; type: string; url: string }[];
};

export async function getTicket(ticketId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(ticketId)) return null;
  const [ticket] = await sql`
    select t.id, t.ticket_number, t.client_id, c.name as client_name, t.project_id, p.title as project_title,
           t.subject, t.status, t.priority, t.created_at, t.updated_at, pr.full_name as created_by_name
    from support_tickets t
    join clients c on c.id = t.client_id
    left join projects p on p.id = t.project_id
    left join profiles pr on pr.id = t.created_by
    where t.id = ${ticketId}
    limit 1
  `;
  return (ticket as unknown as TicketRow) ?? null;
}

export async function canAccessTicket(user: SessionUser, ticket: TicketRow) {
  if (user.role === "ADMIN") return true;
  const [row] = await sql`
    select 1 from client_members where client_id = ${ticket.client_id} and user_id = ${user.id}
  `;
  return Boolean(row);
}

export async function getTicketMessages(ticketId: string) {
  return (await sql`
    select m.id, m.message, m.created_at, m.sender_id, p.full_name, p.avatar_url, p.role,
      coalesce((
        select json_agg(json_build_object('id', a.id, 'name', a.file_name, 'size', a.file_size,
                                          'type', a.mime_type, 'url', a.file_url) order by a.created_at)
        from ticket_attachments a where a.ticket_message_id = m.id
      ), '[]'::json) as attachments
    from ticket_messages m
    join profiles p on p.id = m.sender_id
    where m.ticket_id = ${ticketId}
    order by m.created_at asc
  `) as unknown as TicketMessage[];
}

async function adminRecipients() {
  const rows = await sql`
    select p.id, u.email
    from profiles p
    join auth.users u on u.id = p.id
    where p.role = 'ADMIN'
  `;
  return rows as unknown as { id: string; email: string }[];
}

async function clientRecipients(clientId: string, excludeUserId: string) {
  const rows = await sql`
    select p.id, u.email
    from client_members cm
    join profiles p on p.id = cm.user_id
    join auth.users u on u.id = p.id
    where cm.client_id = ${clientId} and p.id <> ${excludeUserId}
  `;
  return rows as unknown as { id: string; email: string }[];
}

async function notify(userIds: string[], title: string, message: string, link: string) {
  await notifyUsers(userIds, { type: "ticket", title, message, link });
}

// Notify the "other side" of a ticket about new activity.
export async function notifyTicketActivity({
  ticket,
  actor,
  kind,
  message,
}: {
  ticket: Pick<TicketRow, "id" | "ticket_number" | "client_id" | "subject">;
  actor: SessionUser;
  kind: "created" | "reply" | "status";
  message: string;
}) {
  try {
    const toAdmins = actor.role !== "ADMIN";
    const recipients = toAdmins
      ? (await adminRecipients()).filter((r) => r.id !== actor.id)
      : await clientRecipients(ticket.client_id, actor.id);

    const link = toAdmins ? `/admin/tickets/${ticket.id}` : `/client/tickets/${ticket.id}`;
    const title =
      kind === "created"
        ? `New ticket #${ticket.ticket_number}: ${ticket.subject}`
        : kind === "reply"
          ? `New reply on #${ticket.ticket_number}`
          : `Ticket #${ticket.ticket_number} updated`;

    await notify(recipients.map((r) => r.id), title, message.slice(0, 200), link);

    await sendEmail({
      to: recipients.map((r) => r.email),
      subject: title,
      heading: title,
      body: `${actor.fullName || actor.email} wrote:\n\n${message}`,
      cta: { label: "Open ticket", url: `${site.url}${link}` },
    });
  } catch (error) {
    console.error("notifyTicketActivity failed", error);
  }
}
