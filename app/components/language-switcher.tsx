"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Languages } from "lucide-react";

import { LOCALES, LOCALE_NAMES, localizePath, type Locale } from "@/lib/i18n/config";
import { useLocale } from "@/lib/i18n/client";

// Plain <a> on purpose: switching language must reload the document so the root
// layout (html lang, font, provider) re-renders for the new locale.
function useSwitchHref() {
  const pathname = usePathname() ?? "/";
  const params = useSearchParams();
  return (target: Locale) => {
    const query = params?.toString();
    return localizePath(target, pathname) + (query ? `?${query}` : "");
  };
}

/** Compact pill: "বাং | EN". */
function CompactInner({ className = "" }: { className?: string }) {
  const locale = useLocale();
  const hrefFor = useSwitchHref();
  return (
    <div className={`inline-flex items-center rounded-xl border border-neutral-200 bg-white p-0.5 text-[11px] font-semibold ${className}`} role="group" aria-label="Language / ভাষা">
      {LOCALES.map((l) => (
        <a
          key={l}
          href={hrefFor(l)}
          hrefLang={l === "bn" ? "bn-BD" : "en"}
          lang={l}
          aria-current={l === locale ? "true" : undefined}
          className={`rounded-[10px] px-2 py-1.5 transition ${l === locale ? "bg-neutral-950 text-white" : "text-neutral-500 hover:text-neutral-950"}`}
        >
          {l === "bn" ? "বাং" : "EN"}
        </a>
      ))}
    </div>
  );
}

/** Full row with names, for menus and the footer. */
function FullInner({ dark = false }: { dark?: boolean }) {
  const locale = useLocale();
  const hrefFor = useSwitchHref();
  return (
    <div className={`inline-flex items-center gap-1 rounded-xl border p-1 text-sm ${dark ? "border-white/10 bg-white/5" : "border-neutral-200 bg-white"}`} role="group" aria-label="Language / ভাষা">
      <Languages className={`mx-1.5 h-4 w-4 ${dark ? "text-neutral-500" : "text-neutral-400"}`} />
      {LOCALES.map((l) => (
        <a
          key={l}
          href={hrefFor(l)}
          hrefLang={l === "bn" ? "bn-BD" : "en"}
          lang={l}
          aria-current={l === locale ? "true" : undefined}
          className={`rounded-lg px-3 py-1.5 font-medium transition ${
            l === locale ? (dark ? "bg-white text-neutral-950" : "bg-neutral-950 text-white") : dark ? "text-neutral-400 hover:text-white" : "text-neutral-600 hover:text-neutral-950"
          }`}
        >
          {LOCALE_NAMES[l]}
        </a>
      ))}
    </div>
  );
}

export function LanguageSwitcher({ className }: { className?: string }) {
  return (
    <Suspense fallback={null}>
      <CompactInner className={className} />
    </Suspense>
  );
}

export function LanguageSwitcherFull({ dark }: { dark?: boolean }) {
  return (
    <Suspense fallback={null}>
      <FullInner dark={dark} />
    </Suspense>
  );
}
