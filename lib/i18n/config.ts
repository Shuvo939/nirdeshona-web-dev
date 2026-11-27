export const LOCALES = ["bn", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "bn";
export const LOCALE_COOKIE = "nw_locale";
export const LOCALE_HEADER = "x-nw-locale";

export const LOCALE_NAMES: Record<Locale, string> = { bn: "বাংলা", en: "English" };

export function isLocale(value: unknown): value is Locale {
  return value === "bn" || value === "en";
}

/** Paths that are never localized (admin panel, APIs, auth callbacks, files). */
export function isUnlocalizedPath(pathname: string) {
  return (
    /^\/(admin|api|auth|_next|monitoring|og|icons)(\/|$)/.test(pathname) ||
    /^\/blog\/rss\.xml$/.test(pathname) ||
    /^\/(robots\.txt|sitemap\.xml|manifest\.webmanifest|favicon\.ico|icon\.svg|apple-icon(\.png)?)$/.test(pathname) ||
    /\.[a-z0-9]{2,5}$/i.test(pathname)
  );
}

/** Adds the locale prefix to an internal path ("/about" → "/bn/about"). */
export function localizePath(locale: Locale, href: string) {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const [path, rest = ""] = splitHref(href);
  if (isUnlocalizedPath(path)) return href;
  const current = path.split("/")[1];
  const bare = isLocale(current) ? path.slice(current.length + 1) || "/" : path;
  return `/${locale}${bare === "/" ? "" : bare}${rest}`;
}

/** Removes a locale prefix ("/en/blog" → "/blog"). */
export function stripLocale(pathname: string) {
  const first = pathname.split("/")[1];
  return isLocale(first) ? pathname.slice(first.length + 1) || "/" : pathname;
}

function splitHref(href: string): [string, string] {
  const i = href.search(/[?#]/);
  return i === -1 ? [href, ""] : [href.slice(0, i), href.slice(i)];
}

/** "3 hours ago" / "৩ ঘণ্টা আগে". */
export function timeAgo(value: string | Date, locale: Locale) {
  const then = new Date(value).getTime();
  const seconds = Math.round((then - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale === "bn" ? "bn-BD" : "en", { numeric: "auto" });
  const abs = Math.abs(seconds);
  if (abs < 60) return locale === "bn" ? "এইমাত্র" : "just now";
  if (abs < 3600) return rtf.format(Math.round(seconds / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(seconds / 3600), "hour");
  if (abs < 86400 * 7) return rtf.format(Math.round(seconds / 86400), "day");
  return new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Dhaka" }).format(new Date(value));
}

/** Compact, Facebook-style age: 5s, 3m, 2h, 4d, 2w, 1y (Bangla: ৫সে, ৩মি, ২ঘ, ৪দি, ২স, ১ব). */
export function shortAgo(value: string | Date, locale: Locale) {
  const secs = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  const steps: [number, string, string][] = [
    [60, "s", "সে"],
    [60, "m", "মি"],
    [24, "h", "ঘ"],
    [7, "d", "দি"],
    [52, "w", "স"],
    [Infinity, "y", "ব"],
  ];
  let n = secs;
  for (const [size, en, bn] of steps) {
    if (n < size) {
      const value = Math.max(1, n);
      return locale === "bn" ? `${String(value).replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)])}${bn}` : `${value}${en}`;
    }
    n = Math.floor(n / size);
  }
  return "";
}

/** Date (and optionally time) in the locale's format, Dhaka time. */
export function formatDateLocale(value: string | Date | null | undefined, locale: Locale, withTime = false) {
  if (!value) return "";
  return new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-GB", {
    timeZone: "Asia/Dhaka",
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
  }).format(new Date(value));
}
