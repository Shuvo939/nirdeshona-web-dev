import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth/session";

import ForgotPasswordFlow from "./forgot-password-flow";

export const metadata: Metadata = { title: "Forgot password — Nirdeshona Web" };

export default async function ForgotPasswordPage() {
  // Signed-in users reset their password from inside the account area.
  if (await getSessionUser()) redirect("/settings/password");
  return <ForgotPasswordFlow />;
}
