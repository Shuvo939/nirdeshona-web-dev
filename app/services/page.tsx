import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";

import {
  PageHero,
  PrimaryButton,
  SecondaryButton,
  SectionHeading,
  ServiceCard,
} from "@/app/components/marketing";
import { getContent } from "@/lib/content";
import { getI18n, localeAlternates } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { L, locale } = await getI18n();
  return {
    title: L("Services — Nirdeshona Web", "সার্ভিস — নির্দেশনা ওয়েব"),
    description: L(
      "Web development, WordPress, UI/UX design, e-commerce, custom portals and website care from Nirdeshona Web Development.",
      "নির্দেশনা ওয়েব ডেভেলপমেন্টের ওয়েব ডেভেলপমেন্ট, ওয়ার্ডপ্রেস, ইউআই/ইউএক্স ডিজাইন, ই-কমার্স, কাস্টম পোর্টাল ও ওয়েবসাইট কেয়ার।",
    ),
    alternates: localeAlternates(locale, "/services"),
  };
}

export default async function ServicesPage() {
  const { L, locale, num } = await getI18n();
  const { processSteps, services } = getContent(locale);
  return (
    <>
      <PageHero
        eyebrow={L("What we do", "আমরা যা করি")}
        title={L("Everything you need to launch and grow online.", "অনলাইনে শুরু ও বেড়ে ওঠার জন্য যা যা দরকার।")}
        description={L("Strategy, design, development and ongoing care — handled by one small, focused team that explains things in plain language.", "কৌশল, ডিজাইন, ডেভেলপমেন্ট ও নিয়মিত দেখভাল — সবকিছু সামলায় একটি ছোট, মনোযোগী টিম, যারা সহজ ভাষায় সব বুঝিয়ে বলে।")}
        breadcrumbs={[{ label: L("Services", "সার্ভিস") }]}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <PrimaryButton href="/pricing#order">{L("Build your quote", "কোটেশন সাজান")}</PrimaryButton>
          <SecondaryButton href="/pricing">{L("View pricing", "প্রাইসিং দেখুন")}</SecondaryButton>
        </div>
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </div>
      </section>

      <section className="border-y border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={L("How we work", "আমরা যেভাবে কাজ করি")}
            title={L("A simple, transparent process.", "সহজ, স্বচ্ছ প্রক্রিয়া।")}
            description={L("You always know what's happening, what's next and what it costs.", "কী হচ্ছে, এরপর কী, আর কত খরচ — সবসময় আপনি জানবেন।")}
          />
          <ol className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {processSteps.map((step, index) => (
              <li key={step.title} className="relative rounded-3xl border border-neutral-200 bg-white p-6">
                <span className="text-xs font-semibold text-neutral-400">
                  {num(index + 1).padStart(2, L("0", "০"))}
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
            eyebrow={L("Every project includes", "প্রতিটি প্রজেক্টে থাকে")}
            title={L("The essentials, done properly.", "প্রয়োজনীয় সবকিছু, ঠিকভাবে।")}
            description={L("No matter the size of the project, these come as standard.", "প্রজেক্ট যত ছোট বা বড়ই হোক, এগুলো সবসময় থাকে।")}
          />
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              L("Mobile-first, responsive design", "মোবাইল-ফার্স্ট, রেসপন্সিভ ডিজাইন"),
              L("HTTPS and security best practices", "HTTPS ও নিরাপত্তার সেরা চর্চা"),
              L("SEO-ready structure and metadata", "এসইও-উপযোগী কাঠামো ও মেটাডেটা"),
              L("Fast loading on slow networks", "ধীর নেটওয়ার্কেও দ্রুত লোড"),
              L("Live preview link during the build", "কাজ চলার সময় লাইভ প্রিভিউ লিংক"),
              L("Full ownership of code and accounts", "কোড ও অ্যাকাউন্টের পূর্ণ মালিকানা"),
              L("Handover session and documentation", "হস্তান্তর সেশন ও ডকুমেন্টেশন"),
              L("Free support period after launch", "লঞ্চের পর ফ্রি সাপোর্টের সময়"),
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
