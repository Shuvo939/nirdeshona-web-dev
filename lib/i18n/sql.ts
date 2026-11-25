import "server-only";

import { sql } from "@/lib/db";

import type { Locale } from "./config";

/**
 * Localized column: for Bangla, `title_bn` falling back to `title`; for
 * English, `title` falling back to `title_bn`. Pass the qualified column,
 * e.g. tcol(locale, "p.title").
 */
export function tcol(locale: Locale, column: string) {
  const bn = sql(`${column}_bn`);
  const en = sql(column);
  return locale === "bn" ? sql`coalesce(nullif(${bn}, ''), ${en})` : sql`coalesce(nullif(${en}, ''), ${bn})`;
}
