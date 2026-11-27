import { NextResponse } from "next/server";
import { z } from "zod";

import { syncClientAccessForUser } from "@/lib/clients/access";
import { allowRequest, ipHash } from "@/lib/rate-limit";
import { isAllowedOrigin } from "@/lib/same-origin";
import { REMEMBER_COOKIE } from "@/lib/supabase/remember";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const Schema = z.object({
  credential: z.string().min(20).max(4096),
  nonce: z.string().min(16).max(128),
});

/**
 * Google's own button (Google Identity Services) returns an ID token in the
 * browser; it is exchanged here for a Supabase session. The consent popup then
 * shows web.nirdeshona.com instead of the Supabase project address.
 */
export async function POST(request: Request) {
  if (!isAllowedOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (!(await allowRequest("google-login", ipHash(request.headers), 30, 600))) {
    return NextResponse.json({ error: "Too many attempts. Please wait a few minutes." }, { status: 429 });
  }
  const parsed = Schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Google sign-in didn't complete. Please try again." }, { status: 400 });

  // Google sign-ins stay signed in, like "Remember me".
  const supabase = await createClient({ persistent: true });
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: "google",
    token: parsed.data.credential,
    nonce: parsed.data.nonce,
  });
  if (error || !data.user) {
    console.warn("[auth] Google ID token sign-in failed:", error?.code ?? error?.message);
    return NextResponse.json({ error: "Google sign-in didn't complete. Please try again." }, { status: 401 });
  }
  await syncClientAccessForUser(data.user.id);

  const isNew = Date.now() - new Date(data.user.created_at).getTime() < 60_000;
  const response = NextResponse.json({ ok: true, isNew });
  response.cookies.set(REMEMBER_COOKIE, "1", {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: false,
    maxAge: 400 * 24 * 60 * 60,
  });
  return response;
}
