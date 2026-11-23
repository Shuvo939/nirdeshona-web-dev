import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Banknote, CalendarCheck, Check, FileSignature, Landmark, ShieldCheck, Sparkles, X } from "lucide-react";

import { FaqList, PageHero, SectionHeading, ServiceIcon } from "@/app/components/marketing";
import PriceEstimator from "@/app/components/pricing/estimator";
import { addOns, carePlans, faqGroups, packageMatrix, packages, paymentTerms, services, type Package } from "@/lib/site";

const TERM_ICONS = [FileSignature, CalendarCheck, Landmark, Banknote];

const toNumber = (price: string) => Number(price.replace(/[^0-9]/g, "")) || 0;

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
      >
        <div className="flex flex-wrap gap-2">
          {["Fixed quote before work starts", "50% to start, 50% at launch", "You own everything"].map((t) => (
            <span key={t} className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> {t}
            </span>
          ))}
        </div>
      </PageHero>

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
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="By service"
            title="Pricing for every service"
            description="Starting prices and typical timelines for everything we offer. Click a service for full details."
          />
          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <Link
                key={s.slug}
                href={`/services/${s.slug}`}
                className="group flex flex-col rounded-3xl border border-neutral-200 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-[0_20px_50px_rgba(0,0,0,0.07)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-950 text-white">
                    <ServiceIcon icon={s.icon} />
                  </span>
                  <ArrowUpRight className="h-5 w-5 text-neutral-300 transition group-hover:text-neutral-950" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-neutral-950">{s.title}</h3>
                <p className="mt-1 text-sm leading-6 text-neutral-600">{s.short}</p>
                <div className="mt-5 flex items-end justify-between gap-3 border-t border-neutral-100 pt-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-neutral-400">From</p>
                    <p className="text-2xl font-bold tracking-[-0.03em] text-neutral-950">{s.startingFrom}</p>
                  </div>
                  <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">{s.timeline}</span>
                </div>
                <ul className="mt-4 flex flex-col gap-2">
                  {s.deliverables.slice(0, 3).map((d) => (
                    <li key={d} className="flex items-start gap-2 text-sm text-neutral-600">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> {d}
                    </li>
                  ))}
                </ul>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Compare" title="What's in each package" align="center" />
        <div className="mt-10 overflow-x-auto rounded-3xl border border-neutral-200 bg-white">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="p-4 text-left font-medium text-neutral-500">Feature</th>
                {packages.map((p) => (
                  <th key={p.name} className={`p-4 text-center ${p.highlighted ? "bg-neutral-950 text-white" : "text-neutral-950"}`}>
                    <span className="block font-semibold">{p.name}</span>
                    <span className={`block text-xs font-normal ${p.highlighted ? "text-neutral-400" : "text-neutral-500"}`}>{p.price}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {packageMatrix.map((row) => (
                <tr key={row.feature} className="border-b border-neutral-100 last:border-0">
                  <td className="p-4 font-medium text-neutral-800">{row.feature}</td>
                  {row.values.map((v, i) => (
                    <td key={i} className={`p-4 text-center ${packages[i]?.highlighted ? "bg-neutral-50" : ""}`}>
                      {v === true ? (
                        <Check className="mx-auto h-5 w-5 text-emerald-600" aria-label="Included" />
                      ) : v === false ? (
                        <X className="mx-auto h-5 w-5 text-neutral-300" aria-label="Not included" />
                      ) : (
                        <span className="text-xs font-medium text-neutral-600">{v}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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

      <section id="estimate" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Estimator"
          title="Estimate your project in a minute"
          description="Pick a service, the number of pages and any add-ons. We'll send you an exact, fixed quote after a short chat."
        />
        <div className="mt-10">
          <PriceEstimator
            services={services
              .filter((s) => s.slug !== "maintenance")
              .map((s) => ({ slug: s.slug, title: s.title, base: toNumber(s.startingFrom), timeline: s.timeline }))}
            addOns={addOns}
            carePlans={carePlans.map((c) => ({ name: c.name, price: toNumber(c.price) }))}
          />
        </div>
      </section>

      <section className="border-y border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Extras" title="Add-ons" description="Add exactly what you need to any package." />
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {addOns.map((a) => (
              <div key={a.id} className="flex items-start justify-between gap-4 rounded-2xl border border-neutral-200 bg-white p-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-neutral-950">{a.name}</p>
                  <p className="mt-1 text-xs leading-5 text-neutral-500">{a.description}</p>
                </div>
                <p className="shrink-0 text-right text-sm font-bold text-neutral-950">
                  ৳{a.price.toLocaleString("en-US")}
                  {a.unit && <span className="block text-[11px] font-normal text-neutral-500">{a.unit}</span>}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-14">
            <SectionHeading eyebrow="Payments" title="Simple payment terms" />
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {paymentTerms.map((t, i) => {
                const Icon = TERM_ICONS[i % TERM_ICONS.length];
                return (
                  <div key={t.title} className="rounded-3xl border border-neutral-200 bg-white p-6">
                    <Icon className="h-6 w-6 text-neutral-950" />
                    <h3 className="mt-4 font-semibold text-neutral-950">{t.title}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-neutral-600">{t.text}</p>
                  </div>
                );
              })}
            </div>
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
