import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth/session";
import { createCaptcha } from "@/lib/captcha";

import LoginForm from "./login-form";

export const metadata: Metadata = { title: "Log in — Nirdeshona Web" };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getSessionUser()) redirect("/account");
  // First challenge is rendered on the server so it shows instantly.
  return <LoginForm initialCaptcha={createCaptcha()} />;
}
