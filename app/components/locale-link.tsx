"use client";

import NextLink from "next/link";
import { forwardRef, type ComponentProps } from "react";

import { localizePath } from "@/lib/i18n/config";
import { useLocale } from "@/lib/i18n/client";

/**
 * Drop-in replacement for next/link that keeps the visitor in their language:
 * "/about" becomes "/bn/about" or "/en/about". External links, /admin and
 * /api are left alone.
 */
const Link = forwardRef<HTMLAnchorElement, ComponentProps<typeof NextLink>>(function Link({ href, ...rest }, ref) {
  const locale = useLocale();
  const localized = typeof href === "string" ? localizePath(locale, href) : href;
  return <NextLink ref={ref} href={localized} {...rest} />;
});

export default Link;
