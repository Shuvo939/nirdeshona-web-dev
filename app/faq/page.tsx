import type { Metadata } from "next";
import Link from "@/app/components/locale-link";
import { MessageCircle } from "lucide-react";

import { FaqList, PageHero } from "@/app/components/marketing";
import { getContent } from "@/lib/content";
import { jsonLd as toJsonLd } from "@/lib/json-ld";
import { getI18n, localeAlternates } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { L, locale } = await getI18n();
  return {
    title: L("FAQ — Nirdeshona Web", "প্রশ্নোত্তর — নির্দেশনা ওয়েব"),
    description: L("Answers to common questions about working with Nirdeshona Web Development.", "নির্দেশনা ওয়েব ডেভেলপমেন্টের সাথে কাজ নিয়ে সাধারণ প্রশ্নের উত্তর।"),
    alternates: localeAlternates(locale, "/faq"),
  };
}

// Anchors use the English group titles so links work in both languages.
const ANCHORS = getContent("en").faqGroups.map((g) => g.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));

export default async function FaqPage() {
  const { L, locale } = await getI18n();
  const { faqGroups } = getContent(locale);
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
        eyebrow={L("Help centre", "সহায়তা কেন্দ্র")}
        title={L("Frequently asked questions", "সাধারণ জিজ্ঞাসা")}
        description={L("Everything you might want to know before starting a project with us.", "আমাদের সাথে প্রজেক্ট শুরুর আগে যা যা জানতে চাইতে পারেন।")}
        breadcrumbs={[{ label: L("FAQ", "প্রশ্নোত্তর") }]}
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[240px_1fr]">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:px-0">
              {faqGroups.map((group, i) => (
                <a
                  key={group.title}
                  href={`#${ANCHORS[i]}`}
                  className="shrink-0 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-600 transition hover:border-neutral-300 hover:text-neutral-950 lg:rounded-xl"
                >
                  {group.title}
                </a>
              ))}
            </nav>
            <div className="mt-6 hidden rounded-3xl border border-neutral-200 bg-white p-5 lg:block">
              <MessageCircle className="h-5 w-5 text-neutral-500" />
              <p className="mt-3 text-sm font-semibold text-neutral-950">{L("Still have a question?", "এখনো প্রশ্ন আছে?")}</p>
              <p className="mt-1 text-sm text-neutral-600">{L("We usually reply within one business day.", "আমরা সাধারণত এক কর্মদিবসের মধ্যে উত্তর দিই।")}</p>
              <Link href="/contact" className="mt-4 inline-flex text-sm font-semibold underline">
                {L("Contact us", "যোগাযোগ করুন")}
              </Link>
            </div>
          </aside>

          <div className="flex flex-col gap-12">
            {faqGroups.map((group, i) => (
              <div key={group.title} id={ANCHORS[i]} className="scroll-mt-28">
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
