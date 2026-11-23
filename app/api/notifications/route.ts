import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth/session";
import { sql } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [items, [{ unread }]] = await Promise.all([
    sql`
      select id, title, message, link, read_at, created_at
      from notifications where user_id = ${user.id}
      order by created_at desc limit 8
    `,
    sql`select count(*)::int as unread from notifications where user_id = ${user.id} and read_at is null`,
  ]);

  return NextResponse.json({ items, unread }, { headers: { "Cache-Control": "private, no-store" } });
}

// Mark all as read (or a single one with ?id=).
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");

  if (id && /^[0-9a-f-]{36}$/i.test(id)) {
    await sql`update notifications set read_at = now() where id = ${id} and user_id = ${user.id} and read_at is null`;
  } else {
    await sql`update notifications set read_at = now() where user_id = ${user.id} and read_at is null`;
  }
  return NextResponse.json({ ok: true });
}
