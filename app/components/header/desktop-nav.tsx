"use client";

import Link from "next/link";
import { useState } from "react";
import { ServiceIcon } from "@/app/components/marketing";
import { services } from "@/lib/site";
import {
  ArrowRight,
  ArrowUpRight,
  Code2,
  Globe,
  Palette,
  Search,
  ChevronDown,
  Sparkles,
  Layers3,
} from "lucide-react";


type Props = {
  role: string | null;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function DesktopNav({ role }: Props) {
  const [servicesOpen, setServicesOpen] = useState(false);

  const navClass = `
    relative rounded-xl px-3.5 py-2.5
    text-sm font-medium text-neutral-600
    transition-all duration-200
    hover:bg-neutral-100
    hover:text-neutral-950
  `;

  return (
    <>
      <nav className="flex items-center gap-0.5">

        {/* =====================================================
            HOME
        ====================================================== */}


        {/* =====================================================
            SERVICES
        ====================================================== */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setServicesOpen((value) => !value)}
            aria-expanded={servicesOpen}
            aria-haspopup="menu"
            className={`
              flex items-center gap-1.5
              rounded-xl px-3.5 py-2.5
              text-sm font-medium
              transition-all duration-200
              ${
                servicesOpen
                  ? "bg-neutral-100 text-neutral-950"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
              }
            `}
          >
            Services

            <ChevronDown
              className={`
                h-3.5 w-3.5
                transition-transform duration-200
                ${servicesOpen ? "rotate-180" : ""}
              `}
            />
          </button>

          {servicesOpen && (
            <>
              {/* Outside click */}
              <button
                type="button"
                aria-label="Close services menu"
                onClick={() => setServicesOpen(false)}
                className="fixed inset-0 z-40 cursor-default"
              />

              {/* =================================================
                  MEGA MENU
              ================================================== */}
              <div
                className="
                  absolute left-1/2 top-full z-50
                  mt-3.5 w-[640px]
                  -translate-x-1/2
                  overflow-hidden
                  rounded-bl-2xl rounded-br-2xl
                  border border-neutral-200
                  bg-white
                  shadow-[0_24px_70px_rgba(0,0,0,0.14)]
                "
              >
                {/* Header */}
                <div className="border-b border-neutral-100 bg-neutral-50/80 px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                        What we do
                      </p>

                      <p className="mt-1 text-sm font-semibold tracking-tight text-neutral-950">
                        Digital solutions for real needs
                      </p>
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-950 text-white">
                      <Sparkles className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                <div className="p-2.5">

                  <div className="grid grid-cols-2 gap-0.5">
                    {services.map((service) => (
                      <ServiceItem
                        key={service.slug}
                        href={`/services/${service.slug}`}
                        icon={<ServiceIcon icon={service.icon} />}
                        title={service.title}
                        description={service.short}
                        onClick={() => setServicesOpen(false)}
                      />
                    ))}
                  </div>

                  {/* Divider */}
                  <div className="my-2 border-t border-neutral-100" />

                  {/* =================================================
                      CUSTOM SOLUTION
                  ================================================== */}
                  <Link
                    href="/contact"
                    onClick={() => setServicesOpen(false)}
                    className="
                      group flex items-center gap-3
                      rounded-xl
                      bg-neutral-950
                      px-4 py-3.5
                      text-white
                      transition
                      hover:bg-neutral-800
                    "
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                      <Sparkles className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">
                        Need something custom?
                      </p>

                      <p className="mt-0.5 text-xs text-neutral-400">
                        Tell us what you are trying to build.
                      </p>
                    </div>

                    <ArrowUpRight className="h-4 w-4 shrink-0 text-neutral-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
                  </Link>
                </div>

                {/* Bottom metadata */}
                <div className="flex items-center justify-between border-t border-neutral-100 bg-neutral-50/70 px-5 py-3">
                  <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.12em] text-neutral-400">
                    <Layers3 className="h-3 w-3" />
                    Web · Design · Technology
                  </div>

                  <Link
                    href="/services"
                    onClick={() => setServicesOpen(false)}
                    className="group flex items-center gap-1 text-xs font-medium text-neutral-600 hover:text-neutral-950"
                  >
                    All services
                    <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* =====================================================
            OUR WORK
        ====================================================== */}
        <Link href="/projects" className={navClass}>
          Our Work
        </Link>

        {/* =====================================================
            ABOUT
        ====================================================== */}
        <Link href="/pricing" className={navClass}>
          Pricing
        </Link>

        <Link href="/blog" className={navClass}>
          Blog
        </Link>

        <Link href="/about" className={navClass}>
          About
        </Link>

        {/* =====================================================
            CONTACT
        ====================================================== */}
        <Link href="/contact" className={navClass}>
          Contact
        </Link>
      </nav>

    </>
  );
}

/* ============================================================
   SERVICE ITEM
============================================================ */

function ServiceItem({
  href,
  icon,
  title,
  description,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="
        group flex gap-3
        rounded-xl
        p-3
        transition
        hover:bg-neutral-50
      "
    >
      <div
        className="
          flex h-11 w-11 shrink-0
          items-center justify-center
          rounded-xl
          bg-neutral-100
          text-neutral-700
          transition
          group-hover:bg-neutral-950
          group-hover:text-white
        "
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold tracking-tight text-neutral-950">
            {title}
          </p>

          <ArrowUpRight
            className="
              h-4 w-4 shrink-0
              text-neutral-300
              transition
              group-hover:-translate-y-0.5
              group-hover:translate-x-0.5
              group-hover:text-neutral-700
            "
          />
        </div>

        <p className="mt-1 text-xs leading-5 text-neutral-500">
          {description}
        </p>
      </div>
    </Link>
  );
}