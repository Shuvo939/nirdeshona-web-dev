import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth/session";
import { sql } from "@/lib/db";
import { hasR2, presignPrivateGet } from "@/lib/r2";
import { canAccessTicket, getTicket } from "@/lib/tickets";

export const runtime = "nodejs";

// Access-checked download: redirects to a 5-minute signed R2 URL.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(new URL(request.url).pathname)}`, request.url));
  if (!/^[0-9a-f-]{36}$/i.test(id) || !hasR2()) return new NextResponse("Not found", { status: 404 });

  const [file] = await sql`
    select a.file_key, a.file_name, a.mime_type, m.ticket_id
    from ticket_attachments a
    join ticket_messages m on m.id = a.ticket_message_id
    where a.id = ${id}
  `;
  if (!file) return new NextResponse("Not found", { status: 404 });

  const ticket = await getTicket(file.ticket_id);
  if (!ticket || !(await canAccessTicket(user, ticket))) return new NextResponse("Not found", { status: 404 });

  const inline = String(file.mime_type).startsWith("image/") || file.mime_type === "application/pdf";
  const url = await presignPrivateGet(file.file_key, file.file_name, inline);
  return NextResponse.redirect(url, { headers: { "Cache-Control": "private, no-store" } });
}
