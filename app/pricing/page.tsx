import type { Metadata } from "next";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";

import { FaqList, PageHero, SectionHeading } from "@/app/components/marketing";
import { carePlans, faqGroups, packages, type Package } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pricing — Nirdeshona Web",
  description: "Clear, upfront website packages and monthly care plans from Nirdeshona Web Development.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  const pricingFaq = faqGroups.find((group) => group.title.startsWith("Pricing"))?.items ?? [];

  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title="Simple packages. Honest prices."
        description="Every project gets a written scope and a fixed quote before work begins. These are starting points — we'll tailor them to what you actually need."
        breadcrumbs={[{ label: "Pricing" }]}
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {packages.map((item) => (
            <PlanCard key={item.name} plan={item} />
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-neutral-500">
          Prices are one-time project fees in Bangladeshi Taka. Domain and third-party services are billed at cost.
        </p>
      </section>

      <section className="border-y border-neutral-200 bg-neutral-50">
        <div className="mx-auto grid grid-cols-1 max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_2fr] lg:px-8">
          <SectionHeading
            eyebrow="After launch"
            title="Care plans"
            description="Keep your site secure, backed up and improving. Includes access to the client support portal."
          />
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {carePlans.map((item) => (
              <PlanCard key={item.name} plan={item} compact />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid grid-cols-1 max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.4fr] lg:px-8">
        <SectionHeading eyebrow="Questions" title="Pricing FAQ" />
        <FaqList items={pricingFaq} />
      </section>
    </>
  );
}

function PlanCard({ plan, compact = false }: { plan: Package; compact?: boolean }) {
  const dark = plan.highlighted;
  return (
    <div
      className={`relative flex flex-col rounded-3xl border p-6 sm:p-8 ${
        dark ? "border-neutral-950 bg-neutral-950 text-white shadow-[0_30px_60px_rgba(0,0,0,0.18)]" : "border-neutral-200 bg-white"
      }`}
    >
      {dark && (
        <span className="absolute right-6 top-6 inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium text-white">
          <Sparkles className="h-3 w-3" /> Most popular
        </span>
      )}
      <h3 className="text-lg font-semibold">{plan.name}</h3>
      <p className={`mt-2 text-sm leading-6 ${dark ? "text-neutral-400" : "text-neutral-600"}`}>{plan.description}</p>
      <p className="mt-6 flex items-end gap-1">
        <span className={`${compact ? "text-3xl" : "text-4xl"} font-bold tracking-[-0.04em]`}>{plan.price}</span>
        {plan.period && <span className={`pb-1 text-sm ${dark ? "text-neutral-400" : "text-neutral-500"}`}>{plan.period}</span>}
      </p>
      {!plan.period && plan.price.startsWith("৳") && (
        <p className={`mt-1 text-xs ${dark ? "text-neutral-500" : "text-neutral-400"}`}>starting from</p>
      )}
      <ul className="mt-6 flex flex-1 flex-col gap-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm">
            <Check className={`mt-0.5 h-4 w-4 shrink-0 ${dark ? "text-emerald-400" : "text-emerald-600"}`} />
            <span className={dark ? "text-neutral-200" : "text-neutral-700"}>{feature}</span>
          </li>
        ))}
      </ul>
      <Link
        href={`/contact?service=${encodeURIComponent(compact ? "Care & Maintenance" : "Not sure yet")}`}
        className={`mt-8 inline-flex h-11 items-center justify-center rounded-full text-sm font-semibold transition ${
          dark ? "bg-white text-neutral-950 hover:bg-neutral-200" : "bg-neutral-950 text-white hover:bg-neutral-800"
        }`}
      >
        {plan.cta}
      </Link>
    </div>
  );
}
