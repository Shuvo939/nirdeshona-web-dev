import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getSessionUser } from "@/lib/auth/session";
import { hasR2, presignPrivatePut } from "@/lib/r2";
import { canAccessTicket, getTicket } from "@/lib/tickets";
import { ATTACHMENT_TYPES, MAX_ATTACHMENT_SIZE } from "@/lib/tickets/attachments";

export const runtime = "nodejs";

const Schema = z.object({
  ticketId: z.string().uuid().optional(),
  fileName: z.string().trim().min(1).max(200),
  contentType: z.string().refine((t) => t in ATTACHMENT_TYPES, "This file type isn't allowed."),
  size: z.number().int().positive().max(MAX_ATTACHMENT_SIZE, "Files must be 10 MB or smaller."),
});

// Step 1 of the upload flow: check access + validate, then hand the browser
// a short-lived presigned PUT URL so the file goes straight to R2.
// With a ticketId the key lives under that ticket; without one (a ticket
// that isn't created yet) it lives under the user's own upload prefix.
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  if (!hasR2()) return NextResponse.json({ error: "File uploads aren't configured yet." }, { status: 503 });

  const parsed = Schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid file." }, { status: 400 });
  }
  const { ticketId, contentType, size } = parsed.data;

  let prefix = `uploads/${user.id}`;
  if (ticketId) {
    const ticket = await getTicket(ticketId);
    if (!ticket || !(await canAccessTicket(user, ticket))) {
      return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
    }
    if (ticket.status === "CLOSED") return NextResponse.json({ error: "This ticket is closed." }, { status: 400 });
    prefix = `tickets/${ticket.id}`;
  }

  const key = `${prefix}/${crypto.randomUUID()}.${ATTACHMENT_TYPES[contentType]}`;
  const uploadUrl = await presignPrivatePut(key, contentType, size);
  return NextResponse.json({ key, uploadUrl });
}
