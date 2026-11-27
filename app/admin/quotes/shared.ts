import { addOns, carePlans, services } from "@/lib/site";

export const QUOTE_STATUSES = [
  { value: "new", label: "New", className: "bg-blue-50 text-blue-700" },
  { value: "contacted", label: "Contacted", className: "bg-amber-50 text-amber-700" },
  { value: "quoted", label: "Quote sent", className: "bg-violet-50 text-violet-700" },
  { value: "accepted", label: "Accepted", className: "bg-emerald-50 text-emerald-700" },
  { value: "declined", label: "Declined", className: "bg-neutral-100 text-neutral-600" },
] as const;

export const PLAN_NAMES: Record<string, string> = {
  starter: "Starter",
  business: "Business",
  custom: "Custom",
  care: "Care plan only",
  social: "Facebook & social media",
};
export const TIMELINES: Record<string, string> = {
  asap: "As soon as possible",
  "1-month": "Within a month",
  "1-3-months": "In 1–3 months",
  flexible: "Flexible",
};

export const serviceName = (slug: string | null) => services.find((s) => s.slug === slug)?.title ?? "—";
export const addOnName = (id: string) => addOns.find((a) => a.id === id)?.name ?? id;
export const careName = (index: number | null) => (index === null ? "None" : (carePlans[index]?.name ?? "—"));
export const taka = (n: number) => `৳${Number(n).toLocaleString("en-IN")}`;
