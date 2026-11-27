"use client";

import { ServiceIcon } from "@/app/components/marketing";
import { LanguageSwitcherFull } from "@/app/components/language-switcher";
import { ThemeSwitch } from "@/app/components/theme-toggle";
import { getContent } from "@/lib/content";
import { useI18n } from "@/lib/i18n/client";
import Link from "@/app/components/locale-link";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  ChevronRight,
  Code2,
  FileText,
  Globe2,
  Menu,
  Newspaper,
  Palette,
  Sparkles,
  Tag,
  X,
} from "lucide-react";

type Props = {
  authenticated: boolean;
  role: string | null;
};

export default function MobileNav({
  authenticated,
  role,
}: Props) {
  const [open, setOpen] = useState(false);
  const { L, locale } = useI18n();
  const services = getContent(locale).services.map((s) => ({
    title: s.title,
    description: s.short,
    href: `/services/${s.slug}`,
    icon: s.icon,
  }));

  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  function close() {
    setOpen(false);
  }

  return (
    <div className="lg:hidden">
      {/* =====================================================
          MENU TRIGGER
      ====================================================== */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={L("Open navigation", "মেনু খুলুন")}
        aria-expanded={open}
        className="
          flex h-10 w-10 items-center justify-center
          rounded-xl border border-neutral-200
          bg-white text-neutral-700
          shadow-sm transition
          hover:border-neutral-300
          hover:bg-neutral-50
          active:scale-95
        "
      >
        <Menu className="h-[19px] w-[19px]" />
      </button>

      {/* =====================================================
          FULL SCREEN NAVIGATION
      ====================================================== */}
      {open && (
        <div
          className="
            fixed inset-0 z-[999]
            h-[100dvh] w-screen
            bg-white text-neutral-950
          "
        >
          {/* =================================================
              TOP BAR
          ================================================== */}
          <header className="border-b border-neutral-200">
            <div className="flex h-[65px] items-center justify-between px-4 sm:px-6">

              <Link
                href="/"
                onClick={close}
                className="group flex items-center gap-3"
              >
                <div
                  className="
                    flex h-10 w-10 items-center justify-center
                    rounded-xl bg-neutral-950
                    text-sm font-bold text-white
                    shadow-sm transition
                    group-hover:scale-105
                  "
                >
                  N
                </div>

                <div>
                  <p className="text-[15px] font-bold tracking-tight">
                    {L("Nirdeshona", "নির্দেশনা")}
                  </p>

                  <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                    {L("Web Development", "ওয়েব ডেভেলপমেন্ট")}
                  </p>
                </div>
              </Link>

              <button
                type="button"
                onClick={close}
                aria-label={L("Close navigation", "মেনু বন্ধ করুন")}
                className="
                  flex h-10 w-10 items-center justify-center
                  rounded-xl border border-neutral-200
                  text-neutral-600 transition
                  hover:bg-neutral-50
                  hover:text-neutral-950
                  active:scale-95
                "
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </header>

          {/* =================================================
              CONTENT
          ================================================== */}
          <div className="h-[calc(100dvh-72px)] overflow-y-auto">
            <div className="mx-auto max-w-xl px-4 py-6 sm:px-6">

              {/* =================================================
                  MAIN NAVIGATION
              ================================================== */}
              <nav className="space-y-1">

                <MobileLink
                  href="/"
                  label={L("Home", "হোম")}
                  description={L("Nirdeshona homepage", "নির্দেশনার হোমপেজ")}
                  icon={<Sparkles className="h-4 w-4" />}
                  onClick={close}
                />

                <MobileLink
                  href="/projects"
                  label={L("Our Work", "আমাদের কাজ")}
                  description={L("Explore our projects", "আমাদের প্রজেক্টগুলো দেখুন")}
                  icon={<FileText className="h-4 w-4" />}
                  onClick={close}
                />

                <MobileLink
                  href="/pricing"
                  label={L("Pricing", "প্রাইসিং")}
                  description={L("Packages and care plans", "প্যাকেজ ও কেয়ার প্ল্যান")}
                  icon={<Tag className="h-4 w-4" />}
                  onClick={close}
                />

                <MobileLink
                  href="/blog"
                  label={L("Blog", "ব্লগ")}
                  description={L("Guides and articles", "গাইড ও লেখা")}
                  icon={<Newspaper className="h-4 w-4" />}
                  onClick={close}
                />

                <MobileLink
                  href="/about"
                  label={L("About", "আমাদের সম্পর্কে")}
                  description={L("Learn about Nirdeshona", "নির্দেশনা সম্পর্কে জানুন")}
                  icon={<Globe2 className="h-4 w-4" />}
                  onClick={close}
                />

                <MobileLink
                  href="/contact"
                  label={L("Contact", "যোগাযোগ")}
                  description={L("Let's discuss your project", "আপনার প্রজেক্ট নিয়ে কথা বলি")}
                  icon={<ArrowUpRight className="h-4 w-4" />}
                  onClick={close}
                />
              </nav>

              {/* =================================================
                  SERVICES
              ================================================== */}
              <section className="mt-8">
                <div className="mb-3 flex items-center justify-between px-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">
                    {L("Services", "সার্ভিস")}
                  </p>

                  <Link
                    href="/services"
                    onClick={close}
                    className="
                      flex items-center gap-1
                      text-xs font-medium text-neutral-400
                      transition hover:text-neutral-900
                    "
                  >
                    {L("View all", "সব দেখুন")}
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50/70">
                  {services.map((service, index) => {


                    return (
                      <Link
                        key={service.href}
                        href={service.href}
                        onClick={close}
                        className={`
                          group flex items-center gap-3
                          px-4 py-3.5
                          transition hover:bg-white
                          ${
                            index !== services.length - 1
                              ? "border-b border-neutral-200"
                              : ""
                          }
                        `}
                      >
                        <div
                          className="
                            flex h-9 w-9 shrink-0
                            items-center justify-center
                            rounded-xl bg-white
                            text-neutral-600 shadow-sm
                            ring-1 ring-neutral-200
                            transition
                            group-hover:bg-neutral-950
                            group-hover:text-white
                          "
                        >
                          <ServiceIcon icon={service.icon} className="h-4 w-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-neutral-900">
                            {service.title}
                          </p>

                          <p className="mt-0.5 text-xs text-neutral-500">
                            {service.description}
                          </p>
                        </div>

                        <ChevronRight
                          className="
                            h-4 w-4 shrink-0
                            text-neutral-300
                            transition
                            group-hover:translate-x-0.5
                            group-hover:text-neutral-700
                          "
                        />
                      </Link>
                    );
                  })}
                </div>
              </section>

              {/* =================================================
                  AUTHENTICATED CTA
              ================================================== */}
              {authenticated && (
                <section className="mt-8">
                  <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
                    <div className="flex items-start gap-3">
                      <div
                        className="
                          flex h-9 w-9 shrink-0
                          items-center justify-center
                          rounded-xl bg-neutral-950
                          text-white
                        "
                      >
                        <Sparkles className="h-4 w-4" />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-neutral-950">
                          {L("Your account is ready", "আপনার অ্যাকাউন্ট প্রস্তুত")}
                        </p>

                        <p className="mt-1 text-xs leading-5 text-neutral-500">
                          {L("Use your profile button in the header to access your account and workspace.", "অ্যাকাউন্ট ও কাজের জায়গায় যেতে হেডারের প্রোফাইল বাটন ব্যবহার করুন।")}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      {(
                        <Link
                          href="/account"
                          onClick={close}
                          className="
                            inline-flex flex-1
                            items-center justify-center gap-1.5
                            rounded-xl bg-white
                            px-3 py-2.5
                            text-xs font-semibold
                            text-neutral-800
                            ring-1 ring-neutral-200
                            transition
                            hover:bg-neutral-100
                          "
                        >
                          {L("My account", "আমার অ্যাকাউন্ট")}
                          <ArrowUpRight className="h-3 w-3" />
                        </Link>
                      )}

                      {role === "ADMIN" && (
                        <Link
                          href="/admin"
                          onClick={close}
                          className="
                            inline-flex flex-1
                            items-center justify-center gap-1.5
                            rounded-xl bg-white
                            px-3 py-2.5
                            text-xs font-semibold
                            text-neutral-800
                            ring-1 ring-neutral-200
                            transition
                            hover:bg-neutral-100
                          "
                        >
                          {L("Admin Panel", "অ্যাডমিন প্যানেল")}
                          <ArrowUpRight className="h-3 w-3" />
                        </Link>
                      )}

                      <Link
                        href="/profile"
                        onClick={close}
                        className="
                          inline-flex flex-1
                          items-center justify-center gap-1.5
                          rounded-xl bg-neutral-950
                          px-3 py-2.5
                          text-xs font-semibold
                          text-white transition
                          hover:bg-neutral-800
                        "
                      >
                        {L("Profile", "প্রোফাইল")}
                        <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </section>
              )}

              {/* =================================================
                  GUEST CTA
              ================================================== */}
              {!authenticated && (
                <section className="mt-8">
                  <div className="theme-fixed rounded-2xl bg-neutral-950 p-5 text-white">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold">
                          {L("Ready to build?", "বানাতে প্রস্তুত?")}
                        </p>

                        <p className="mt-1 text-xs leading-5 text-neutral-400">
                          {L("Start a conversation about your next digital project.", "আপনার পরের ডিজিটাল প্রজেক্ট নিয়ে কথা শুরু করুন।")}
                        </p>
                      </div>

                      <Sparkles className="h-5 w-5 shrink-0 text-neutral-400" />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <Link
                        href="/login"
                        onClick={close}
                        className="
                          rounded-xl
                          border border-white/15
                          px-3 py-2.5
                          text-center text-sm
                          font-medium text-white
                          transition hover:bg-white/10
                        "
                      >
                        {L("Log in", "লগইন")}
                      </Link>

                      <Link
                        href="/register"
                        onClick={close}
                        className="
                          rounded-xl bg-white
                          px-3 py-2.5
                          text-center text-sm
                          font-semibold text-black
                          transition hover:bg-neutral-100
                        "
                      >
                        {L("Get started", "শুরু করুন")}
                      </Link>
                    </div>
                  </div>
                </section>
              )}

              {/* =================================================
                  FOOTER
              ================================================== */}
              <div className="flex flex-col items-center gap-3 pt-8">
                <LanguageSwitcherFull />
                <ThemeSwitch />
              </div>
              <div className="pb-8 pt-6 text-center">
                <p className="text-[11px] text-neutral-400">
                  {L("Nirdeshona Web Development", "নির্দেশনা ওয়েব ডেভেলপমেন্ট")}
                </p>

                <p className="mt-1 text-[10px] text-neutral-300">
                  {L("Digital solutions built with purpose.", "উদ্দেশ্য নিয়ে তৈরি ডিজিটাল সমাধান।")}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MobileLink({
  href,
  label,
  description,
  icon,
  onClick,
}: {
  href: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="
        group flex items-center gap-3
        rounded-2xl px-3 py-3
        transition hover:bg-neutral-50
      "
    >
      <div
        className="
          flex h-9 w-9 shrink-0
          items-center justify-center
          rounded-xl bg-neutral-100
          text-neutral-600
          transition
          group-hover:bg-neutral-950
          group-hover:text-white
        "
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-neutral-900">
          {label}
        </p>

        <p className="mt-0.5 text-xs text-neutral-500">
          {description}
        </p>
      </div>

      <ChevronRight
        className="
          h-4 w-4 text-neutral-300
          transition
          group-hover:translate-x-0.5
          group-hover:text-neutral-700
        "
      />
    </Link>
  );
}