"use client";

import Link from "next/link";
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

const services = [
  {
    title: "Web Development",
    description: "Websites & applications",
    href: "/services/web-development",
    icon: Code2,
  },
  {
    title: "WordPress",
    description: "Custom WordPress solutions",
    href: "/services/wordpress",
    icon: Globe2,
  },
  {
    title: "UI / UX Design",
    description: "Interfaces people enjoy",
    href: "/services/design",
    icon: Palette,
  },
];

export default function MobileNav({
  authenticated,
  role,
}: Props) {
  const [open, setOpen] = useState(false);

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
        aria-label="Open navigation"
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
                    Nirdeshona
                  </p>

                  <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                    Web Development
                  </p>
                </div>
              </Link>

              <button
                type="button"
                onClick={close}
                aria-label="Close navigation"
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
                  label="Home"
                  description="Nirdeshona homepage"
                  icon={<Sparkles className="h-4 w-4" />}
                  onClick={close}
                />

                <MobileLink
                  href="/projects"
                  label="Our Work"
                  description="Explore our projects"
                  icon={<FileText className="h-4 w-4" />}
                  onClick={close}
                />

                <MobileLink
                  href="/pricing"
                  label="Pricing"
                  description="Packages and care plans"
                  icon={<Tag className="h-4 w-4" />}
                  onClick={close}
                />

                <MobileLink
                  href="/blog"
                  label="Blog"
                  description="Guides and articles"
                  icon={<Newspaper className="h-4 w-4" />}
                  onClick={close}
                />

                <MobileLink
                  href="/about"
                  label="About"
                  description="Learn about Nirdeshona"
                  icon={<Globe2 className="h-4 w-4" />}
                  onClick={close}
                />

                <MobileLink
                  href="/contact"
                  label="Contact"
                  description="Let's discuss your project"
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
                    Services
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
                    View all
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50/70">
                  {services.map((service, index) => {
                    const Icon = service.icon;

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
                          <Icon className="h-4 w-4" />
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
                          Your account is ready
                        </p>

                        <p className="mt-1 text-xs leading-5 text-neutral-500">
                          Use your profile button in the header to access
                          your account and workspace.
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
                          My account
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
                          Admin Panel
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
                        Profile
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
                  <div className="rounded-2xl bg-neutral-950 p-5 text-white">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold">
                          Ready to build?
                        </p>

                        <p className="mt-1 text-xs leading-5 text-neutral-400">
                          Start a conversation about your next digital
                          project.
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
                        Log in
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
                        Get started
                      </Link>
                    </div>
                  </div>
                </section>
              )}

              {/* =================================================
                  FOOTER
              ================================================== */}
              <div className="pb-8 pt-10 text-center">
                <p className="text-[11px] text-neutral-400">
                  Nirdeshona Web Development
                </p>

                <p className="mt-1 text-[10px] text-neutral-300">
                  Digital solutions built with purpose.
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