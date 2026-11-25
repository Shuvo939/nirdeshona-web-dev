import Link from "@/app/components/locale-link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

import T from "@/app/components/t";

// Page title block for pages inside the account area (sidebar layout).
export default function AccountHeader({
  title,
  description,
  crumbs = [],
  actions,
}: {
  title: string;
  description?: string;
  crumbs?: { label: string; href?: string }[];
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-xs text-neutral-500">
          <Link href="/" className="hover:text-neutral-950"><T en="Home" bn="হোম" /></Link>
          <ChevronRight className="h-3 w-3 text-neutral-300" />
          <Link href="/account" className="hover:text-neutral-950"><T en="Account" bn="অ্যাকাউন্ট" /></Link>
          {crumbs.map((c) => (
            <span key={c.label} className="flex items-center gap-1">
              <ChevronRight className="h-3 w-3 text-neutral-300" />
              {c.href ? (
                <Link href={c.href} className="hover:text-neutral-950">{c.label}</Link>
              ) : (
                <span className="text-neutral-800">{c.label}</span>
              )}
            </span>
          ))}
        </nav>
        <h1 className="mt-3 break-words text-2xl font-bold tracking-[-0.03em] text-neutral-950 sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-neutral-600">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
  );
}
