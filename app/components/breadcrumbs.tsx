import { ChevronRight, Home } from "lucide-react";

import Link from "@/app/components/locale-link";
import T from "@/app/components/t";

export type Crumb = { label: string; href?: string };

/**
 * One-line breadcrumb. Home is an icon; the current page is the last item and
 * truncates with an ellipsis. On phones, when the trail is long, the middle
 * steps collapse into "…" (linking to the parent) so it never wraps.
 */
export default function Breadcrumbs({ items, className = "" }: { items: Crumb[]; className?: string }) {
  const last = items.length - 1;
  const parent = [...items.slice(0, last)].reverse().find((c) => c.href);

  return (
    <nav aria-label="Breadcrumb" className={`min-w-0 ${className}`}>
      <ol className="flex min-w-0 flex-nowrap items-center gap-1 whitespace-nowrap text-[13px] leading-6 text-neutral-500">
        <li className="flex shrink-0 items-center">
          <Link
            href="/"
            className="flex h-7 items-center gap-1.5 rounded-md px-1 transition hover:bg-black/[0.04] hover:text-neutral-950"
          >
            <Home className="h-3.5 w-3.5" aria-hidden />
            <span className="sr-only sm:not-sr-only">
              <T en="Home" bn="হোম" />
            </span>
          </Link>
        </li>

        {items.length > 2 && parent?.href && (
          <li className="flex shrink-0 items-center gap-1 sm:hidden">
            <ChevronRight className="h-3.5 w-3.5 text-neutral-300" aria-hidden />
            <Link href={parent.href} aria-label={parent.label} className="flex h-7 items-center rounded-md px-1.5 transition hover:bg-black/[0.04] hover:text-neutral-950">
              …
            </Link>
          </li>
        )}

        {items.map((crumb, i) => {
          const isLast = i === last;
          // On phones a long trail keeps only the current page (the "…" stands in for the rest).
          const hideOnPhone = items.length > 2 && !isLast;
          return (
            <li key={`${crumb.label}-${i}`} className={`items-center gap-1 ${isLast ? "flex min-w-0" : hideOnPhone ? "hidden shrink-0 sm:flex" : "flex shrink-0"}`}>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-neutral-300" aria-hidden />
              {isLast && crumb.href ? (
                <Link
                  href={crumb.href}
                  className="flex h-7 min-w-0 items-center rounded-md px-1 font-medium text-neutral-900 transition hover:bg-black/[0.04]"
                >
                  <span className="truncate">{crumb.label}</span>
                </Link>
              ) : isLast || !crumb.href ? (
                <span aria-current={isLast ? "page" : undefined} className={`truncate px-1 ${isLast ? "font-medium text-neutral-900" : ""}`} title={crumb.label}>
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="flex h-7 max-w-[11rem] items-center truncate rounded-md px-1 transition hover:bg-black/[0.04] hover:text-neutral-950"
                >
                  <span className="truncate">{crumb.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
