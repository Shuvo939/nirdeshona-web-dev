import type { Metadata } from "next";
import { KeyRound, LogOut, Mail, ShieldCheck } from "lucide-react";

import { signOutEverywhere } from "@/app/account-actions";
import AccountHeader from "@/app/components/account-header";
import { formatDate } from "@/app/components/marketing";
import { requireUser } from "@/lib/auth/session";

import { EmailForm, PasswordForm } from "./security-forms";

export const metadata: Metadata = { title: "Settings — Nirdeshona Web", robots: { index: false } };

export default async function SettingsPage() {
  const user = await requireUser("/settings");

  return (
    <div className="flex flex-col gap-8 px-4 py-8 sm:px-6 lg:px-0">
      <AccountHeader
        title="Account settings"
        description="Manage your sign-in details and security."
        crumbs={[{ label: "Settings" }]}
      />
      <section className="flex max-w-3xl flex-col gap-6">
        <Card icon={<ShieldCheck className="h-5 w-5" />} title="Account" description="Basic information about your account.">
          <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs text-neutral-500">Email</dt>
              <dd className="mt-0.5 break-all font-medium text-neutral-900">{user.email}</dd>
            </div>
            <div>
              <dt className="text-xs text-neutral-500">Account type</dt>
              <dd className="mt-0.5 font-medium capitalize text-neutral-900">{user.role.toLowerCase()}</dd>
            </div>
            <div>
              <dt className="text-xs text-neutral-500">Member since</dt>
              <dd className="mt-0.5 font-medium text-neutral-900">{formatDate(user.createdAt)}</dd>
            </div>
          </dl>
        </Card>

        <Card icon={<KeyRound className="h-5 w-5" />} title="Password" description="Use at least 8 characters. A passphrase is best.">
          <PasswordForm email={user.email} />
        </Card>

        <Card icon={<Mail className="h-5 w-5" />} title="Email address" description="We'll send a confirmation link to the new address.">
          <EmailForm email={user.email} />
        </Card>

        <Card icon={<LogOut className="h-5 w-5" />} title="Sessions" description="Signed in on a shared or lost device? Sign out everywhere.">
          <form action={signOutEverywhere}>
            <button type="submit" className="inline-flex h-11 items-center gap-2 rounded-full border border-red-200 bg-red-50 px-5 text-sm font-semibold text-red-700 hover:bg-red-100">
              <LogOut className="h-4 w-4" /> Sign out of all devices
            </button>
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
