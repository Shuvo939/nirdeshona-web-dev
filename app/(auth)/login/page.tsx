import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth/session";
import { createCaptcha } from "@/lib/captcha";
import { msg } from "@/lib/i18n/server";

import LoginForm from "./login-form";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await msg("Log in — Nirdeshona Web", "লগ ইন — নির্দেশনা ওয়েব"), robots: { index: false } };
}
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getSessionUser()) redirect("/account");
  // First challenge is rendered on the server so it shows instantly.
  return <LoginForm initialCaptcha={createCaptcha()} />;
}
