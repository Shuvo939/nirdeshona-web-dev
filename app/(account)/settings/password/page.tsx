import type { Metadata } from "next";

import ForgotPasswordFlow from "@/app/(auth)/forgot-password/forgot-password-flow";
import AccountHeader from "@/app/components/account-header";
import { requireUser } from "@/lib/auth/session";
import { getI18n, msg } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await msg("Reset password — Nirdeshona Web", "পাসওয়ার্ড রিসেট — নির্দেশনা ওয়েব"), robots: { index: false } };
}

export default async function ResetPasswordPage() {
  const { L } = await getI18n();
  const user = await requireUser("/settings/password");
  return (
    <div className="flex flex-col gap-8 px-4 py-8 sm:px-6 lg:px-0">
      <AccountHeader
        title={L("Reset password", "পাসওয়ার্ড রিসেট")}
        description={L("Forgot your current password, or signed up with Google? Verify with an email code and set a new one.", "বর্তমান পাসওয়ার্ড ভুলে গেছেন, নাকি Google দিয়ে সাইন আপ করেছিলেন? ইমেইল কোড দিয়ে যাচাই করে নতুন পাসওয়ার্ড দিন।")}
        crumbs={[{ label: L("Settings", "সেটিংস"), href: "/settings" }, { label: L("Reset password", "পাসওয়ার্ড রিসেট") }]}
      />
      <ForgotPasswordFlow accountEmail={user.email} />
    </div>
  );
}
