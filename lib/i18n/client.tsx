"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useMemo } from "react";

import { DEFAULT_LOCALE, localizePath, stripLocale, type Locale } from "./config";
import { translateFieldErrors, translateMessage } from "./messages";

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const pathname = usePathname();
  // The root layout is shared by /bn and /en, so a client-side navigation that
  // crosses languages (e.g. browser back after switching) would keep the old
  // layout. Reload once so <html lang>, fonts and strings match the URL.
  useEffect(() => {
    const first = window.location.pathname.split("/")[1];
    if ((first === "bn" || first === "en") && first !== locale) window.location.reload();
  }, [pathname, locale]);
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}

/** Client-side twin of getI18n(): L("English", "বাংলা"), lp("/path"), num(), date(). */
export function useI18n() {
  const locale = useLocale();
  return useMemo(() => {
    const bn = locale === "bn";
    const numberFmt = new Intl.NumberFormat(bn ? "bn-BD" : "en-US");
    return {
      locale,
      bn,
      L: <T,>(en: T, bnValue: T): T => (bn ? bnValue : en),
      lp: (href: string) => localizePath(locale, href),
      /** Translates a known English server message (validation/auth/upload errors). */
      tm: <M extends string | null | undefined>(message: M) => translateMessage(locale, message),
      tfe: (errors: Record<string, string> | undefined) => translateFieldErrors(locale, errors),
      num: (n: number) => numberFmt.format(n),
      /** Digits only, no thousands separator — for years and IDs. */
      digits: (n: number | string) => (bn ? String(n).replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]) : String(n)),
      date: (value: string | Date | null | undefined, options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) =>
        value ? new Intl.DateTimeFormat(bn ? "bn-BD" : "en-GB", { timeZone: "Asia/Dhaka", ...options }).format(new Date(value)) : "",
    };
  }, [locale]);
}

/** Current path without the /bn or /en prefix — for "is this link active?" checks. */
export function useBarePathname() {
  return stripLocale(usePathname() ?? "/");
}
