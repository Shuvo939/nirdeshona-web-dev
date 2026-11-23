import type { Metadata } from "next";

import { createCaptcha } from "@/lib/captcha";
import Link from "next/link";
import {
  Clock3,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  Sparkles,
} from "lucide-react";

import ContactForm from "@/app/components/contact/contact-form";

export const metadata: Metadata = {
  title: "Contact — Nirdeshona Web",
  description: "Tell us about your project. We reply within one business day.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; message?: string }>;
}) {
  const { service, message } = await searchParams;

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
                Let&apos;s work together
              </span>
            </div>

            <h1 className="mt-7 max-w-3xl text-4xl font-bold tracking-[-0.04em] text-neutral-950 sm:text-5xl lg:text-6xl">
              Have a project in mind?
              <span className="block text-neutral-400">
                Let&apos;s build something great.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-neutral-500 sm:text-lg">
              Tell us what you&apos;re working on,
              what you need, and where you&apos;d like to
              go. We&apos;ll review your project and get
              back to you with the next steps.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-600 shadow-sm">
                <Clock3 className="h-4 w-4 text-neutral-400" />
                Usually replies within 1 business day
              </div>

              <div className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-600 shadow-sm">
                <MessageSquare className="h-4 w-4 text-neutral-400" />
                No commitment required
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTACT CONTENT
      ====================================================== */}

      <section className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-8 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
          {/* =================================================
              LEFT
          ================================================== */}

          <aside className="space-y-6">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white">
                <Send className="h-5 w-5" />
              </div>

              <h2 className="mt-5 text-xl font-semibold tracking-tight text-neutral-950">
                Start a conversation
              </h2>

              <p className="mt-3 text-sm leading-7 text-neutral-500">
                Whether you need a new website, an
                application, a redesign, or ongoing
                support, send us a few details and
                we&apos;ll take it from there.
              </p>
            </div>

            {/* Contact information */}

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-7">
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-neutral-400">
                Contact information
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
                      Email
                    </p>

                    <p className="mt-1 truncate text-sm font-medium text-neutral-800 group-hover:text-black">
                      contact.nirdeshona@gmail.com
                    </p>
                  </div>
                </a>

                <a
                  href="tel:+8801000000000"
                  className="group flex items-start gap-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 transition group-hover:bg-black group-hover:text-white">
                    <Phone className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-neutral-400">
                      Phone
                    </p>

                    <p className="mt-1 text-sm font-medium text-neutral-800 group-hover:text-black">
                      +880 1000-000000
                    </p>
                  </div>
                </a>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600">
                    <MapPin className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-neutral-400">
                      Location
                    </p>

                    <p className="mt-1 text-sm font-medium text-neutral-800">
                      Bangladesh
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Process */}

            <div className="rounded-3xl border border-neutral-200 bg-neutral-950 p-6 text-white shadow-sm sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                What happens next?
              </p>

              <div className="mt-6 space-y-5">
                {[
                  {
                    number: "01",
                    title: "You send the details",
                    text: "Tell us about your project and requirements.",
                  },
                  {
                    number: "02",
                    title: "We review it",
                    text: "We look at your goals, scope and requirements.",
                  },
                  {
                    number: "03",
                    title: "We get in touch",
                    text: "We'll discuss the best way to move forward.",
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
              Not ready to start a project?
            </p>

            <p className="mt-1 text-sm text-neutral-500">
              Explore our work or learn more about
              what we do.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/projects"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-neutral-200 px-4 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              View our work
            </Link>

            <Link
              href="/services"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-black px-4 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              Explore services

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