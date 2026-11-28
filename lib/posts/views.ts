import "server-only";

import { createHmac } from "node:crypto";
import { headers } from "next/headers";

import { sql } from "@/lib/db";

/*
 * Cookie-free view counting.
 *
 * A reader is identified by a hash of (daily secret salt + IP + browser +
 * language). The salt changes every day (Asia/Dhaka) and is never stored, so
 * the hash can't be reversed into an IP or used to follow anyone from one day
 * to the next. No cookie is set, so no consent banner is needed for it.
 */
function dailyReaderId(h: Headers) {
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "";
  const ua = h.get("user-agent") ?? "";
  if (!ip && !ua) return null;
  // Skip obvious bots and link previews so they don't inflate counts.
  if (/bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|discord|curl|wget|python|headless/i.test(ua)) return null;

  const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka" }).format(new Date());
  const secret = process.env.AUTH_SECRET || process.env.DATABASE_URL || "nirdeshona";
  const salt = createHmac("sha256", secret).update(`reader-salt:${day}`).digest();
  const hex = createHmac("sha256", salt).update(`${ip}|${ua}|${h.get("accept-language") ?? ""}`).digest("hex");
  // post_view_tracking.visitor_id is a uuid column.
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

export async function trackPostView(postId: string) {
  const visitorId = dailyReaderId(await headers());
  if (!visitorId) return { counted: false };

  const result = await sql`
    insert into public.post_view_tracking (post_id, visitor_id, last_viewed_at)
    values (${postId}, ${visitorId}::uuid, now())
    on conflict (post_id, visitor_id)
    do update set last_viewed_at = now()
    where post_view_tracking.last_viewed_at <= now() - interval '12 hours'
    returning post_id
  `;

  // Same reader within the last 12 hours.
  if (result.length === 0) return { counted: false };

  await sql`update public.posts set views_count = views_count + 1 where id = ${postId}`;
  await sql`
    insert into public.post_views_daily (post_id, day, views)
    values (${postId}, (now() at time zone 'Asia/Dhaka')::date, 1)
    on conflict (post_id, day) do update set views = post_views_daily.views + 1
  `.catch(() => undefined); // analytics only — never break the page

  return { counted: true };
}
