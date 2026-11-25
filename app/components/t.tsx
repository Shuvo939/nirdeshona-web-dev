"use client";

import { useLocale } from "@/lib/i18n/client";

/** Renders the English or Bangla text for the current locale. Handy inside shared, non-client modules. */
export default function T({ en, bn }: { en: React.ReactNode; bn: React.ReactNode }) {
  return <>{useLocale() === "bn" ? bn : en}</>;
}
