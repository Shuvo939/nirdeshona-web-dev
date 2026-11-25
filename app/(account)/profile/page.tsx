import type { Metadata } from "next";

import AccountHeader from "@/app/components/account-header";
import { requireUser } from "@/lib/auth/session";
import { sql } from "@/lib/db";
import { getI18n, msg } from "@/lib/i18n/server";

import ProfileForm from "./profile-form";

export async function generateMetadata(): Promise<Metadata> {
  return { title: await msg("Your profile — Nirdeshona Web", "আপনার প্রোফাইল — নির্দেশনা ওয়েব"), robots: { index: false } };
}

export default async function ProfilePage() {
  const user = await requireUser("/profile");
  const [extra] = await sql`select bio from profiles where id = ${user.id}`;
  const { L, num } = await getI18n();

  const checks = [Boolean(user.fullName), Boolean(user.avatarUrl), Boolean(user.phone), Boolean(user.company), Boolean(extra?.bio)];
  const completeness = Math.round((checks.filter(Boolean).length / checks.length) * 100);
  const labels = L(["name", "photo", "phone", "organisation", "bio"], ["নাম", "ছবি", "ফোন", "প্রতিষ্ঠান", "পরিচিতি"]);
  const missing = labels.filter((_, i) => !checks[i]);

  return (
    <div className="flex flex-col gap-8 px-4 py-8 sm:px-6 lg:px-0">
      <AccountHeader
        title={L("Your profile", "আপনার প্রোফাইল")}
        description={L("This is how you appear to our team in tickets and comments.", "টিকেট ও মন্তব্যে আমাদের টিম আপনাকে এভাবেই দেখবে।")}
        crumbs={[{ label: L("Profile", "প্রোফাইল") }]}
      />
      <section className="flex max-w-3xl flex-col gap-6">
        <ProfileForm
          between={
            <div className="rounded-3xl border border-neutral-200 bg-white p-5 sm:p-6">
              <div className="mb-2 flex justify-between text-xs text-neutral-500">
                <span>{L("Profile completeness", "প্রোফাইল সম্পূর্ণতা")}</span>
                <span className="font-semibold text-neutral-900">{num(completeness)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                <div className={`h-full rounded-full ${completeness === 100 ? "bg-emerald-500" : "bg-neutral-950"}`} style={{ width: `${completeness}%` }} />
              </div>
              {missing.length > 0 && <p className="mt-3 text-xs text-neutral-500">{L("Still missing:", "এখনো বাকি:")} {missing.join(", ")}{L(".", "।")}</p>}
            </div>
          }
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
