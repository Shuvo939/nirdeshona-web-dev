import { NextResponse } from "next/server";
import { z } from "zod";

import { friendlyAuthError } from "@/lib/auth/errors";
import { getSessionUser } from "@/lib/auth/session";
import { verifyCaptcha } from "@/lib/captcha";
import { allowRequest, ipHash } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const Schema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(255),
  captchaToken: z.string().optional(),
  captchaAnswer: z.string().optional(),
});

// Sends the password-reset code. Signed-out visitors must pass the captcha;
// a signed-in user resetting their own password doesn't need to.
export async function POST(request: Request) {
  const parsed = Schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
  const { email, captchaToken, captchaAnswer } = parsed.data;

  const user = await getSessionUser();
  const ownEmail = user && user.email.toLowerCase() === email.toLowerCase();
  if (!ownEmail) {
    const captcha = await verifyCaptcha(captchaToken, captchaAnswer);
    if (!captcha.ok) return NextResponse.json({ error: captcha.error, captcha: true }, { status: 400 });
  }

  // Limit reset emails: 5 per visitor and 3 per address per hour.
  const okIp = await allowRequest("recover-ip", ipHash(request.headers), 5, 3600);
  const okEmail = okIp && (await allowRequest("recover-email", email.toLowerCase(), 3, 3600));
  if (!okIp || !okEmail) {
    return NextResponse.json({ error: "Too many reset requests. Please wait an hour and try again." }, { status: 429 });
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) return NextResponse.json({ error: friendlyAuthError(error.message) }, { status: 400 });
  return NextResponse.json({ ok: true });
}
