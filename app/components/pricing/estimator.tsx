"use client";

import Link from "@/app/components/locale-link";
import { useMemo, useState } from "react";
import { ArrowRight, Calculator, Check, Minus, Plus } from "lucide-react";

type EstimatorService = { slug: string; title: string; englishTitle: string; base: number; timeline: string };
type EstimatorAddOn = { id: string; name: string; description: string; price: number; unit?: string };
type EstimatorCare = { name: string; price: number };

import { useI18n } from "@/lib/i18n/client";
const INCLUDED_PAGES = 5;

export default function PriceEstimator({
  services,
  addOns,
  carePlans,
}: {
  services: EstimatorService[];
  addOns: EstimatorAddOn[];
  carePlans: EstimatorCare[];
}) {
  const { L, num } = useI18n();
  const taka = (n: number) => `৳${num(Math.round(n))}`;
  const [serviceSlug, setServiceSlug] = useState(services[0]?.slug ?? "");
  const [pages, setPages] = useState(INCLUDED_PAGES);
  const [selected, setSelected] = useState<string[]>([]);
  const [care, setCare] = useState<string>("");

  const service = services.find((s) => s.slug === serviceSlug) ?? services[0];
  const perPage = addOns.find((a) => a.id === "page")?.price ?? 0;
  const copy = addOns.find((a) => a.id === "copy");
  const toggles = addOns.filter((a) => a.id !== "page");

  const { low, high, lines } = useMemo(() => {
    const items: { label: string; amount: number }[] = [{ label: `${service.title} ${L("(base)", "(মূল)")}`, amount: service.base }];
    const extraPages = Math.max(0, pages - INCLUDED_PAGES);
    if (extraPages > 0) items.push({ label: L(`${extraPages} extra page${extraPages > 1 ? "s" : ""}`, `${num(extraPages)}টি অতিরিক্ত পেজ`), amount: extraPages * perPage });
    for (const id of selected) {
      const addOn = addOns.find((a) => a.id === id);
      if (!addOn) continue;
      const amount = addOn.id === "copy" ? addOn.price * pages : addOn.price;
      items.push({ label: addOn.id === "copy" ? L(`${addOn.name} (${pages} pages)`, `${addOn.name} (${num(pages)} পেজ)`) : addOn.name, amount });
    }
    const total = items.reduce((sum, i) => sum + i.amount, 0);
    return { low: total, high: Math.round((total * 1.25) / 500) * 500, lines: items };
  }, [service, pages, selected, addOns, perPage, L, num]);

  const carePlan = carePlans.find((c) => c.name === care);

  const message = [
    L(`Estimate from the pricing page:`, `প্রাইসিং পেজের হিসাব:`),
    `- ${L("Service", "সার্ভিস")}: ${service.title}`,
    `- ${L("Pages", "পেজ")}: ${num(pages)}`,
    selected.length ? `- ${L("Add-ons", "অ্যাড-অন")}: ${selected.map((id) => addOns.find((a) => a.id === id)?.name).join(", ")}` : null,
    carePlan ? `- ${L("Care plan", "কেয়ার প্ল্যান")}: ${carePlan.name}` : null,
    `- ${L("Estimated", "আনুমানিক")}: ${taka(low)} – ${taka(high)}`,
    ``,
    L(`About my project: `, `আমার প্রজেক্ট সম্পর্কে: `),
  ]
    .filter((l) => l !== null)
    .join("\n");

  const contactHref = `/contact?service=${encodeURIComponent(service.englishTitle)}&message=${encodeURIComponent(message)}`;

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="flex min-w-0 flex-col gap-6 rounded-3xl border border-neutral-200 bg-white p-5 sm:p-7">
        <fieldset>
          <legend className="text-sm font-semibold text-neutral-950">{L("1. What do you need?", "১. আপনার কী দরকার?")}</legend>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {services.map((s) => (
              <label
                key={s.slug}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                  s.slug === serviceSlug ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-200 hover:border-neutral-300"
                }`}
              >
                <input type="radio" name="est-service" value={s.slug} checked={s.slug === serviceSlug} onChange={() => setServiceSlug(s.slug)} className="sr-only" />
                <span className="font-medium">{s.title}</span>
                <span className={`text-xs ${s.slug === serviceSlug ? "text-neutral-300" : "text-neutral-500"}`}>{L("from", "শুরু")} {taka(s.base)}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <p className="text-sm font-semibold text-neutral-950">{L("2. How many pages?", "২. কয়টি পেজ?")}</p>
          <div className="mt-3 flex items-center gap-4">
            <button
              type="button"
              aria-label={L("Fewer pages", "পেজ কমান")}
              onClick={() => setPages((p) => Math.max(1, p - 1))}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 hover:bg-neutral-50"
            >
              <Minus className="h-4 w-4" />
            </button>
            <input
              type="range"
              min={1}
              max={40}
              value={pages}
              onChange={(e) => setPages(Number(e.target.value))}
              aria-label={L("Number of pages", "পেজের সংখ্যা")}
              className="h-2 min-w-0 flex-1 cursor-pointer accent-neutral-950"
            />
            <button
              type="button"
              aria-label={L("More pages", "পেজ বাড়ান")}
              onClick={() => setPages((p) => Math.min(40, p + 1))}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 hover:bg-neutral-50"
            >
              <Plus className="h-4 w-4" />
            </button>
            <span className="w-10 shrink-0 text-right text-lg font-bold text-neutral-950">{num(pages)}</span>
          </div>
          <p className="mt-2 text-xs text-neutral-500">
            {L(`${INCLUDED_PAGES} pages included · extra pages ${taka(perPage)} each`, `${num(INCLUDED_PAGES)}টি পেজ অন্তর্ভুক্ত · অতিরিক্ত প্রতি পেজ ${taka(perPage)}`)}
          </p>
        </div>

        <fieldset>
          <legend className="text-sm font-semibold text-neutral-950">{L("3. Add-ons", "৩. অ্যাড-অন")}</legend>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {toggles.map((a) => {
              const on = selected.includes(a.id);
              return (
                <label
                  key={a.id}
                  className={`flex cursor-pointer gap-3 rounded-2xl border p-3.5 transition ${on ? "border-neutral-950 bg-neutral-50" : "border-neutral-200 hover:border-neutral-300"}`}
                >
                  <input type="checkbox" checked={on} onChange={() => toggle(a.id)} className="sr-only" />
                  <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${on ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-300"}`}>
                    {on && <Check className="h-3.5 w-3.5" />}
                  </span>
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-baseline justify-between gap-x-2">
                      <span className="text-sm font-medium text-neutral-950">{a.name}</span>
                      <span className="text-xs text-neutral-500">
                        +{taka(a.price)}
                        {a.unit ? ` ${a.unit}` : ""}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-xs leading-5 text-neutral-500">{a.description}</span>
                  </span>
                </label>
              );
            })}
          </div>
          {copy && selected.includes("copy") && <p className="mt-2 text-xs text-neutral-500">{L(`Copywriting is calculated for all ${pages} pages.`, `কপিরাইটিং সব ${num(pages)}টি পেজের জন্য ধরা হয়েছে।`)}</p>}
        </fieldset>

        <fieldset>
          <legend className="text-sm font-semibold text-neutral-950">{L("4. Care after launch (optional)", "৪. লঞ্চের পর দেখভাল (ঐচ্ছিক)")}</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {[{ name: "", price: 0 }, ...carePlans].map((c) => (
              <label
                key={c.name || "none"}
                className={`cursor-pointer rounded-full border px-4 py-2 text-sm transition ${care === c.name ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-200 hover:border-neutral-300"}`}
              >
                <input type="radio" name="est-care" checked={care === c.name} onChange={() => setCare(c.name)} className="sr-only" />
                {c.name ? `${c.name} · ${taka(c.price)}${L("/mo", "/মাস")}` : L("No care plan", "কেয়ার প্ল্যান ছাড়া")}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-3xl bg-neutral-950 p-6 text-white sm:p-7">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
            <Calculator className="h-4 w-4" /> {L("Your estimate", "আপনার আনুমানিক খরচ")}
          </p>
          <p className="mt-4 text-3xl font-bold tracking-[-0.04em] sm:text-4xl" aria-live="polite">
            {taka(low)} <span className="text-neutral-500">–</span> {taka(high)}
          </p>
          <p className="mt-1 text-xs text-neutral-400">{L("One-time project fee", "এককালীন প্রজেক্ট ফি")} · {service.timeline}</p>
          {carePlan && (
            <p className="mt-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs">
              {L(`+ ${taka(carePlan.price)}/month for ${carePlan.name}`, `+ ${carePlan.name}-এর জন্য মাসে ${taka(carePlan.price)}`)}
            </p>
          )}
          <ul className="mt-6 flex flex-col gap-2 border-t border-white/10 pt-5 text-sm">
            {lines.map((l) => (
              <li key={l.label} className="flex justify-between gap-4">
                <span className="text-neutral-300">{l.label}</span>
                <span className="shrink-0 font-medium">{taka(l.amount)}</span>
              </li>
            ))}
          </ul>
          <Link
            href={contactHref}
            className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-white text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200"
          >
            {L("Get an exact quote", "নির্দিষ্ট কোটেশন নিন")} <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-3 text-center text-[11px] leading-5 text-neutral-500">
            {L("A rough guide, not a quote. Your final price is fixed in a written scope before work starts.", "এটি আনুমানিক ধারণা, কোটেশন নয়। কাজ শুরুর আগে লিখিত পরিসরে চূড়ান্ত মূল্য ঠিক করা হয়।")}
          </p>
        </div>
      </div>
    </div>
  );
}
