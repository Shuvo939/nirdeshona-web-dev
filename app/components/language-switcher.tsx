"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { Check, Globe, Languages } from "lucide-react";

import { LOCALES, LOCALE_NAMES, localizePath, type Locale } from "@/lib/i18n/config";
import { useI18n, useLocale } from "@/lib/i18n/client";

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

/** Globe button with a small menu (phones and the mobile footer). */
function MenuInner({ className = "", dark = false, up = false }: { className?: string; dark?: boolean; up?: boolean }) {
  const { locale, L } = useI18n();
  const hrefFor = useSwitchHref();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={L("Language", "ভাষা")}
        aria-expanded={open}
        className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
          dark ? "border border-white/10 bg-white/5 text-neutral-300 hover:text-white" : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
        }`}
      >
        <Globe className="h-[18px] w-[18px]" />
      </button>
      {open && (
        <div
          role="menu"
          className={`absolute z-50 w-44 overflow-hidden rounded-2xl border p-1.5 shadow-[0_18px_50px_rgba(0,0,0,0.18)] ${
            up ? "bottom-full left-0 mb-2" : "right-0 top-full mt-2"
          } ${dark ? "border-white/10 bg-neutral-900" : "border-neutral-200 bg-white"}`}
        >
          {LOCALES.map((l) => (
            <a
              key={l}
              role="menuitemradio"
              aria-checked={l === locale}
              href={hrefFor(l)}
              hrefLang={l === "bn" ? "bn-BD" : "en"}
              lang={l}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition ${
                dark ? "text-neutral-300 hover:bg-white/10 hover:text-white" : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950"
              }`}
            >
              <span className={`w-6 text-xs font-semibold ${dark ? "text-neutral-500" : "text-neutral-400"}`}>{l === "bn" ? "বাং" : "EN"}</span>
              <span className="flex-1">{LOCALE_NAMES[l]}</span>
              {l === locale && <Check className={`h-4 w-4 ${dark ? "text-white" : "text-neutral-950"}`} />}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export function LanguageMenu(props: { className?: string; dark?: boolean; up?: boolean }) {
  return (
    <Suspense fallback={<span className={`inline-block h-10 w-10 ${props.className ?? ""}`} />}>
      <MenuInner {...props} />
    </Suspense>
  );
}
