import { sql } from "@/lib/db";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { z } from "zod";
import { NextResponse } from "next/server";

const TicketSchema = z.object({
  clientId: z.string().uuid(),
  subject: z.string().min(1),
  message: z.string().min(1),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
});

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = TicketSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { clientId, subject, message, priority } = parsed.data;

  // Confirm the user actually belongs to this client before writing anything
  const [membership] = await sql`
    select 1 from client_members where client_id = ${clientId} and user_id = ${user.id}
  `;
  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [ticket] = await sql`
    insert into support_tickets (client_id, created_by, subject, priority)
    values (${clientId}, ${user.id}, ${subject}, ${priority})
    returning id, ticket_number
  `;

  await sql`
    insert into ticket_messages (ticket_id, sender_id, message)
    values (${ticket.id}, ${user.id}, ${message})
  `;

  return NextResponse.json({ ok: true, ticket });
}
