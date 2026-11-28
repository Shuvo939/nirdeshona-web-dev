import { NextResponse } from "next/server";

import { purgeExpiredTrash } from "@/lib/trash";

export const dynamic = "force-dynamic";

// Called daily by the Cloudflare Worker's cron trigger (wrangler.jsonc →
// cf-worker-entry.mjs) and, while the Vercel project still exists, by Vercel
// Cron (vercel.json). Both send "Authorization: Bearer $CRON_SECRET".
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Not allowed." }, { status: 401 });
  }
  const purged = await purgeExpiredTrash();
  return NextResponse.json({ ok: true, purged });
}
