// Worker entry: the OpenNext handler plus a scheduled() hook for cron triggers.
// Copied into .open-next/ by the cf:build script.
// @ts-ignore — generated at build time
import handler from "./worker.js";

export default {
  fetch: handler.fetch,

  // Nightly Bin purge — calls the same route Vercel's cron used to call.
  async scheduled(event, env, ctx) {
    const url = new URL("/api/cron/purge-bin", env.SITE_URL || "https://web.nirdeshona.com");
    // Handled in-process by this Worker; no network round trip.
    const req = new Request(url, { headers: { authorization: `Bearer ${env.CRON_SECRET ?? ""}` } });
    ctx.waitUntil(
      handler.fetch(req, env, ctx).then(async (res) => {
        console.log(`cron ${event.cron}: purge-bin ${res.status} ${(await res.text()).slice(0, 200)}`);
      }),
    );
  },
};

// Re-export Durable Objects etc. if OpenNext adds any.
// @ts-ignore
export * from "./worker.js";
