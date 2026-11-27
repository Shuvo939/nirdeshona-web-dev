import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth/session";
import { sql } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f-]{36}$/i;
const noStore = { headers: { "Cache-Control": "private, no-store" } };

// List notifications: ?limit=10&before=<ISO date>&unread=1
export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = new URL(request.url).searchParams;
  const limit = Math.min(50, Math.max(1, Number(params.get("limit")) || 10));
  const beforeRaw = params.get("before");
  const before = beforeRaw && !Number.isNaN(Date.parse(beforeRaw)) ? new Date(beforeRaw) : null;
  const unreadOnly = params.get("unread") === "1";

  const [items, [{ unread }]] = await Promise.all([
    sql`
      select id, type, title, message, link, read_at, created_at
      from notifications
      where user_id = ${user.id}
        and (${before}::timestamptz is null or created_at < ${before})
        and (${unreadOnly} = false or read_at is null)
      order by created_at desc
      limit ${limit + 1}
    `,
    sql`select count(*)::int as unread from notifications where user_id = ${user.id} and read_at is null`,
  ]);

  return NextResponse.json({ items: items.slice(0, limit), hasMore: items.length > limit, unread }, noStore);
}

// Mark all as read, or a single one with ?id=.
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");

  if (id && UUID.test(id)) {
    await sql`update notifications set read_at = now() where id = ${id} and user_id = ${user.id} and read_at is null`;
  } else {
    await sql`update notifications set read_at = now() where user_id = ${user.id} and read_at is null`;
  }
  return NextResponse.json({ ok: true }, noStore);
}

// Remove one notification (?id=) or every read one (?read=1).
export async function DELETE(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const params = new URL(request.url).searchParams;
  const id = params.get("id");

  if (id && UUID.test(id)) {
    await sql`delete from notifications where id = ${id} and user_id = ${user.id}`;
  } else if (params.get("read") === "1") {
    await sql`delete from notifications where user_id = ${user.id} and read_at is not null`;
  } else {
    return NextResponse.json({ error: "Nothing to delete" }, { status: 400 });
  }
  return NextResponse.json({ ok: true }, noStore);
}
