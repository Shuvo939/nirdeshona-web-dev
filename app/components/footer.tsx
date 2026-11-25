"use client";

import Link from "@/app/components/locale-link";

import { LanguageSwitcherFull } from "@/app/components/language-switcher";
import { getContent } from "@/lib/content";
import { useI18n } from "@/lib/i18n/client";
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronUp,
  Globe2,
  Mail,
  MapPin,
  MessageCircle,
} from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  const { L, locale, num, digits } = useI18n();
  const { services } = getContent(locale);

  return (
    <footer className="border-t border-neutral-200 bg-neutral-950 text-white">
      {/* =====================================================
          CTA
      ====================================================== */}

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] px-6 py-10 sm:px-10 sm:py-12">
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/[0.06] blur-3xl" />

            <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-white/[0.04] blur-3xl" />

            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-neutral-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {L("Available for new projects", "নতুন প্রজেক্টের জন্য প্রস্তুত")}
                </div>

                <h2 className="mt-5 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                  {L("Have something worth building?", "বানানোর মতো কিছু ভাবছেন?")}
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-400 sm:text-base">
                  {L("Tell us what you want to build, improve, or solve. We'll help turn the idea into a practical digital solution.", "কী বানাতে, উন্নত করতে বা সমাধান করতে চান — জানান। ভাবনাটিকে কাজের ডিজিটাল সমাধানে রূপ দিতে আমরা সাহায্য করব।")}
                </p>
              </div>

              <Link
                href="/contact"
                className="group inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-medium text-neutral-950 transition hover:bg-neutral-200"
              >
                {L("Start a conversation", "কথা শুরু করুন")}
                <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          MAIN FOOTER
      ====================================================== */}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 py-14 sm:py-16 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-10">
          {/* =================================================
              BRAND
          ================================================== */}

          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-bold text-neutral-950">
                N
              </div>

              <div>
                <div className="text-[15px] font-bold tracking-tight">
                  {L("Nirdeshona", "নির্দেশনা")}
                </div>

                <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">
                  {L("Web", "ওয়েব")}
                </div>
              </div>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-6 text-neutral-400">
              {L("Modern websites, web applications, WordPress solutions, and digital experiences designed around real-world needs.", "বাস্তব প্রয়োজন মাথায় রেখে তৈরি আধুনিক ওয়েবসাইট, ওয়েব অ্যাপ্লিকেশন, ওয়ার্ডপ্রেস সমাধান ও ডিজিটাল অভিজ্ঞতা।")}
            </p>

            {/* Contact */}

            <div className="mt-6 space-y-3">
              <a
                href="mailto:contact.nirdeshona@gmail.com"
                className="group flex items-center gap-2.5 text-sm text-neutral-400 transition hover:text-white"
              >
                <Mail className="h-4 w-4 text-neutral-500 transition group-hover:text-neutral-300" />
                contact.nirdeshona@gmail.com
              </a>

              <div className="flex items-center gap-2.5 text-sm text-neutral-400">
                <MapPin className="h-4 w-4 text-neutral-500" />
                {L("Bangladesh", "বাংলাদেশ")}
              </div>

              <div className="flex items-center gap-2.5 text-sm text-neutral-400">
                <Globe2 className="h-4 w-4 text-neutral-500" />
                nirdeshona.com
              </div>
            </div>

          </div>

          {/* =================================================
              COMPANY
          ================================================== */}

          <FooterColumn title={L("Company", "প্রতিষ্ঠান")}>
            <FooterLink href="/about">{L("About", "আমাদের সম্পর্কে")}</FooterLink>
            <FooterLink href="/projects">{L("Our work", "আমাদের কাজ")}</FooterLink>
            <FooterLink href="/contact">{L("Contact", "যোগাযোগ")}</FooterLink>
            <FooterLink href="/clients">{L("Clients", "ক্লায়েন্ট")}</FooterLink>
          </FooterColumn>

          {/* =================================================
              SERVICES
          ================================================== */}

          <FooterColumn title={L("Services", "সার্ভিস")}>
            {services.map((service) => (
              <FooterLink key={service.slug} href={`/services/${service.slug}`}>
                {service.title}
              </FooterLink>
            ))}
          </FooterColumn>

          {/* =================================================
              RESOURCES
          ================================================== */}

          <FooterColumn title={L("Resources", "রিসোর্স")}>
            <FooterLink href="/blog">{L("Blog", "ব্লগ")}</FooterLink>
            <FooterLink href="/pricing">{L("Pricing", "প্রাইসিং")}</FooterLink>
            <FooterLink href="/faq">{L("FAQ", "প্রশ্নোত্তর")}</FooterLink>
            <FooterLink href="/privacy">{L("Privacy policy", "গোপনীয়তা নীতি")}</FooterLink>
            <FooterLink href="/terms">{L("Terms of service", "সেবার শর্তাবলি")}</FooterLink>

            <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 text-xs font-medium text-neutral-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                {L("Currently available", "এখন কাজ নিচ্ছি")}
              </div>

              <p className="mt-2 text-xs leading-5 text-neutral-500">
                {L("We're currently accepting selected website and digital product projects.", "বর্তমানে আমরা নির্বাচিত ওয়েবসাইট ও ডিজিটাল প্রোডাক্ট প্রজেক্ট নিচ্ছি।")}
              </p>
            </div>
          </FooterColumn>
        </div>

        {/* =====================================================
            CONTACT STRIP
        ====================================================== */}

        <div className="border-y border-white/10 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-white">
                {L("Let's build something useful.", "চলুন, কাজের কিছু বানাই।")}
              </p>

              <p className="mt-1 text-xs text-neutral-500">
                {L("Have a question or project in mind?", "কোনো প্রশ্ন বা প্রজেক্টের ভাবনা আছে?")}
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <a
                href="mailto:contact.nirdeshona@gmail.com"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-3.5 py-2 text-xs font-medium text-neutral-300 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
              >
                <Mail className="h-3.5 w-3.5" />
                {L("Email us", "ইমেইল করুন")}
              </a>

              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-3.5 py-2 text-xs font-medium text-neutral-950 transition hover:bg-neutral-200"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                {L("Contact", "যোগাযোগ")}
              </Link>
            </div>
          </div>
        </div>

        {/* =====================================================
            BOTTOM BAR
        ====================================================== */}

        <div className="flex flex-col gap-5 py-7 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs text-neutral-500">
              {L(`© ${year} Nirdeshona Inc. All rights reserved.`, `© ${digits(year)} Nirdeshona Inc. সর্বস্বত্ব সংরক্ষিত।`)}
            </p>

            <p className="mt-1 text-[11px] text-neutral-600">
              {L("Built with care in Bangladesh.", "বাংলাদেশে যত্ন নিয়ে তৈরি।")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <LanguageSwitcherFull dark />
            <Link
              href="/privacy"
              className="text-xs text-neutral-500 transition hover:text-white"
            >
              {L("Privacy", "গোপনীয়তা")}
            </Link>

            <Link
              href="/terms"
              className="text-xs text-neutral-500 transition hover:text-white"
            >
              {L("Terms", "শর্তাবলি")}
            </Link>

            <a
              href="#top"
              aria-label={L("Back to top", "উপরে যান")}
              className="group flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-neutral-500 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
            >
              <ChevronUp className="h-4 w-4 transition group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* =========================================================
   FOOTER COLUMN
========================================================= */

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
        {title}
      </h3>

      <nav className="mt-5 space-y-3">{children}</nav>
    </div>
  );
}

/* =========================================================
   FOOTER LINK
========================================================= */

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex w-fit items-center text-sm text-neutral-400 transition hover:text-white"
    >
      <span>{children}</span>

      <ArrowUpRight className="ml-1.5 h-3 w-3 opacity-0 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-70" />
    </Link>
  );
}
