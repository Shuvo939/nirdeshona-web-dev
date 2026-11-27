import postgres from "postgres";
import { waitUntil } from "@vercel/functions";

declare global {
  // eslint-disable-next-line no-var
  var __pgClient: ReturnType<typeof postgres> | undefined;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set — check your .env.local");
}

const IDLE_SECONDS = 5;

/*
 * Vercel Fluid suspends an instance right after the response. A pooled socket
 * that is still open at that moment is often dead when the instance wakes, and
 * the next query then hangs until the 300s function timeout. Same idea as
 * @vercel/functions' attachDatabasePool (which doesn't know postgres.js): after
 * each query keep the function alive until the idle connections have closed.
 */
let idleUntil = 0;
function holdUntilIdle() {
  if (!process.env.VERCEL) return;
  const deadline = Date.now() + (IDLE_SECONDS + 1) * 1000;
  if (deadline - idleUntil < 1000) return; // a recent hold already covers this
  idleUntil = deadline;
  try {
    waitUntil(new Promise((resolve) => setTimeout(resolve, deadline - Date.now())));
  } catch {
    /* outside a request (build): nothing to hold */
  }
}

export const sql =
  global.__pgClient ??
  postgres(connectionString, {
    prepare: false,
    max: 5,
    idle_timeout: IDLE_SECONDS,
    max_lifetime: 60 * 10,
    connect_timeout: 10,
    // Pipeline at most one extra query per connection (default is 100).
    // Supabase's transaction-mode pooler left server connections waiting for
    // half-sent queries when a page fired ~30 queries at once, which froze the
    // site. Not 0: postgres.js reserves the connection for sql.begin() in the
    // same code path, so 0 makes every transaction fail (UNSAFE_TRANSACTION).
    ...({ max_pipeline: 1 } as object), // supported at runtime, missing from the types
    debug: holdUntilIdle,
  });

if (process.env.NODE_ENV !== "production") {
  global.__pgClient = sql;
}
