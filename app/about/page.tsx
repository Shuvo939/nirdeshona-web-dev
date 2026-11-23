import type { Metadata } from "next";
import { Compass, HeartHandshake, Layers3, Smartphone } from "lucide-react";

import {
  PageHero,
  PrimaryButton,
  SecondaryButton,
  SectionHeading,
} from "@/app/components/marketing";
import { sql } from "@/lib/db";
import { processSteps, site, values } from "@/lib/site";

export const metadata: Metadata = {
  title: "About — Nirdeshona Web",
  description:
    "Nirdeshona Web Development is a small, focused studio from Bangladesh building modern websites and web applications.",
  alternates: { canonical: "/about" },
};

const VALUE_ICONS = [Compass, Smartphone, Layers3, HeartHandshake];

export default async function AboutPage() {
  const [stats] = await sql`
    select
      (select count(*)::int from projects) as projects,
      (select count(*)::int from projects where status = 'COMPLETED') as completed,
      (select count(*)::int from clients) as clients
  `;

  const years = new Date().getFullYear() - site.founded;

  return (
    <>
      <PageHero
        eyebrow="About us"
        title="A small studio that cares about the details."
        description={`${site.legalName} is part of Nirdeshona — an initiative started in ${site.founded} to help people and organisations find direction. We bring that same spirit to the web: clear guidance, honest advice and software that works.`}
        breadcrumbs={[{ label: "About" }]}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <PrimaryButton href="/contact">Work with us</PrimaryButton>
          <SecondaryButton href="/projects">See our work</SecondaryButton>
        </div>
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { value: `${Math.max(years, 1)}+`, label: "Years of Nirdeshona" },
            { value: String(stats?.projects ?? 0), label: "Projects" },
            { value: String(stats?.completed ?? 0), label: "Launched" },
            { value: String(stats?.clients ?? 0), label: "Clients served" },
          ].map((item) => (
            <div key={item.label} className="rounded-3xl border border-neutral-200 bg-white p-6">
              <p className="text-4xl font-bold tracking-[-0.04em] text-neutral-950">{item.value}</p>
              <p className="mt-1 text-sm text-neutral-500">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <SectionHeading eyebrow="Our story" title="Why we build for the web." />
          <div className="flex flex-col gap-4 text-base leading-7 text-neutral-600">
            <p>
              Many organisations in Bangladesh — NGOs, student groups, small businesses and individual professionals — need a
              reliable website but are let down by slow templates, hidden costs or developers who disappear after launch.
            </p>
            <p>
              We started Nirdeshona Web to do it differently: modern technology, mobile-first design for the phones people
              actually use, Bengali and English support, and a client portal so you can always see progress and get help.
            </p>
            <p>
              We work with a small number of clients at a time, so every project gets proper attention from the first call
              to long after launch.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="What we believe" title="Principles we work by" align="center" />
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => {
              const Icon = VALUE_ICONS[index % VALUE_ICONS.length];
              return (
                <div key={value.title} className="rounded-3xl border border-neutral-200 bg-white p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-950 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-base font-semibold text-neutral-950">{value.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">{value.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="How we work" title="Five steps, no surprises." />
        <ol className="relative mt-10 grid grid-cols-1 gap-4 md:grid-cols-5">
          {processSteps.map((step, index) => (
            <li key={step.title} className="rounded-3xl border border-neutral-200 bg-white p-6">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-950 text-xs font-semibold text-white">
                {index + 1}
              </span>
              <h3 className="mt-4 text-sm font-semibold text-neutral-950">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-600">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
