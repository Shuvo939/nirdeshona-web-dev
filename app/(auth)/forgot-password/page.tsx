import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth/session";
import { createCaptcha } from "@/lib/captcha";
import { msg } from "@/lib/i18n/server";

import ForgotPasswordFlow from "./forgot-password-flow";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await msg("Forgot password — Nirdeshona Web", "পাসওয়ার্ড ভুলে গেছেন — নির্দেশনা ওয়েব"), robots: { index: false } };
}

export default async function ForgotPasswordPage() {
  // Signed-in users reset their password from inside the account area.
  if (await getSessionUser()) redirect("/settings/password");
  return <ForgotPasswordFlow initialCaptcha={createCaptcha()} />;
}
