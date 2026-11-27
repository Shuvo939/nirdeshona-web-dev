import type { Metadata } from "next";

import type { Locale } from "@/lib/i18n/config";
import { localizePath } from "@/lib/i18n/config";
import { site } from "@/lib/site";

const base = () => site.url.replace(/\/$/, "");

/** URL of the generated share image for a page title. */
export function ogImageUrl(title: string, eyebrow?: string) {
  const q = new URLSearchParams({ title });
  if (eyebrow) q.set("eyebrow", eyebrow);
  return `/og?${q.toString()}`;
}

/** Open Graph + Twitter fields for a page, with a generated image unless one is given. */
export function socialMeta({
  title,
  description,
  path,
  locale,
  image,
  eyebrow,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  locale: Locale;
  image?: string | null;
  eyebrow?: string;
  type?: "website" | "article";
}): Pick<Metadata, "openGraph" | "twitter"> {
  const images = [{ url: image || ogImageUrl(title, eyebrow), width: 1200, height: 630, alt: title }];
  return {
    openGraph: {
      type,
      title,
      description,
      url: localizePath(locale, path),
      siteName: site.legalName,
      locale: locale === "bn" ? "bn_BD" : "en_US",
      alternateLocale: locale === "bn" ? ["en_US"] : ["bn_BD"],
      images,
    },
    twitter: { card: "summary_large_image", title, description, images: images.map((i) => i.url) },
  };
}

/** schema.org BreadcrumbList for a trail of [name, path] pairs. */
export function breadcrumbLd(locale: Locale, trail: [string, string][]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map(([name, path], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: `${base()}${localizePath(locale, path)}`,
    })),
  };
}

/** schema.org FAQPage from question/answer pairs. */
export function faqLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

export const absoluteUrl = (path: string) => (path.startsWith("http") ? path : `${base()}${path}`);

/** Full metadata for a public page: title, description, canonical + hreflang, and share cards. */
export function pageMeta({
  locale,
  path,
  title,
  description,
  image,
  eyebrow,
  type,
  og,
}: {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  image?: string | null;
  eyebrow?: string;
  type?: "website" | "article";
  /** English text for the generated share image (Bangla can't be drawn there). */
  og?: { title: string; eyebrow?: string };
}): Metadata {
  const languages = { "bn-BD": localizePath("bn", path), en: localizePath("en", path), "x-default": localizePath("bn", path) };
  // The share card shows the page name without the " — Nirdeshona Web" suffix.
  const cardTitle = title.replace(/\s+[—|-]\s+(Nirdeshona Web|নির্দেশনা ওয়েব).*$/, "");
  return {
    title,
    description,
    alternates: { canonical: localizePath(locale, path), languages },
    ...socialMeta({
      title: cardTitle,
      description,
      path,
      locale,
      image: image || ogImageUrl(og?.title ?? cardTitle, og?.eyebrow ?? eyebrow),
      eyebrow,
      type,
    }),
  };
}
