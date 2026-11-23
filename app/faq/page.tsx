import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

import { FaqList, PageHero } from "@/app/components/marketing";
import { faqGroups } from "@/lib/site";
import { jsonLd as toJsonLd } from "@/lib/json-ld";

export const metadata: Metadata = {
  title: "FAQ — Nirdeshona Web",
  description: "Answers to common questions about working with Nirdeshona Web Development.",
  alternates: { canonical: "/faq" },
};

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqGroups.flatMap((group) =>
      group.items.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    ),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLd(jsonLd) }} />
      <PageHero
        eyebrow="Help centre"
        title="Frequently asked questions"
        description="Everything you might want to know before starting a project with us."
        breadcrumbs={[{ label: "FAQ" }]}
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[240px_1fr]">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:px-0">
              {faqGroups.map((group) => (
                <a
                  key={group.title}
                  href={`#${slugify(group.title)}`}
                  className="shrink-0 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-600 transition hover:border-neutral-300 hover:text-neutral-950 lg:rounded-xl"
                >
                  {group.title}
                </a>
              ))}
            </nav>
            <div className="mt-6 hidden rounded-3xl border border-neutral-200 bg-white p-5 lg:block">
              <MessageCircle className="h-5 w-5 text-neutral-500" />
              <p className="mt-3 text-sm font-semibold text-neutral-950">Still have a question?</p>
              <p className="mt-1 text-sm text-neutral-600">We usually reply within one business day.</p>
              <Link href="/contact" className="mt-4 inline-flex text-sm font-semibold underline">
                Contact us
              </Link>
            </div>
          </aside>

          <div className="flex flex-col gap-12">
            {faqGroups.map((group) => (
              <div key={group.title} id={slugify(group.title)} className="scroll-mt-28">
                <h2 className="mb-5 text-xl font-bold tracking-tight text-neutral-950">{group.title}</h2>
                <FaqList items={group.items} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
