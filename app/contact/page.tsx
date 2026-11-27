import type { Metadata } from "next";

import { createCaptcha } from "@/lib/captcha";
import Link from "@/app/components/locale-link";
import {
  ArrowRight,
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  Phone,
  Send,
  Sparkles,
} from "lucide-react";

import ContactForm from "@/app/components/contact/contact-form";
import { getContent } from "@/lib/content";
import { getI18n, localeAlternates } from "@/lib/i18n/server";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const { L, locale } = await getI18n();
  return {
    title: L("Contact — Nirdeshona Web", "যোগাযোগ — নির্দেশনা ওয়েব"),
    description: L("Tell us about your project. We reply within 24 hours.", "আপনার প্রজেক্ট সম্পর্কে জানান। আমরা ২৪ ঘণ্টার মধ্যে উত্তর দিই।"),
    alternates: localeAlternates(locale, "/contact"),
  };
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; message?: string }>;
}) {
  const { service, message } = await searchParams;
  const { L, digits, locale } = await getI18n();
  const { packages, carePlans } = getContent(locale);

  return (
    <main className="min-h-[calc(100vh-72px)] bg-neutral-50">
      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden border-b border-neutral-200 bg-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div className="absolute left-1/2 top-[-260px] h-[520px] w-[760px] -translate-x-1/2 rounded-full bg-neutral-100 blur-3xl" />

          <div className="absolute right-[-120px] top-20 h-72 w-72 rounded-full border border-neutral-200/80" />

          <div className="absolute bottom-[-160px] left-[-160px] h-80 w-80 rounded-full border border-neutral-200/80" />

          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-20 sm:px-8 sm:py-24 lg:px-8 lg:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 shadow-sm">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black text-white">
                <Sparkles className="h-3 w-3" />
              </span>

              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
                {L("Let's work together", "চলুন একসঙ্গে কাজ করি")}
              </span>
            </div>

            <h1 className="mt-7 max-w-3xl text-4xl font-bold tracking-[-0.04em] text-neutral-950 sm:text-5xl lg:text-6xl">
              {L("Have a project in mind?", "মাথায় কোনো প্রজেক্ট আছে?")}
              <span className="block text-neutral-400">
                {L("Let's build something great.", "চলুন দারুণ কিছু বানাই।")}
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-neutral-500 sm:text-lg">
              {L("Tell us what you're working on, what you need, and where you'd like to go. We'll review your project and get back to you with the next steps.", "আপনি কী নিয়ে কাজ করছেন, কী দরকার আর কোথায় পৌঁছাতে চান — জানান। আপনার প্রজেক্ট দেখে আমরা পরের ধাপসহ যোগাযোগ করব।")}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-600 shadow-sm">
                <Clock3 className="h-4 w-4 text-neutral-400" />
                {L("Usually replies within 24 hours", "সাধারণত ২৪ ঘণ্টার মধ্যে উত্তর")}
              </div>

              <div className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-600 shadow-sm">
                <MessageSquare className="h-4 w-4 text-neutral-400" />
                {L("No commitment required", "কোনো বাধ্যবাধকতা নেই")}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTACT CONTENT
      ====================================================== */}

      <section className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.72fr_1.28fr]">
          {/* =================================================
              LEFT
          ================================================== */}

          <aside className="space-y-6">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white">
                <Send className="h-5 w-5" />
              </div>

              <h2 className="mt-5 text-xl font-semibold tracking-tight text-neutral-950">
                {L("Start a conversation", "কথা শুরু করুন")}
              </h2>

              <p className="mt-3 text-sm leading-7 text-neutral-500">
                {L("Whether you need a new website, an application, a redesign, or ongoing support, send us a few details and we'll take it from there.", "নতুন ওয়েবসাইট, অ্যাপ্লিকেশন, রিডিজাইন বা নিয়মিত সাপোর্ট — যা-ই দরকার, কিছু তথ্য পাঠান, বাকিটা আমরা দেখব।")}
              </p>
            </div>

            {/* Fixed packages */}
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
                {L("Know what you need?", "কী লাগবে, জানেন?")}
              </p>
              <ul className="mt-4 flex flex-col divide-y divide-neutral-100 text-sm">
                {packages.map((p, i) => (
                  <li key={p.name} className="flex items-center justify-between gap-3 py-2.5">
                    <span className="font-medium text-neutral-900">{p.name}</span>
                    <span className="text-neutral-500">{i === 2 ? L("from ৳40,000", "৳৪০,০০০ থেকে") : p.price}</span>
                  </li>
                ))}
                <li className="flex items-center justify-between gap-3 py-2.5">
                  <span className="font-medium text-neutral-900">{L("Care plans", "কেয়ার প্ল্যান")}</span>
                  <span className="text-neutral-500">
                    {carePlans[0]?.price}
                    {carePlans[0]?.period}
                  </span>
                </li>
              </ul>
              <Link
                href="/pricing#order"
                className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-neutral-950 text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                {L("Build and confirm your quote", "কোটেশন সাজিয়ে নিশ্চিত করুন")} <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="mt-2 text-center text-xs text-neutral-500">
                {L("Same prices as our pricing page.", "প্রাইসিং পেজের একই দাম।")}
              </p>
            </div>

            {/* Contact information */}

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-7">
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-neutral-400">
                {L("Contact information", "যোগাযোগের তথ্য")}
              </h2>

              <div className="mt-6 space-y-5">
                <a
                  href="mailto:contact.nirdeshona@gmail.com"
                  className="group flex items-start gap-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 transition group-hover:bg-black group-hover:text-white">
                    <Mail className="h-4 w-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-medium text-neutral-400">
                      {L("Email", "ইমেইল")}
                    </p>

                    <p className="mt-1 truncate text-sm font-medium text-neutral-800 group-hover:text-black">
                      contact.nirdeshona@gmail.com
                    </p>
                  </div>
                </a>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-neutral-400">{L("Phone & WhatsApp", "ফোন ও হোয়াটসঅ্যাপ")}</p>
                    <a href={`tel:${site.phone}`} className="mt-1 block text-sm font-medium text-neutral-800 hover:text-black">
                      {L(site.phoneDisplay, digits(site.phoneDisplay))}
                    </a>
                    <a
                      href={site.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                    >
                      <MessageCircle className="h-3.5 w-3.5" /> {L("Chat on WhatsApp", "হোয়াটসঅ্যাপে কথা বলুন")}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600">
                    <Clock3 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-neutral-400">
                      {L("Response time", "উত্তরের সময়")}
                    </p>
                    <p className="mt-1 text-sm font-medium text-neutral-800">
                      {L("Every day of the week · usually within a few hours", "সপ্তাহের সাত দিনই · সাধারণত কয়েক ঘণ্টার মধ্যে")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600">
                    <MapPin className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-neutral-400">
                      {L("Location", "অবস্থান")}
                    </p>

                    <p className="mt-1 text-sm font-medium text-neutral-800">
                      {L("Dhaka, Bangladesh", "ঢাকা, বাংলাদেশ")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Process */}

            <div className="rounded-3xl border border-neutral-200 bg-neutral-950 p-6 text-white shadow-sm sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                {L("What happens next?", "এরপর কী হবে?")}
              </p>

              <div className="mt-6 space-y-5">
                {[
                  {
                    number: "01",
                    title: L("You send the details", "আপনি তথ্য পাঠান"),
                    text: L("Tell us about your project and requirements.", "আপনার প্রজেক্ট ও প্রয়োজনের কথা জানান।"),
                  },
                  {
                    number: "02",
                    title: L("We review it", "আমরা খুঁটিয়ে দেখি"),
                    text: L("We look at your goals, scope and requirements.", "আপনার লক্ষ্য, পরিসর ও প্রয়োজনগুলো দেখি।"),
                  },
                  {
                    number: "03",
                    title: L("We get in touch", "আমরা যোগাযোগ করি"),
                    text: L("We'll discuss the best way to move forward.", "এগোনোর সবচেয়ে ভালো উপায় নিয়ে আলোচনা করি।"),
                  },
                ].map((item) => (
                  <div
                    key={item.number}
                    className="flex gap-4"
                  >
                    <span className="shrink-0 text-xs font-semibold text-neutral-600">
                      {item.number}
                    </span>

                    <div>
                      <p className="text-sm font-semibold text-white">
                        {item.title}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-neutral-500">
                        {item.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* =================================================
              RIGHT — FORM
          ================================================== */}

          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
            <ContactForm defaultService={service ?? ""} defaultMessage={(message ?? "").slice(0, 1500)} initialCaptcha={createCaptcha()} />
          </div>
        </div>
      </section>

      {/* =====================================================
          BOTTOM CTA
      ====================================================== */}

      <section className="border-t border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-12 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-sm font-semibold text-neutral-950">
              {L("Not ready to start a project?", "এখনই প্রজেক্ট শুরু করতে প্রস্তুত নন?")}
            </p>

            <p className="mt-1 text-sm text-neutral-500">
              {L("Explore our work or learn more about what we do.", "আমাদের কাজ দেখুন বা আমরা কী করি, জেনে নিন।")}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/projects"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-neutral-200 px-4 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              {L("View our work", "আমাদের কাজ দেখুন")}
            </Link>

            <Link
              href="/services"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-black px-4 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              {L("Explore services", "সার্ভিসগুলো দেখুন")}

              <span aria-hidden="true">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}