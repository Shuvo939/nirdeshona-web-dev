import type { Metadata } from "next";
import Link from "@/app/components/locale-link";
import { ArrowUpRight, Building2, LogIn } from "lucide-react";

import { PageHero, PrimaryButton, SecondaryButton } from "@/app/components/marketing";
import { sql } from "@/lib/db";
import { getI18n, localeAlternates } from "@/lib/i18n/server";
import { categoryLabel } from "@/lib/projects/categories";

export async function generateMetadata(): Promise<Metadata> {
  const { L, locale } = await getI18n();
  return {
    title: L("Clients — Nirdeshona Web", "ক্লায়েন্ট — নির্দেশনা ওয়েব"),
    description: L("Organisations and people we've had the privilege to work with.", "যেসব প্রতিষ্ঠান ও মানুষের সঙ্গে কাজ করার সৌভাগ্য হয়েছে।"),
    alternates: localeAlternates(locale, "/clients"),
  };
}

export default async function ClientsPage() {
  const { L, locale, num } = await getI18n();
  const clients = await sql`
    select c.id, c.name, c.logo_url,
           count(p.id)::int as project_count,
           (array_agg(p.slug order by p.featured desc, p.created_at desc) filter (where p.id is not null))[1] as top_project_slug,
           (array_agg(p.category order by p.created_at desc) filter (where p.category is not null))[1] as category
    from clients c
    left join projects p on p.client_id = c.id
    group by c.id
    having count(p.id) > 0
    order by count(p.id) desc, c.name asc
  `;

  return (
    <>
      <PageHero
        eyebrow={L("Clients", "ক্লায়েন্ট")}
        title={L("People and organisations we work with.", "যাদের সঙ্গে আমরা কাজ করি।")}
        description={L("From nonprofits to personal brands — every client gets a dedicated portal to follow progress and get support.", "অলাভজনক সংগঠন থেকে ব্যক্তিগত ব্র্যান্ড — প্রত্যেক ক্লায়েন্ট পান অগ্রগতি দেখা ও সাপোর্ট পাওয়ার জন্য নিজস্ব পোর্টাল।")}
        breadcrumbs={[{ label: L("Clients", "ক্লায়েন্ট") }]}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <PrimaryButton href="/client">{L("Client portal", "ক্লায়েন্ট পোর্টাল")}</PrimaryButton>
          <SecondaryButton href="/contact">{L("Become a client", "ক্লায়েন্ট হোন")}</SecondaryButton>
        </div>
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {clients.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
            <Building2 className="mx-auto h-8 w-8 text-neutral-300" />
            <p className="mt-4 text-sm text-neutral-500">{L("Our client showcase is being prepared.", "ক্লায়েন্টদের তালিকা প্রস্তুত করা হচ্ছে।")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {clients.map((client) => (
              <Link
                key={client.id}
                href={client.top_project_slug ? `/projects/${client.top_project_slug}` : "/projects"}
                className="group flex items-center gap-4 rounded-3xl border border-neutral-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)]"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-neutral-100 bg-neutral-50 text-lg font-bold text-neutral-700">
                  {client.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={client.logo_url} alt="" className="h-full w-full object-contain p-2" />
                  ) : (
                    client.name.slice(0, 1).toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-neutral-950">{client.name}</p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {L(`${client.project_count} project${client.project_count === 1 ? "" : "s"}`, `${num(client.project_count)}টি প্রজেক্ট`)}
                    {client.category ? ` · ${categoryLabel(client.category, locale)}` : ""}
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-neutral-300 transition group-hover:text-neutral-950" />
              </Link>
            ))}
          </div>
        )}

        <div className="mt-12 flex flex-col items-start gap-4 rounded-3xl border border-neutral-200 bg-neutral-50 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="text-base font-semibold text-neutral-950">{L("Already a client?", "আগে থেকেই ক্লায়েন্ট?")}</p>
            <p className="mt-1 text-sm text-neutral-600">{L("Sign in to see project progress, open support tickets and message our team.", "প্রজেক্টের অগ্রগতি দেখতে, সাপোর্ট টিকেট খুলতে ও আমাদের টিমকে বার্তা পাঠাতে লগইন করুন।")}</p>
          </div>
          <Link href="/login?next=/client" className="inline-flex h-11 items-center gap-2 rounded-full bg-neutral-950 px-5 text-sm font-semibold text-white hover:bg-neutral-800">
            <LogIn className="h-4 w-4" /> {L("Sign in", "লগইন")}
          </Link>
        </div>
      </section>
    </>
  );
}
