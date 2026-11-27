import "server-only";

import { createHash } from "node:crypto";

import { sql } from "@/lib/db";

/** Client IP from the proxy headers, hashed so raw IPs are never stored. */
export function ipHash(headers: Headers) {
  const ip = headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "unknown";
  return createHash("sha256").update(`${ip}:${process.env.AUTH_SECRET ?? ""}`).digest("hex").slice(0, 32);
}

/**
 * Fixed-window limit backed by Postgres, so it holds across serverless instances.
 * Returns true when the call is allowed (and records it). Fails open if the
 * table is missing or the database is unreachable, so a limiter outage never
 * blocks real visitors.
 */
export async function allowRequest(bucket: string, key: string, limit: number, windowSeconds: number) {
  try {
    const [row] = await sql`
      with recent as (
        select count(*)::int as n from rate_limit_hits
        where bucket = ${bucket} and key = ${key} and created_at > now() - make_interval(secs => ${windowSeconds})
      ), ins as (
        insert into rate_limit_hits (bucket, key)
        select ${bucket}, ${key} where (select n from recent) < ${limit}
        returning 1
      )
      select (select n from recent) as n, exists (select 1 from ins) as allowed
    `;
    // Occasionally clear old rows so the table stays small.
    if (Math.random() < 0.01) void sql`delete from rate_limit_hits where created_at < now() - interval '2 days'`.catch(() => undefined);
    return Boolean(row?.allowed);
  } catch {
    return true;
  }
}
