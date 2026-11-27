import Link from "@/app/components/locale-link";
import type { ReactNode } from "react";

import T from "@/app/components/t";
import { formatDateLocale, type Locale } from "@/lib/i18n/config";
import {
  ArrowUpRight,
  ChevronRight,
  Code2,
  Cpu,
  Globe,
  Megaphone,
  Palette,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
} from "lucide-react";

import type { Service } from "@/lib/site";

/* ============================================================
   PAGE HERO — used at the top of every inner page
============================================================ */

export function PageHero({
  eyebrow,
  title,
  description,
  breadcrumbs = [],
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-neutral-200 bg-neutral-50">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.04)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]"
      />
      <div aria-hidden className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-neutral-200/70 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-xs text-neutral-500">
          <Link href="/" className="transition hover:text-neutral-950">
            <T en="Home" bn="হোম" />
          </Link>
          {breadcrumbs.map((crumb) => (
            <span key={crumb.label} className="flex items-center gap-1">
              <ChevronRight className="h-3 w-3 text-neutral-300" />
              {crumb.href ? (
                <Link href={crumb.href} className="transition hover:text-neutral-950">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-neutral-800">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>

        {eyebrow && (
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {eyebrow}
          </div>
        )}

        <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-[1.05] tracking-[-0.045em] text-neutral-950 sm:text-5xl lg:text-6xl">
          {title}
        </h1>

        {description && (
          <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-600 sm:text-lg">
            {description}
          </p>
        )}

        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}

/* ============================================================
   SECTION HEADING
============================================================ */

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">{eyebrow}</p>
      )}
      <h2 className="mt-3 text-3xl font-bold tracking-[-0.035em] text-neutral-950 sm:text-4xl">{title}</h2>
      {description && <p className="mt-4 text-base leading-7 text-neutral-600">{description}</p>}
    </div>
  );
}

/* ============================================================
   BUTTONS
============================================================ */

export function PrimaryButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-neutral-950 px-6 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-lg"
    >
      {children}
      <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </Link>
  );
}

export function SecondaryButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-6 text-sm font-semibold text-neutral-800 transition hover:border-neutral-300 hover:bg-neutral-50"
    >
      {children}
    </Link>
  );
}

/* ============================================================
   SERVICE ICON + CARD
============================================================ */

const ICONS = {
  code: Code2,
  globe: Globe,
  palette: Palette,
  cpu: Cpu,
  cart: ShoppingCart,
  smartphone: Smartphone,
  megaphone: Megaphone,
  shield: ShieldCheck,
};

export function ServiceIcon({ icon, className = "h-5 w-5" }: { icon: Service["icon"]; className?: string }) {
  const Icon = ICONS[icon];
  return <Icon className={className} />;
}

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className="group flex h-full flex-col rounded-3xl border border-neutral-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-950 text-white shadow-sm">
          <ServiceIcon icon={service.icon} />
        </div>
        <ArrowUpRight className="h-5 w-5 text-neutral-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-neutral-950" />
      </div>
      <h3 className="mt-6 text-lg font-semibold tracking-tight text-neutral-950">{service.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-neutral-600">{service.short}</p>
      <div className="mt-6 flex items-center justify-between border-t border-neutral-100 pt-4 text-xs">
        <span className="text-neutral-500">{service.timeline}</span>
        <span className="font-semibold text-neutral-900"><T en="From" bn="শুরু" /> {service.startingFrom}</span>
      </div>
    </Link>
  );
}

/* ============================================================
   FAQ ACCORDION (native <details>, no JS needed)
============================================================ */

export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <details
          key={item.q}
          className="group rounded-2xl border border-neutral-200 bg-white px-5 py-4 transition open:shadow-sm [&_summary::-webkit-details-marker]:hidden"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-neutral-950 sm:text-base">
            {item.q}
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="mt-3 text-sm leading-6 text-neutral-600">{item.a}</p>
        </details>
      ))}
    </div>
  );
}

/* ============================================================
   STATUS BADGES (projects + tickets)
============================================================ */

type StatusMap = Record<string, { label: string; labelBn?: string; className: string }>;

export const PROJECT_STATUS: StatusMap = {
  PLANNED: { label: "Planned", labelBn: "পরিকল্পিত", className: "bg-neutral-100 text-neutral-600" },
  IN_PROGRESS: { label: "In progress", labelBn: "চলমান", className: "bg-blue-50 text-blue-700" },
  REVIEW: { label: "In review", labelBn: "পর্যালোচনায়", className: "bg-amber-50 text-amber-700" },
  COMPLETED: { label: "Completed", labelBn: "সম্পন্ন", className: "bg-emerald-50 text-emerald-700" },
  ON_HOLD: { label: "On hold", labelBn: "স্থগিত", className: "bg-orange-50 text-orange-700" },
};

export const TICKET_STATUS: StatusMap = {
  OPEN: { label: "Open", labelBn: "খোলা", className: "bg-blue-50 text-blue-700" },
  IN_PROGRESS: { label: "In progress", labelBn: "কাজ চলছে", className: "bg-violet-50 text-violet-700" },
  WAITING_FOR_CLIENT: { label: "Awaiting your reply", labelBn: "আপনার উত্তরের অপেক্ষায়", className: "bg-amber-50 text-amber-700" },
  RESOLVED: { label: "Resolved", labelBn: "সমাধান হয়েছে", className: "bg-emerald-50 text-emerald-700" },
  CLOSED: { label: "Closed", labelBn: "বন্ধ", className: "bg-neutral-100 text-neutral-600" },
};

export const TICKET_PRIORITY: StatusMap = {
  LOW: { label: "Low", labelBn: "কম", className: "text-neutral-500" },
  NORMAL: { label: "Normal", labelBn: "সাধারণ", className: "text-neutral-700" },
  HIGH: { label: "High", labelBn: "বেশি", className: "text-orange-600" },
  URGENT: { label: "Urgent", labelBn: "জরুরি", className: "text-red-600" },
};

/** Label of a status in the given locale (for places that need plain text). */
export function statusLabel(map: StatusMap, value: string, locale: Locale = "en") {
  const config = map[value];
  if (!config) return value.replaceAll("_", " ");
  return locale === "bn" && config.labelBn ? config.labelBn : config.label;
}

export function StatusBadge({
  map,
  value,
}: {
  map: StatusMap;
  value: string;
}) {
  const config = map[value] ?? { label: value.replaceAll("_", " "), className: "bg-neutral-100 text-neutral-600" };
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}>
      <T en={config.label} bn={config.labelBn ?? config.label} />
    </span>
  );
}

export function formatDate(value: string | Date | null | undefined, withTime = false, locale?: Locale) {
  if (!value) return "";
  if (locale) return formatDateLocale(value, locale, withTime);
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleString("en-GB", {
    timeZone: "Asia/Dhaka",
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}
