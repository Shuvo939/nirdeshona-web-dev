"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  Sparkles,
} from "lucide-react";

type Status = "idle" | "sending" | "sent" | "error";

const MAX_MESSAGE_LENGTH = 2000;

const services = [
  "Web Development",
  "WordPress Development",
  "UI / UX Design",
  "Website Redesign",
  "Web Application",
  "Maintenance & Support",
  "Custom Project",
  "Not sure yet",
];

const budgets = [
  "Under $500",
  "$500 – $1,000",
  "$1,000 – $2,500",
  "$2,500 – $5,000",
  "$5,000+",
  "Let's discuss",
];

export default function ContactPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [messageLength, setMessageLength] = useState(0);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (status === "sending") return;

    setStatus("sending");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      service: String(formData.get("service") ?? "").trim(),
      budget: String(formData.get("budget") ?? "").trim(),
      preferred_contact_method: String(
        formData.get("preferred_contact_method") ?? ""
      ).trim(),
      message: String(formData.get("message") ?? "").trim(),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to submit contact form");
      }

      setStatus("sent");
      form.reset();
      setMessageLength(0);
    } catch {
      setStatus("error");
    }
  }

  return (
    <main className="min-h-[calc(100vh-72px)] bg-neutral-50">
      {/* =====================================================
          HERO
      ====================================================== */}
      <section className="relative overflow-hidden border-b border-neutral-200 bg-white">
        {/* Decorative background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div className="absolute left-1/2 top-[-260px] h-[520px] w-[760px] -translate-x-1/2 rounded-full bg-neutral-100 blur-3xl" />

          <div className="absolute right-[-120px] top-20 h-72 w-72 rounded-full border border-neutral-200/80" />

          <div className="absolute left-[-160px] bottom-[-160px] h-80 w-80 rounded-full border border-neutral-200/80" />

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
            {/* Badge */}
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
              Tell us what you&apos;re working on, what you need, and where
              you&apos;d like to go. We&apos;ll review your project and get back
              to you with the next steps.
            </p>

            {/* Quick info */}
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
              LEFT — CONTACT INFO
          ================================================== */}
          <aside className="space-y-6">
            {/* Intro card */}
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white">
                <Send className="h-5 w-5" />
              </div>

              <h2 className="mt-5 text-xl font-semibold tracking-tight text-neutral-950">
                Start a conversation
              </h2>

              <p className="mt-3 text-sm leading-7 text-neutral-500">
                Whether you need a new website, an application, a redesign, or
                ongoing support, send us a few details and we&apos;ll take it
                from there.
              </p>
            </div>

            {/* Contact details */}
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
                  <div key={item.number} className="flex gap-4">
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
            {status === "sent" ? (
              <SuccessState />
            ) : (
              <>
                <div className="border-b border-neutral-200 pb-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
                    Project inquiry
                  </p>

                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-neutral-950">
                    Tell us about your project
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-neutral-500">
                    The more details you provide, the better we can understand
                    what you need.
                  </p>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="mt-8 space-y-6"
                  noValidate
                >
                  {/* Name + Email */}
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                      label="Name"
                      name="name"
                      type="text"
                      placeholder="Your name"
                      required
                    />

                    <Field
                      label="Email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                    />
                  </div>

                  {/* Phone + Preferred contact */}
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                      label="Phone"
                      name="phone"
                      type="tel"
                      placeholder="+880..."
                    />

                    <div>
                      <label
                        htmlFor="preferred_contact_method"
                        className="mb-2 block text-sm font-medium text-neutral-800"
                      >
                        Preferred contact
                      </label>

                      <select
                        id="preferred_contact_method"
                        name="preferred_contact_method"
                        defaultValue="Email"
                        className="h-12 w-full rounded-xl border border-neutral-200 bg-white px-3.5 text-sm text-neutral-800 outline-none transition focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10"
                      >
                        <option>Email</option>
                        <option>Phone</option>
                        <option>WhatsApp</option>
                      </select>
                    </div>
                  </div>

                  {/* Service */}
                  <div>
                    <label
                      htmlFor="service"
                      className="mb-2 block text-sm font-medium text-neutral-800"
                    >
                      What can we help you with?
                    </label>

                    <select
                      id="service"
                      name="service"
                      required
                      defaultValue=""
                      className="h-12 w-full rounded-xl border border-neutral-200 bg-white px-3.5 text-sm text-neutral-800 outline-none transition focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10"
                    >
                      <option value="" disabled>
                        Select a service
                      </option>

                      {services.map((service) => (
                        <option key={service} value={service}>
                          {service}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Budget */}
                  <div>
                    <label
                      htmlFor="budget"
                      className="mb-2 block text-sm font-medium text-neutral-800"
                    >
                      Estimated budget
                    </label>

                    <select
                      id="budget"
                      name="budget"
                      defaultValue=""
                      className="h-12 w-full rounded-xl border border-neutral-200 bg-white px-3.5 text-sm text-neutral-800 outline-none transition focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10"
                    >
                      <option value="" disabled>
                        Select a budget range
                      </option>

                      {budgets.map((budget) => (
                        <option key={budget} value={budget}>
                          {budget}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-neutral-800"
                      >
                        Project details
                      </label>

                      <span
                        className={`text-xs ${
                          messageLength > MAX_MESSAGE_LENGTH * 0.9
                            ? "text-red-500"
                            : "text-neutral-400"
                        }`}
                      >
                        {messageLength}/{MAX_MESSAGE_LENGTH}
                      </span>
                    </div>

                    <textarea
                      id="message"
                      name="message"
                      required
                      minLength={20}
                      maxLength={MAX_MESSAGE_LENGTH}
                      rows={7}
                      placeholder="Tell us about your project, goals, required features, timeline, existing website, or anything else that may help us understand your needs..."
                      onChange={(event) =>
                        setMessageLength(event.target.value.length)
                      }
                      className="w-full resize-y rounded-xl border border-neutral-200 bg-white px-3.5 py-3 text-sm leading-6 text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10"
                    />

                    <p className="mt-2 text-xs text-neutral-400">
                      Please provide at least 20 characters.
                    </p>
                  </div>

                  {/* Error */}
                  {status === "error" && (
                    <div
                      role="alert"
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                      <p className="font-medium">
                        We couldn&apos;t send your message.
                      </p>

                      <p className="mt-1 text-xs text-red-600">
                        Please check your information and try again. If the
                        problem continues, contact us directly by email.
                      </p>
                    </div>
                  )}

                  {/* Submit */}
                  <div className="flex flex-col gap-4 border-t border-neutral-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <p className="max-w-sm text-xs leading-5 text-neutral-400">
                      By submitting this form, you agree that we may contact
                      you regarding your inquiry.
                    </p>

                    <button
                      type="submit"
                      disabled={status === "sending"}
                      className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-black px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {status === "sending" ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send inquiry
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
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
              Explore our work or learn more about what we do.
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
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ============================================================
   FIELD COMPONENT
============================================================ */

function Field({
  label,
  name,
  type,
  placeholder,
  required = false,
}: {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium text-neutral-800"
      >
        {label}
        {required && <span className="ml-1 text-neutral-400">*</span>}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="h-12 w-full rounded-xl border border-neutral-200 bg-white px-3.5 text-sm text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10"
      />
    </div>
  );
}

/* ============================================================
   SUCCESS STATE
============================================================ */

function SuccessState() {
  return (
    <div className="flex min-h-[560px] flex-col items-center justify-center py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-950 text-white shadow-lg">
        <CheckCircle2 className="h-8 w-8" />
      </div>

      <div className="mt-7">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-400">
          Message received
        </p>

        <h2 className="mt-3 text-3xl font-bold tracking-tight text-neutral-950">
          Thanks for reaching out.
        </h2>

        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-neutral-500">
          Your inquiry has been submitted successfully. We&apos;ll review the
          details and get back to you as soon as possible.
        </p>
      </div>

      <div className="mt-8 grid w-full max-w-md gap-3 sm:grid-cols-2">
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-black px-5 text-sm font-medium text-white transition hover:bg-neutral-800"
        >
          Back to home
        </Link>

        <Link
          href="/projects"
          className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-200 px-5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
        >
          View our work
        </Link>
      </div>
    </div>
  );
}