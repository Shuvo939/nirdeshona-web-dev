// Notifications are stored in English (one row, many readers). This turns the
// known patterns into natural Bangla at display time; anything unknown is shown as-is.
// Client-safe: no server imports.

import type { Locale } from "@/lib/i18n/config";

export type NotificationKind = "comment" | "reply" | "reaction" | "ticket" | "access" | "quote" | "contact" | "system";

const bnDigits = (s: string) => s.replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]);
const who = (name: string) => (name === "Someone" ? "কেউ একজন" : name);

const TITLE_RULES: [RegExp, (...m: string[]) => string][] = [
  [/^(.+) replied to your comment$/, (n) => `${who(n)} আপনার মন্তব্যের উত্তর দিয়েছেন`],
  [/^(.+) commented on “(.+)”$/, (n, t) => `${who(n)} “${t}” লেখায় মন্তব্য করেছেন`],
  [/^(.+) reacted to your comment$/, (n) => `${who(n)} আপনার মন্তব্যে রিঅ্যাকশন দিয়েছেন`],
  [/^(.+) reacted to “(.+)”$/, (n, t) => `${who(n)} “${t}” লেখায় রিঅ্যাকশন দিয়েছেন`],
  [/^You now have access to (.+)$/, (c) => `${c}-এর ক্লায়েন্ট পোর্টাল আপনার জন্য চালু হয়েছে`],
  [/^New ticket #(\d+): (.+)$/, (n, s) => `নতুন টিকেট #${bnDigits(n)}: ${s}`],
  [/^New reply on #(\d+)$/, (n) => `টিকেট #${bnDigits(n)}-এ নতুন উত্তর`],
  [/^Ticket #(\d+) updated$/, (n) => `টিকেট #${bnDigits(n)} আপডেট হয়েছে`],
  [/^New quote request (\S+) from (.+)$/, (r, n) => `${n} নতুন কোটেশন অনুরোধ পাঠিয়েছেন (${r})`],
  [/^New message from (.+)$/, (n) => `${n} নতুন বার্তা পাঠিয়েছেন`],
];

const MESSAGE_RULES: [RegExp, (...m: string[]) => string][] = [
  [/^Your client portal is ready — see project progress and open support tickets\.$/, () => "আপনার ক্লায়েন্ট পোর্টাল প্রস্তুত — প্রজেক্টের অগ্রগতি দেখুন, সাপোর্ট টিকেট খুলুন।"],
];

function apply(text: string, rules: [RegExp, (...m: string[]) => string][]) {
  for (const [re, fn] of rules) {
    const m = text.match(re);
    if (m) return fn(...m.slice(1));
  }
  return text;
}

export function localizeNotification<T extends { title: string; message: string | null }>(n: T, locale: Locale): T {
  if (locale !== "bn") return n;
  return { ...n, title: apply(n.title, TITLE_RULES), message: n.message ? apply(n.message, MESSAGE_RULES) : n.message };
}

/** Older rows used 'comment' for replies too; infer a better kind from the title. */
export function notificationKind(type: string, title: string): NotificationKind {
  if (type === "comment" && / replied to your comment$/.test(title)) return "reply";
  if (["comment", "reply", "reaction", "ticket", "access", "quote", "contact"].includes(type)) return type as NotificationKind;
  return "system";
}
