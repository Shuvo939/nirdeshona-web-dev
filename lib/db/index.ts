import postgres from "postgres";

// Single shared connection (reused across requests in the same
// server runtime). No ORM — every query below is plain SQL via
// the `postgres` tagged-template client, which parameterizes
// values automatically (safe from SQL injection).
//
// Example usage:
//   import { sql } from "@/lib/db";
//   const posts = await sql`select * from posts where status = ${"published"}`;

declare global {
  // eslint-disable-next-line no-var
  var __pgClient: ReturnType<typeof postgres> | undefined;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set — check your .env.local");
}

export const sql =
  global.__pgClient ??
  postgres(connectionString, {
    prepare: false, // safer default for pooled connections (e.g. Supabase pooler/pgbouncer)
  });

if (process.env.NODE_ENV !== "production") {
  global.__pgClient = sql;
}
