// Single source of truth for quote maths. The pricing page, the order
// builder and the server action all use computeQuote(), so the number a
// visitor sees is the number we store.

import { addOns, carePlans, services } from "./site";

export const toTaka = (price: string) => Number(price.replace(/[^0-9]/g, "")) || 0;

export type PlanId = "starter" | "business" | "custom" | "care";

export type Plan = {
  id: PlanId;
  /** Index into site.packages (undefined for the care-only plan). */
  packageIndex?: number;
  base: number;
  includedPages: number;
  /** Add-ons already part of this plan (shown as "Included", never charged). */
  includedAddOns: string[];
  /** Custom work is quoted after discovery; the estimate is a floor. */
  quoteOnly?: boolean;
};

export const PLANS: Plan[] = [
  { id: "starter", packageIndex: 0, base: 15000, includedPages: 5, includedAddOns: [] },
  { id: "business", packageIndex: 1, base: 35000, includedPages: 15, includedAddOns: ["bilingual", "blog", "seo"] },
  { id: "custom", packageIndex: 2, base: 40000, includedPages: 15, includedAddOns: ["bilingual", "blog", "seo", "auth"], quoteOnly: true },
  { id: "care", base: 0, includedPages: 0, includedAddOns: [] },
];

/** Project types offered in the builder (maintenance is covered by the care plan). */
export const ORDER_SERVICES = services.filter((s) => s.slug !== "maintenance").map((s) => ({ slug: s.slug, from: toTaka(s.startingFrom) }));

export const CARE_PRICES = carePlans.map((c, index) => ({ index, price: toTaka(c.price) }));

export const MAX_PAGES = 60;

export type QuoteSelection = {
  plan: PlanId;
  service?: string;
  pages: number;
  addOns: string[];
  /** Index into site.carePlans, or -1 for none. */
  care: number;
};

export type QuoteLine = { key: string; amount: number; qty?: number; included?: boolean };

export type Quote = {
  lines: QuoteLine[];
  low: number;
  high: number;
  monthly: number;
  quoteOnly: boolean;
};

const roundTo = (n: number, step = 500) => Math.round(n / step) * step;

/** Cleans untrusted input into a valid selection. */
export function normaliseSelection(input: Partial<QuoteSelection>): QuoteSelection {
  const plan = PLANS.some((p) => p.id === input.plan) ? (input.plan as PlanId) : "business";
  const service = ORDER_SERVICES.some((s) => s.slug === input.service) ? input.service : undefined;
  const pages = Math.min(MAX_PAGES, Math.max(1, Math.round(Number(input.pages) || 5)));
  const validAddOns = new Set(addOns.filter((a) => a.id !== "page").map((a) => a.id));
  const chosen = Array.from(new Set((input.addOns ?? []).filter((id) => validAddOns.has(id))));
  const care = Number.isInteger(input.care) && (input.care as number) >= 0 && (input.care as number) < carePlans.length ? (input.care as number) : -1;
  if (plan === "care") return { plan, pages: 0, addOns: [], care: care === -1 ? 0 : care };
  return { plan, service, pages, addOns: chosen, care };
}

export function computeQuote(raw: Partial<QuoteSelection>): Quote {
  const sel = normaliseSelection(raw);
  const plan = PLANS.find((p) => p.id === sel.plan)!;
  const lines: QuoteLine[] = [];

  if (plan.id !== "care") {
    // The project type can raise the starting point (e.g. e-commerce), never lower it.
    const serviceFrom = ORDER_SERVICES.find((s) => s.slug === sel.service)?.from ?? 0;
    lines.push({ key: "base", amount: Math.max(plan.base, serviceFrom) });

    const extraPages = Math.max(0, sel.pages - plan.includedPages);
    const pagePrice = addOns.find((a) => a.id === "page")?.price ?? 0;
    if (extraPages > 0) lines.push({ key: "page", amount: extraPages * pagePrice, qty: extraPages });

    for (const id of sel.addOns) {
      const addOn = addOns.find((a) => a.id === id);
      if (!addOn) continue;
      if (plan.includedAddOns.includes(id)) {
        lines.push({ key: id, amount: 0, included: true });
      } else if (id === "copy") {
        lines.push({ key: id, amount: addOn.price * sel.pages, qty: sel.pages });
      } else {
        lines.push({ key: id, amount: addOn.price });
      }
    }
  }

  const total = lines.reduce((sum, l) => sum + l.amount, 0);
  const monthly = sel.care >= 0 ? (CARE_PRICES[sel.care]?.price ?? 0) : 0;
  return {
    lines,
    low: total,
    high: plan.id === "care" ? 0 : roundTo(total * (plan.quoteOnly ? 1.5 : 1.2)),
    monthly,
    quoteOnly: Boolean(plan.quoteOnly),
  };
}

/** Budget ranges offered on the contact form, aligned with the packages above. */
export const BUDGET_RANGES: { value: string; en: string; bn: string }[] = [
  { value: "Under ৳15,000", en: "Under ৳15,000", bn: "৳১৫,০০০-এর কম" },
  { value: "৳15,000 – ৳35,000", en: "৳15,000 – ৳35,000 (Starter)", bn: "৳১৫,০০০ – ৳৩৫,০০০ (স্টার্টার)" },
  { value: "৳35,000 – ৳75,000", en: "৳35,000 – ৳75,000 (Business)", bn: "৳৩৫,০০০ – ৳৭৫,০০০ (বিজনেস)" },
  { value: "৳75,000 – ৳1,50,000", en: "৳75,000 – ৳1,50,000 (Custom)", bn: "৳৭৫,০০০ – ৳১,৫০,০০০ (কাস্টম)" },
  { value: "৳1,50,000+", en: "৳1,50,000+", bn: "৳১,৫০,০০০+" },
  { value: "Monthly care only", en: "Monthly care plan only (from ৳3,000/mo)", bn: "শুধু মাসিক কেয়ার প্ল্যান (৳৩,০০০/মাস থেকে)" },
  { value: "Not sure yet", en: "Not sure yet", bn: "এখনো নিশ্চিত নই" },
];
