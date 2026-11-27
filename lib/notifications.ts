import "server-only";

import { sql } from "@/lib/db";
import type { NotificationKind } from "@/lib/notifications-i18n";

type Notice = { type: NotificationKind; title: string; message?: string | null; link?: string | null };

/** In-app notifications. Best-effort: a failure here never breaks the user's action. */
export async function notifyUsers(userIds: string[], notice: Notice) {
  const ids = Array.from(new Set(userIds.filter(Boolean)));
  if (ids.length === 0) return;
  await sql`
    insert into notifications (user_id, type, title, message, link)
    select id, ${notice.type}, ${notice.title.slice(0, 200)}, ${notice.message?.slice(0, 280) ?? null}, ${notice.link ?? null}
    from unnest(${ids}::uuid[]) as id
  `.catch((error) => console.error("notifyUsers failed", error));
}

/** Every admin, except the person who triggered it. */
export async function notifyAdmins(notice: Notice, exceptUserId?: string | null) {
  const rows = await sql`select id from profiles where role = 'ADMIN'`.catch(() => [] as { id: string }[]);
  await notifyUsers(
    rows.map((r) => r.id as string).filter((id) => id !== exceptUserId),
    notice,
  );
}
