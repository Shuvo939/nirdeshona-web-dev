import type { Metadata } from "next";
import Link from "@/app/components/locale-link";
import { notFound } from "next/navigation";
import { ArrowUpRight, CheckCircle2, Clock, Tag, Users } from "lucide-react";

import {
  FaqList,
  PageHero,
  PrimaryButton,
  SecondaryButton,
  SectionHeading,
  ServiceIcon,
} from "@/app/components/marketing";
import { getContent, getLocalizedService } from "@/lib/content";
import { getI18n, localeAlternates } from "@/lib/i18n/server";
import { getService, services } from "@/lib/site";

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { L, locale } = await getI18n();
  const service = getLocalizedService(locale, slug);
  if (!service) return {};
  return {
    title: `${service.title} — ${L("Nirdeshona Web", "নির্দেশনা ওয়েব")}`,
    description: service.short,
    alternates: localeAlternates(locale, `/services/${service.slug}`),
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { L, locale, num } = await getI18n();
  const service = getLocalizedService(locale, slug);
  if (!service) notFound();
  const { processSteps, services: localized } = getContent(locale);
  const englishTitle = getService(slug)?.title ?? service.title;

  const others = localized.filter((item) => item.slug !== service.slug).slice(0, 3);

  return (
    <>
      <PageHero
        eyebrow={service.title}
        title={service.short}
        description={service.intro}
        breadcrumbs={[{ label: L("Services", "সার্ভিস"), href: "/services" }, { label: service.title }]}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <PrimaryButton
            href={
              service.slug === "maintenance"
                ? "/pricing?plan=care&care=0#order"
                : `/pricing?plan=${service.slug === "custom-development" ? "custom" : "starter"}&service=${service.slug}#order`
            }
          >
            {L("Build your quote", "কোটেশন সাজান")}
          </PrimaryButton>
          <SecondaryButton href={`/contact?service=${encodeURIComponent(englishTitle)}`}>{L("Ask a question", "প্রশ্ন করুন")}</SecondaryButton>
        </div>
      </PageHero>

      {/* Quick facts */}
      <section className="mx-auto -mt-px max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Fact icon={<Clock className="h-4 w-4" />} label={L("Typical timeline", "সাধারণ সময়সীমা")} value={service.timeline} />
          <Fact icon={<Tag className="h-4 w-4" />} label={L("Starting from", "শুরু")} value={service.startingFrom} />
          <Fact icon={<Users className="h-4 w-4" />} label={L("Ideal for", "যাদের জন্য উপযোগী")} value={service.idealFor.slice(0, 2).join(", ")} />
        </div>
      </section>

      {/* Deliverables */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-950 text-white">
              <ServiceIcon icon={service.icon} className="h-6 w-6" />
            </div>
            <div className="mt-6">
              <SectionHeading
                eyebrow={L("What you get", "আপনি যা পাবেন")}
                title={L("Deliverables", "যা যা পাবেন")}
                description={L("A clear list of what's included, so you know exactly what you're paying for.", "কী কী থাকছে তার স্পষ্ট তালিকা, যাতে জানেন ঠিক কীসের জন্য খরচ করছেন।")}
              />
            </div>
          </div>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {service.deliverables.map((item) => (
              <li key={item} className="flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-4 text-sm leading-6 text-neutral-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Outcomes */}
      <section className="border-y border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading eyebrow={L("Why it matters", "কেন গুরুত্বপূর্ণ")} title={L("What changes for you", "আপনার জন্য যা বদলায়")} />
          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
            {service.outcomes.map((outcome) => (
              <div key={outcome.title} className="rounded-3xl border border-neutral-200 bg-white p-6">
                <h3 className="text-base font-semibold text-neutral-950">{outcome.title}</h3>
                <p className="mt-2 text-sm leading-6 text-neutral-600">{outcome.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stack + ideal for */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8">
            <h3 className="text-lg font-semibold text-neutral-950">{L("Tools & technologies", "টুল ও প্রযুক্তি")}</h3>
            <div className="mt-5 flex flex-wrap gap-2">
              {service.stack.map((item) => (
                <span key={item} className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-medium text-neutral-700">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8">
            <h3 className="text-lg font-semibold text-neutral-950">{L("A great fit for", "যাদের জন্য সবচেয়ে উপযোগী")}</h3>
            <ul className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {service.idealFor.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-neutral-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-neutral-950" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <SectionHeading eyebrow={L("Process", "প্রক্রিয়া")} title={L("From first call to launch", "প্রথম কল থেকে লঞ্চ")} />
        <ol className="mt-8 flex flex-col gap-3">
          {processSteps.map((step, index) => (
            <li key={step.title} className="flex gap-4 rounded-2xl border border-neutral-200 bg-white p-5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-xs font-semibold text-white">
                {num(index + 1)}
              </span>
              <div>
                <h3 className="text-sm font-semibold text-neutral-950">{step.title}</h3>
                <p className="mt-1 text-sm leading-6 text-neutral-600">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* FAQ */}
      <section className="border-t border-neutral-200 bg-neutral-50">
        <div className="mx-auto grid grid-cols-1 max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.4fr] lg:px-8">
          <SectionHeading eyebrow={L("Questions", "প্রশ্ন")} title={L(`${service.title} FAQ`, `${service.title}: প্রশ্নোত্তর`)} description={L("More answers on our FAQ page.", "আরও উত্তর পাবেন প্রশ্নোত্তর পেজে।")} />
          <div className="flex flex-col gap-4">
            <FaqList items={service.faqs} />
            <Link href="/faq" className="inline-flex items-center gap-1 text-sm font-semibold text-neutral-950 hover:underline">
              {L("All frequently asked questions", "সব প্রশ্নোত্তর")}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Other services */}
      <section className="mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 lg:px-8">
        <SectionHeading eyebrow={L("Explore", "আরও দেখুন")} title={L("Other services", "অন্যান্য সার্ভিস")} />
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {others.map((item) => (
            <Link
              key={item.slug}
              href={`/services/${item.slug}`}
              className="group flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 transition hover:border-neutral-300 hover:shadow-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-900">
                <ServiceIcon icon={item.icon} className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-neutral-950">{item.title}</p>
                <p className="truncate text-xs text-neutral-500">{item.short}</p>
              </div>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-neutral-300 transition group-hover:text-neutral-950" />
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-900">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-neutral-500">{label}</p>
        <p className="mt-0.5 truncate text-sm font-semibold text-neutral-950">{value}</p>
      </div>
    </div>
  );
}
