import { NextResponse } from "next/server";
import { z } from "zod";

import { friendlyAuthError } from "@/lib/auth/errors";
import { verifyCaptcha } from "@/lib/captcha";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const Schema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name").max(100),
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z.string().min(8, "Password must be at least 8 characters long").max(200),
  captchaToken: z.string(),
  captchaAnswer: z.string(),
});

export async function POST(request: Request) {
  const parsed = Schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
  const { fullName, email, password, captchaToken, captchaAnswer } = parsed.data;

  const captcha = await verifyCaptcha(captchaToken, captchaAnswer);
  if (!captcha.ok) return NextResponse.json({ error: captcha.error, captcha: true }, { status: 400 });

  const origin = new URL(request.url).origin;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName }, emailRedirectTo: `${origin}/auth/callback?next=/account` },
  });
  if (error) return NextResponse.json({ error: friendlyAuthError(error.message) }, { status: 400 });

  return NextResponse.json({ ok: true, needsConfirmation: Boolean(data.user && !data.session) });
}
