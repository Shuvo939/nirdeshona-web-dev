import type { Metadata } from "next";
import { KeyRound, LogOut, Mail, ShieldCheck } from "lucide-react";

import { signOutEverywhere } from "@/app/account-actions";
import AccountHeader from "@/app/components/account-header";
import { formatDate } from "@/app/components/marketing";
import { requireUser } from "@/lib/auth/session";

import { EmailForm, PasswordForm } from "./security-forms";
import SubmitButton from "@/app/components/submit-button";
import { getI18n, msg } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await msg("Settings — Nirdeshona Web", "সেটিংস — নির্দেশনা ওয়েব"), robots: { index: false } };
}

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ password?: string }> }) {
  const { L, locale } = await getI18n();
  const user = await requireUser("/settings");
  const { password } = await searchParams;

  return (
    <div className="flex flex-col gap-8 px-4 py-8 sm:px-6 lg:px-0">
      <AccountHeader
        title={L("Account settings", "অ্যাকাউন্ট সেটিংস")}
        description={L("Manage your sign-in details and security.", "আপনার লগ ইন তথ্য ও নিরাপত্তা পরিচালনা করুন।")}
        crumbs={[{ label: L("Settings", "সেটিংস") }]}
      />
      <section className="flex max-w-3xl flex-col gap-6">
        {password === "updated" && (
          <div role="status" className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            <ShieldCheck className="h-4 w-4" /> {L("Your password was reset successfully.", "আপনার পাসওয়ার্ড সফলভাবে রিসেট হয়েছে।")}
          </div>
        )}
        <Card icon={<ShieldCheck className="h-5 w-5" />} title={L("Account", "অ্যাকাউন্ট")} description={L("Basic information about your account.", "আপনার অ্যাকাউন্টের মৌলিক তথ্য।")}>
          <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs text-neutral-500">{L("Email", "ইমেইল")}</dt>
              <dd className="mt-0.5 break-all font-medium text-neutral-900">{user.email}</dd>
            </div>
            <div>
              <dt className="text-xs text-neutral-500">{L("Account type", "অ্যাকাউন্টের ধরন")}</dt>
              <dd className="mt-0.5 font-medium capitalize text-neutral-900">{user.role === "ADMIN" ? L("admin", "অ্যাডমিন") : L("member", "সদস্য")}</dd>
            </div>
            <div>
              <dt className="text-xs text-neutral-500">{L("Member since", "সদস্য হয়েছেন")}</dt>
              <dd className="mt-0.5 font-medium text-neutral-900">{formatDate(user.createdAt, false, locale)}</dd>
            </div>
          </dl>
        </Card>

        <Card icon={<KeyRound className="h-5 w-5" />} title={L("Password", "পাসওয়ার্ড")} description={L("Use at least 8 characters. A passphrase is best.", "কমপক্ষে ৮ অক্ষর ব্যবহার করুন। একটি বাক্যাংশ সবচেয়ে ভালো।")}>
          <PasswordForm email={user.email} />
        </Card>

        <Card icon={<Mail className="h-5 w-5" />} title={L("Email address", "ইমেইল ঠিকানা")} description={L("We'll send a confirmation link to the new address.", "নতুন ঠিকানায় একটি নিশ্চিতকরণ লিংক পাঠানো হবে।")}>
          <EmailForm email={user.email} />
        </Card>

        <Card icon={<LogOut className="h-5 w-5" />} title={L("Sessions", "সেশন")} description={L("Signed in on a shared or lost device? Sign out everywhere.", "শেয়ার করা বা হারানো ডিভাইসে লগ ইন আছে? সব জায়গা থেকে লগ আউট করুন।")}>
          <form action={signOutEverywhere}>
            <SubmitButton pendingText={L("Signing out…", "লগ আউট হচ্ছে…")} icon={<LogOut className="h-4 w-4" />} className="inline-flex h-11 items-center gap-2 rounded-full border border-red-200 bg-red-50 px-5 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-70">
              {L("Sign out of all devices", "সব ডিভাইস থেকে লগ আউট করুন")}
            </SubmitButton>
          </form>
        </Card>
      </section>
    </div>
  );
}

function Card({ icon, title, description, children }: { icon: React.ReactNode; title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-5 sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700">{icon}</div>
        <div>
          <h2 className="text-base font-semibold text-neutral-950">{title}</h2>
          <p className="text-sm text-neutral-500">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}
