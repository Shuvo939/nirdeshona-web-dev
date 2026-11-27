import "server-only";

import { headers } from "next/headers";
import { cache } from "react";

import { DEFAULT_LOCALE, LOCALE_HEADER, bnLongMonth, isLocale, localizePath, type Locale } from "./config";

/** The locale of the current request (set by proxy.ts from the /bn or /en prefix). */
export const getLocale = cache(async (): Promise<Locale> => {
  const value = (await headers()).get(LOCALE_HEADER);
  return isLocale(value) ? value : DEFAULT_LOCALE;
});

/** Picks the message for the current request's language (for server actions and API errors). */
export async function msg(en: string, bn: string) {
  return (await getLocale()) === "bn" ? bn : en;
}

/**
 * Returns helpers for the current locale:
 *  - L("English", "বাংলা") picks the right string,
 *  - lp("/about") adds the locale prefix,
 *  - num()/date() format numbers and dates for the locale.
 */
export async function getI18n() {
  const locale = await getLocale();
  return makeI18n(locale);
}

export function makeI18n(locale: Locale) {
  const bn = locale === "bn";
  const numberFmt = new Intl.NumberFormat(bn ? "bn-BD" : "en-US");
    const statFmt = new Intl.NumberFormat("en-US");
  return {
    locale,
    bn,
    L: <T,>(en: T, bnValue: T): T => (bn ? bnValue : en),
    lp: (href: string) => localizePath(locale, href),
    num: (n: number) => numberFmt.format(n),
    /** Counts and statistics (views, reactions, totals): always English digits. */
    stat: (n: number) => statFmt.format(n),
    /** Digits only, no thousands separator — for years and IDs. */
    digits: (n: number | string) => (bn ? String(n).replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]) : String(n)),
    date: (value: string | Date | null | undefined, options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) =>
      value ? new Intl.DateTimeFormat(bn ? "bn-BD" : "en-GB", { timeZone: "Asia/Dhaka", ...bnLongMonth(bn, options) }).format(new Date(value)) : "",
  };
}

/** Canonical + hreflang alternates for a bare path such as "/about". */
export function localeAlternates(locale: Locale, path: string) {
  return {
    canonical: localizePath(locale, path),
    languages: { "bn-BD": localizePath("bn", path), en: localizePath("en", path), "x-default": localizePath("bn", path) },
  };
}
