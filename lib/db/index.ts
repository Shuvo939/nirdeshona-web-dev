import postgres from "postgres";
import { waitUntil } from "@vercel/functions";
import { getCloudflareContext } from "@opennextjs/cloudflare";

type Sql = ReturnType<typeof postgres>;

declare global {
  // eslint-disable-next-line no-var
  var __pgClient: Sql | undefined;
}

const IDLE_SECONDS = 5;

/** True when running inside Cloudflare Workers (workerd), false on Node/Vercel. */
const onWorkers = typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers";

const baseOptions = {
  prepare: false,
  connect_timeout: 10,
  // Pipeline at most one extra query per connection (default is 100).
  // Supabase's transaction-mode pooler left server connections waiting for
  // half-sent queries when a page fired ~30 queries at once, which froze the
  // site. Not 0: postgres.js reserves the connection for sql.begin() in the
  // same code path, so 0 makes every transaction fail (UNSAFE_TRANSACTION).
  ...({ max_pipeline: 1 } as object), // supported at runtime, missing from the types
} satisfies postgres.Options<Record<string, postgres.PostgresType>>;

/* ------------------------------------------------------------------ Node / Vercel */

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

function nodeClient(): Sql {
  if (global.__pgClient) return global.__pgClient;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set — check your .env.local");
  const client = postgres(url, {
    ...baseOptions,
    max: 5,
    idle_timeout: IDLE_SECONDS,
    max_lifetime: 60 * 10,
    debug: holdUntilIdle,
  });
  global.__pgClient = client;
  return client;
}

/* ------------------------------------------------------------------ Cloudflare Workers */

/*
 * Workers can't reuse a socket opened by another request, so each request gets
 * its own small client. Hyperdrive keeps the real Postgres connections pooled
 * near the database, so a new client per request is cheap.
 */
const perRequest = new WeakMap<object, Sql>();

function workersClient(): Sql {
  const { env, ctx } = getCloudflareContext();
  const key = ctx as object;
  const existing = perRequest.get(key);
  if (existing) return existing;
  const url = (env as { HYPERDRIVE?: { connectionString: string } }).HYPERDRIVE?.connectionString ?? process.env.DATABASE_URL;
  if (!url) throw new Error("No database: add the HYPERDRIVE binding (or DATABASE_URL) to the Worker");
  const client = postgres(url, { ...baseOptions, max: 5, idle_timeout: 2 });
  perRequest.set(key, client);
  return client;
}

function current(): Sql {
  return onWorkers ? workersClient() : nodeClient();
}

/**
 * The app's SQL client. Same API as postgres.js (`sql\`...\``, `sql(identifier)`,
 * `sql.begin`, `sql.unsafe`, …); the actual connection is chosen per runtime.
 */
export const sql: Sql = new Proxy(function () {} as unknown as Sql, {
  apply(_target, _this, args) {
    return (current() as unknown as (...a: unknown[]) => unknown)(...args);
  },
  get(_target, prop) {
    const client = current() as unknown as Record<PropertyKey, unknown>;
    const value = client[prop];
    return typeof value === "function" ? (value as (...a: unknown[]) => unknown).bind(client) : value;
  },
});
