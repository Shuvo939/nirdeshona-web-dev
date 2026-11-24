import { NextResponse } from "next/server";
import { z } from "zod";

import { friendlyAuthError } from "@/lib/auth/errors";
import { verifyCaptcha } from "@/lib/captcha";
import { REMEMBER_COOKIE } from "@/lib/supabase/remember";
import { createClient } from "@/lib/supabase/server";
import { syncClientAccessForUser } from "@/lib/clients/access";

export const runtime = "nodejs";

const Schema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z.string().min(1, "Enter your password").max(200),
  remember: z.boolean().default(true),
  captchaToken: z.string(),
  captchaAnswer: z.string(),
});

export async function POST(request: Request) {
  const parsed = Schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
  const { email, password, remember, captchaToken, captchaAnswer } = parsed.data;

  const captcha = await verifyCaptcha(captchaToken, captchaAnswer);
  if (!captcha.ok) return NextResponse.json({ error: captcha.error, captcha: true }, { status: 400 });

  // Session cookies are written with (or without) a lifetime depending on "Remember me".
  const supabase = await createClient({ persistent: remember });
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return NextResponse.json({ error: friendlyAuthError(error.message) }, { status: 401 });
  if (data.user) await syncClientAccessForUser(data.user.id);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(REMEMBER_COOKIE, remember ? "1" : "0", {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: false, // the browser Supabase client reads it when refreshing tokens
    ...(remember ? { maxAge: 400 * 24 * 60 * 60 } : {}),
  });
  return response;
}
