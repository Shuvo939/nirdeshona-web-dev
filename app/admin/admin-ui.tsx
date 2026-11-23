import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function AdminHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-[-0.03em] text-neutral-950 sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-neutral-500">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function FilterTabs({ tabs, active }: { tabs: { value: string; label: string; href: string; count?: number }[]; active: string }) {
  return (
    <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
      {tabs.map((t) => (
        <Link
          key={t.value}
          href={t.href}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition ${
            active === t.value ? "bg-neutral-950 text-white" : "bg-white text-neutral-600 ring-1 ring-neutral-200 hover:text-neutral-950"
          }`}
        >
          {t.label}
          {t.count !== undefined && (
            <span className={`rounded-full px-1.5 text-[11px] ${active === t.value ? "bg-white/20" : "bg-neutral-100 text-neutral-500"}`}>{t.count}</span>
          )}
        </Link>
      ))}
    </div>
  );
}

export function SearchBox({ action, defaultValue, placeholder, hidden = {} }: { action: string; defaultValue?: string; placeholder: string; hidden?: Record<string, string> }) {
  return (
    <form action={action} className="w-full sm:w-72">
      {Object.entries(hidden).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3.5 text-sm outline-none focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10"
      />
    </form>
  );
}

export function Pager({ page, total, perPage, href }: { page: number; total: number; perPage: number; href: (p: number) => string }) {
  const pages = Math.max(1, Math.ceil(total / perPage));
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-neutral-500">
        Page {page} of {pages} · {total} total
      </span>
      <div className="flex gap-2">
        {page > 1 && (
          <Link href={href(page - 1)} className="inline-flex h-9 items-center gap-1 rounded-xl border border-neutral-200 bg-white px-3 hover:bg-neutral-50">
            <ChevronLeft className="h-4 w-4" /> Prev
          </Link>
        )}
        {page < pages && (
          <Link href={href(page + 1)} className="inline-flex h-9 items-center gap-1 rounded-xl border border-neutral-200 bg-white px-3 hover:bg-neutral-50">
            Next <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center text-sm text-neutral-500">{children}</div>;
}

export function Avatar({ name, url, size = "h-9 w-9" }: { name: string | null; url: string | null; size?: string }) {
  return (
    <span className={`${size} flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-100 text-xs font-semibold text-neutral-600`}>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : (
        (name || "?").charAt(0).toUpperCase()
      )}
    </span>
  );
}

export function timeAgo(value: string | Date) {
  const s = (Date.now() - new Date(value).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Dhaka" });
}

export function pageParam(raw?: string) {
  return Math.max(1, Number.parseInt(raw ?? "1", 10) || 1);
}
