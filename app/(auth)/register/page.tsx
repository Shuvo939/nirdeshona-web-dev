import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth/session";
import { createCaptcha } from "@/lib/captcha";
import { msg } from "@/lib/i18n/server";

import RegisterForm from "./register-form";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await msg("Create account — Nirdeshona Web", "অ্যাকাউন্ট খুলুন — নির্দেশনা ওয়েব"), robots: { index: false } };
}
export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  if (await getSessionUser()) redirect("/account");
  return <RegisterForm initialCaptcha={createCaptcha()} />;
}
