"use client";

import Link from "next/link";

import { services } from "@/lib/site";
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
                  Available for new projects
                </div>

                <h2 className="mt-5 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                  Have something worth building?
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-400 sm:text-base">
                  Tell us what you want to build, improve, or solve. We&apos;ll
                  help turn the idea into a practical digital solution.
                </p>
              </div>

              <Link
                href="/contact"
                className="group inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-medium text-neutral-950 transition hover:bg-neutral-200"
              >
                Start a conversation

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
                  Nirdeshona
                </div>

                <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">
                  Web
                </div>
              </div>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-6 text-neutral-400">
              Modern websites, web applications, WordPress solutions, and
              digital experiences designed around real-world needs.
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
                Bangladesh
              </div>

              <div className="flex items-center gap-2.5 text-sm text-neutral-400">
                <Globe2 className="h-4 w-4 text-neutral-500" />
                nirdeshona.com
              </div>
            </div>

            {/* Social */}

            <div className="mt-7 flex items-center gap-2">
              <SocialLink href="#" label="Facebook">
                f
              </SocialLink>

              <SocialLink href="#" label="LinkedIn">
                in
              </SocialLink>

              <SocialLink href="#" label="GitHub">
                gh
              </SocialLink>
            </div>
          </div>

          {/* =================================================
              COMPANY
          ================================================== */}

          <FooterColumn title="Company">
            <FooterLink href="/about">About</FooterLink>
            <FooterLink href="/projects">Our work</FooterLink>
            <FooterLink href="/contact">Contact</FooterLink>
            <FooterLink href="/clients">Clients</FooterLink>
          </FooterColumn>

          {/* =================================================
              SERVICES
          ================================================== */}

          <FooterColumn title="Services">
            {services.map((service) => (
              <FooterLink key={service.slug} href={`/services/${service.slug}`}>
                {service.title}
              </FooterLink>
            ))}
          </FooterColumn>

          {/* =================================================
              RESOURCES
          ================================================== */}

          <FooterColumn title="Resources">
            <FooterLink href="/blog">Blog</FooterLink>
            <FooterLink href="/pricing">Pricing</FooterLink>
            <FooterLink href="/faq">FAQ</FooterLink>
            <FooterLink href="/privacy">Privacy policy</FooterLink>
            <FooterLink href="/terms">Terms of service</FooterLink>

            <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 text-xs font-medium text-neutral-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                Currently available
              </div>

              <p className="mt-2 text-xs leading-5 text-neutral-500">
                We&apos;re currently accepting selected website and digital
                product projects.
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
                Let&apos;s build something useful.
              </p>

              <p className="mt-1 text-xs text-neutral-500">
                Have a question or project in mind?
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <a
                href="mailto:contact.nirdeshona@gmail.com"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-3.5 py-2 text-xs font-medium text-neutral-300 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
              >
                <Mail className="h-3.5 w-3.5" />
                Email us
              </a>

              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-3.5 py-2 text-xs font-medium text-neutral-950 transition hover:bg-neutral-200"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                Contact
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
              © {year} Nirdeshona Web. All rights reserved.
            </p>

            <p className="mt-1 text-[11px] text-neutral-600">
              Built with care in Bangladesh.
            </p>
          </div>

          <div className="flex items-center gap-5">
            <Link
              href="/privacy"
              className="text-xs text-neutral-500 transition hover:text-white"
            >
              Privacy
            </Link>

            <Link
              href="/terms"
              className="text-xs text-neutral-500 transition hover:text-white"
            >
              Terms
            </Link>

            <a
              href="#top"
              aria-label="Back to top"
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

/* =========================================================
   SOCIAL LINK
========================================================= */

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      className="flex h-8 min-w-8 items-center justify-center rounded-lg border border-white/10 px-2 text-[11px] font-semibold text-neutral-500 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
    >
      {children}
    </a>
  );
}