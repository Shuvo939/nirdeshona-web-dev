import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";

import {
  PageHero,
  PrimaryButton,
  SecondaryButton,
  SectionHeading,
  ServiceCard,
} from "@/app/components/marketing";
import { processSteps, services } from "@/lib/site";

export const metadata: Metadata = {
  title: "Services — Nirdeshona Web",
  description:
    "Web development, WordPress, UI/UX design, e-commerce, custom portals and website care from Nirdeshona Web Development.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="What we do"
        title="Everything you need to launch and grow online."
        description="Strategy, design, development and ongoing care — handled by one small, focused team that explains things in plain language."
        breadcrumbs={[{ label: "Services" }]}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <PrimaryButton href="/contact">Get a free quote</PrimaryButton>
          <SecondaryButton href="/pricing">View pricing</SecondaryButton>
        </div>
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </div>
      </section>

      <section className="border-y border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="How we work"
            title="A simple, transparent process."
            description="You always know what's happening, what's next and what it costs."
          />
          <ol className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {processSteps.map((step, index) => (
              <li key={step.title} className="relative rounded-3xl border border-neutral-200 bg-white p-6">
                <span className="text-xs font-semibold text-neutral-400">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-base font-semibold text-neutral-950">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-neutral-600">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
          <SectionHeading
            eyebrow="Every project includes"
            title="The essentials, done properly."
            description="No matter the size of the project, these come as standard."
          />
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              "Mobile-first, responsive design",
              "HTTPS and security best practices",
              "SEO-ready structure and metadata",
              "Fast loading on slow networks",
              "Live preview link during the build",
              "Full ownership of code and accounts",
              "Handover session and documentation",
              "Free support period after launch",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
