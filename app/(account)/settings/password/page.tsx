import type { Metadata } from "next";

import ForgotPasswordFlow from "@/app/(auth)/forgot-password/forgot-password-flow";
import AccountHeader from "@/app/components/account-header";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Reset password — Nirdeshona Web", robots: { index: false } };

export default async function ResetPasswordPage() {
  const user = await requireUser("/settings/password");
  return (
    <div className="flex flex-col gap-8 px-4 py-8 sm:px-6 lg:px-0">
      <AccountHeader
        title="Reset password"
        description="Forgot your current password, or signed up with Google? Verify with an email code and set a new one."
        crumbs={[{ label: "Settings", href: "/settings" }, { label: "Reset password" }]}
      />
      <ForgotPasswordFlow accountEmail={user.email} />
    </div>
  );
}
