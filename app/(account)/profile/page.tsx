import type { Metadata } from "next";

import AccountHeader from "@/app/components/account-header";
import { requireUser } from "@/lib/auth/session";
import { sql } from "@/lib/db";

import ProfileForm from "./profile-form";

export const metadata: Metadata = { title: "Your profile — Nirdeshona Web", robots: { index: false } };

export default async function ProfilePage() {
  const user = await requireUser("/profile");
  const [extra] = await sql`select bio from profiles where id = ${user.id}`;

  const checks = [Boolean(user.fullName), Boolean(user.avatarUrl), Boolean(user.phone), Boolean(user.company), Boolean(extra?.bio)];
  const completeness = Math.round((checks.filter(Boolean).length / checks.length) * 100);

  return (
    <div className="flex flex-col gap-8 px-4 py-8 sm:px-6 lg:px-0">
      <AccountHeader
        title="Your profile"
        description="This is how you appear to our team in tickets and comments."
        crumbs={[{ label: "Profile" }]}
      />
      <section className="flex max-w-3xl flex-col gap-6">
        <div className="rounded-3xl border border-neutral-200 bg-white p-5 sm:p-6">
        <div>
          <div className="mb-2 flex justify-between text-xs text-neutral-500">
            <span>Profile completeness</span>
            <span className="font-semibold text-neutral-900">{completeness}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white ring-1 ring-neutral-200">
            <div className="h-full rounded-full bg-neutral-950" style={{ width: `${completeness}%` }} />
          </div>
        </div>
        </div>
        <ProfileForm
          initial={{
            fullName: user.fullName ?? "",
            email: user.email,
            phone: user.phone ?? "",
            company: user.company ?? "",
            bio: extra?.bio ?? "",
            avatarUrl: user.avatarUrl,
          }}
        />
      </section>
    </div>
  );
}
