"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, ClipboardList, Loader2, Minus, Plus, ShieldCheck, Sparkles } from "lucide-react";

import Link from "@/app/components/locale-link";
import Captcha, { type CaptchaValue } from "@/app/components/captcha";
import { submitQuoteRequest } from "@/app/pricing/actions";
import { useI18n } from "@/lib/i18n/client";
import { MAX_PAGES, PLANS, computeQuote, isStandalonePlan, normaliseSelection, type PlanId, type QuoteSelection } from "@/lib/pricing";

export type BuilderPlan = { id: PlanId; name: string; description: string; price: string; period?: string; highlights: string[] };
export type BuilderService = { slug: string; title: string; short: string; from: number; timeline: string };
export type BuilderAddOn = { id: string; name: string; description: string; price: number; unit?: string; group?: "social"; monthly?: boolean };
export type BuilderCare = { name: string; price: number; features: string[] };
export type BuilderUser = { name: string; email: string; phone: string; organisation: string } | null;

type Step = "configure" | "details" | "review" | "done";
type Details = {
  name: string;
  email: string;
  phone: string;
  organisation: string;
  timeline: string;
  preferredContact: "Email" | "Phone" | "WhatsApp";
  message: string;
};

const inputClass =
  "h-12 w-full rounded-xl border border-neutral-200 bg-white px-3.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10";

function selectionFromParams(params: URLSearchParams | null, fallback: QuoteSelection): QuoteSelection {
  if (!params || !params.get("plan")) return fallback;
  const care = params.get("care");
  return normaliseSelection({
    plan: params.get("plan") as PlanId,
    service: params.get("service") ?? undefined,
    pages: Number(params.get("pages")) || PLANS.find((p) => p.id === params.get("plan"))?.includedPages || 5,
    addOns: (params.get("addons") ?? "").split(",").filter(Boolean),
    care: care === null ? -1 : Number(care),
  });
}

export default function OrderBuilder({
  plans,
  services,
  addOns,
  carePlans,
  user,
  initialCaptcha,
}: {
  plans: BuilderPlan[];
  services: BuilderService[];
  addOns: BuilderAddOn[];
  carePlans: BuilderCare[];
  user: BuilderUser;
  initialCaptcha: { token: string; image: string };
}) {
  const { L, num, tm, tfe } = useI18n();
  const taka = (n: number) => `৳${num(Math.round(n))}`;
  const params = useSearchParams();
  const top = useRef<HTMLDivElement>(null);

  const [selection, setSelection] = useState<QuoteSelection>(() =>
    selectionFromParams(params, { plan: "business", service: "web-development", pages: 8, addOns: [], care: -1 }),
  );
  const [step, setStep] = useState<Step>("configure");
  const [details, setDetails] = useState<Details>({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    organisation: user?.organisation ?? "",
    timeline: "",
    preferredContact: "Email",
    message: "",
  });
  const [agree, setAgree] = useState(false);
  const [captcha, setCaptcha] = useState<CaptchaValue>({ token: initialCaptcha.token, answer: "" });
  const [captchaKey, setCaptchaKey] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [reference, setReference] = useState("");
  const [pending, startTransition] = useTransition();
  const honeypot = useRef<HTMLInputElement>(null);

  // Package cards link to ?plan=…#order — follow those links without a reload.
  const paramKey = params?.toString() ?? "";
  useEffect(() => {
    if (!params?.get("plan")) return;
    setSelection((current) => selectionFromParams(params, current));
    setStep("configure");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramKey]);

  const plan = PLANS.find((p) => p.id === selection.plan)!;
  const planInfo = plans.find((p) => p.id === selection.plan);
  const quote = useMemo(() => computeQuote(selection), [selection]);
  const careOnly = selection.plan === "care";
  const socialOnly = selection.plan === "social";
  const standalone = isStandalonePlan(selection.plan);
  const service = services.find((s) => s.slug === selection.service);
  const isApp = selection.service === "android-app";
  const websiteAddOns = addOns.filter((a) => a.id !== "page" && a.group !== "social");
  const socialAddOns = addOns.filter((a) => a.group === "social");
  const addOnName = (id: string) => addOns.find((a) => a.id === id)?.name ?? id;

  function lineLabel(key: string, qty?: number) {
    if (key === "base") return `${planInfo?.name ?? ""}${service ? ` · ${service.title}` : ""}`;
    if (key === "page")
      return isApp
        ? L(`${qty} extra screen${qty === 1 ? "" : "s"}`, `${num(qty ?? 0)}টি অতিরিক্ত স্ক্রিন`)
        : L(`${qty} extra page${qty === 1 ? "" : "s"}`, `${num(qty ?? 0)}টি অতিরিক্ত পেজ`);
    if (key === "copy") return L(`${addOnName(key)} (${qty} pages)`, `${addOnName(key)} (${num(qty ?? 0)} পেজ)`);
    return addOnName(key);
  }

  function update(patch: Partial<QuoteSelection>) {
    setSelection((s) => normaliseSelection({ ...s, ...patch }));
  }

  function choosePlan(id: PlanId) {
    const p = PLANS.find((x) => x.id === id)!;
    setSelection((s) =>
      normaliseSelection({
        ...s,
        plan: id,
        pages: isStandalonePlan(id) ? 0 : Math.max(s.pages || 1, Math.min(p.includedPages, 8)),
        care: id === "care" && s.care < 0 ? 0 : s.care,
        addOns: id === "social" && !s.addOns.some((a) => addOns.find((x) => x.id === a)?.group === "social") ? ["fb-page"] : s.addOns,
      }),
    );
  }

  function toggleAddOn(id: string) {
    setSelection((s) =>
      normaliseSelection({ ...s, addOns: s.addOns.includes(id) ? s.addOns.filter((x) => x !== id) : [...s.addOns, id] }),
    );
  }

  function renderAddOn(a: BuilderAddOn) {
    const included = plan.includedAddOns.includes(a.id);
    const on = included || selection.addOns.includes(a.id);
    return (
      <label
        key={a.id}
        className={`flex gap-3 rounded-2xl border p-3.5 transition ${
          included ? "cursor-default border-emerald-200 bg-emerald-50/50" : on ? "cursor-pointer border-neutral-950 bg-neutral-50" : "cursor-pointer border-neutral-200 hover:border-neutral-300"
        }`}
      >
        <input type="checkbox" className="sr-only" checked={on} disabled={included} onChange={() => toggleAddOn(a.id)} />
        <span
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
            included ? "border-emerald-600 bg-emerald-600 text-white" : on ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-300"
          }`}
        >
          {on && <Check className="h-3.5 w-3.5" />}
        </span>
        <span className="min-w-0">
          <span className="flex flex-wrap items-baseline justify-between gap-x-2">
            <span className="text-sm font-medium text-neutral-950">{a.name}</span>
            <span className={`text-xs ${included ? "font-semibold text-emerald-700" : "text-neutral-500"}`}>
              {included ? L("Included", "অন্তর্ভুক্ত") : `+${taka(a.price)}${a.unit ? ` ${a.unit}` : ""}`}
            </span>
          </span>
          <span className="mt-0.5 block text-xs leading-5 text-neutral-500">{a.description}</span>
        </span>
      </label>
    );
  }

  function go(next: Step) {
    setStep(next);
    setFormError("");
  }

  // Bring the builder into view after each step change (after the new step has rendered).
  const firstStep = useRef(true);
  useEffect(() => {
    if (firstStep.current) {
      firstStep.current = false;
      return;
    }
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  function validateDetails() {
    const e: Record<string, string> = {};
    if (details.name.trim().length < 2) e.name = L("Please enter your name.", "আপনার নাম লিখুন।");
    if (!/^\S+@\S+\.\S+$/.test(details.email.trim())) e.email = L("Enter a valid email address.", "সঠিক ইমেইল ঠিকানা লিখুন।");
    if (details.phone && !/^[0-9+\-\s()]{6,30}$/.test(details.phone.trim())) e.phone = L("Enter a valid phone number.", "সঠিক ফোন নম্বর লিখুন।");
    if ((details.preferredContact === "Phone" || details.preferredContact === "WhatsApp") && !details.phone.trim())
      e.phone = L("Add a phone number so we can reach you.", "যোগাযোগের জন্য একটি ফোন নম্বর দিন।");
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function submit() {
    if (!agree) {
      setErrors((e) => ({ ...e, agree: L("Please confirm to continue.", "এগোতে নিশ্চিত করুন।") }));
      return;
    }
    setFormError("");
    startTransition(async () => {
      const result = await submitQuoteRequest({
        selection,
        details: { ...details, agree },
        website: honeypot.current?.value ?? "",
        captchaToken: captcha.token,
        captchaAnswer: captcha.answer,
      });
      setCaptchaKey((k) => k + 1); // each security check works once
      if (result.ok) {
        setReference(result.reference);
        go("done");
        return;
      }
      setFormError(tm(result.error) ?? result.error);
      if (result.fieldErrors) {
        const fe = tfe(result.fieldErrors) ?? {};
        setErrors(fe);
        if (["name", "email", "phone", "organisation", "message"].some((k) => k in fe)) go("details");
      }
    });
  }

  const steps: { id: Step; label: string }[] = [
    { id: "configure", label: L("Choose", "বাছাই") },
    { id: "details", label: L("Your details", "আপনার তথ্য") },
    { id: "review", label: L("Confirm", "নিশ্চিত করুন") },
  ];
  const stepIndex = step === "done" ? 3 : steps.findIndex((s) => s.id === step);

  return (
    <div ref={top} className="scroll-mt-24">
      {step !== "done" && (
        <ol className="mb-6 flex items-center gap-2 overflow-x-auto [scrollbar-width:none] sm:gap-3" aria-label={L("Steps", "ধাপ")}>
          {steps.map((s, i) => {
            const done = i < stepIndex;
            const current = i === stepIndex;
            return (
              <li key={s.id} className="flex shrink-0 items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  disabled={!done}
                  onClick={() => done && go(s.id)}
                  aria-current={current ? "step" : undefined}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition sm:text-sm ${
                    current
                      ? "border-neutral-950 bg-neutral-950 text-white"
                      : done
                        ? "border-neutral-300 bg-white text-neutral-800 hover:border-neutral-950"
                        : "border-neutral-200 bg-white text-neutral-400"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${
                      current ? "bg-white text-neutral-950" : done ? "bg-emerald-600 text-white" : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    {done ? <Check className="h-3 w-3" /> : num(i + 1)}
                  </span>
                  {s.label}
                </button>
                {i < steps.length - 1 && <span className="h-px w-4 bg-neutral-300 sm:w-8" aria-hidden />}
              </li>
            );
          })}
        </ol>
      )}

      {step === "done" ? (
        <div className="mx-auto max-w-2xl rounded-3xl border border-emerald-200 bg-white p-6 text-center sm:p-10">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-7 w-7" />
          </span>
          <h3 className="mt-5 text-2xl font-bold text-neutral-950">{L("Request confirmed", "অনুরোধ নিশ্চিত হয়েছে")}</h3>
          <p className="mt-3 text-sm leading-7 text-neutral-600">
            {L(
              "Thank you! We'll review your selection and reply within 24 hours with a written scope and a fixed quote. Nothing is charged until you approve it.",
              "ধন্যবাদ! আপনার বাছাই দেখে ২৪ ঘণ্টার মধ্যে লিখিত পরিসর ও নির্দিষ্ট কোটেশনসহ উত্তর দেব। আপনি অনুমোদন না দেওয়া পর্যন্ত কোনো টাকা নেওয়া হবে না।",
            )}
          </p>
          <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-2 text-sm">
            {L("Reference", "রেফারেন্স")}: <span className="font-mono font-semibold text-neutral-950">{reference}</span>
          </p>
          <p className="mt-3 text-xs text-neutral-500">
            {L(`A confirmation has been sent to ${details.email}.`, `${details.email} ঠিকানায় একটি নিশ্চিতকরণ ইমেইল পাঠানো হয়েছে।`)}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/projects" className="inline-flex h-11 items-center justify-center rounded-full bg-neutral-950 px-6 text-sm font-semibold text-white hover:bg-neutral-800">
              {L("See our work", "আমাদের কাজ দেখুন")}
            </Link>
            <button
              type="button"
              onClick={() => {
                setReference("");
                setAgree(false);
                go("configure");
              }}
              className="inline-flex h-11 items-center justify-center rounded-full border border-neutral-200 px-6 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
            >
              {L("Start another request", "আরেকটি অনুরোধ করুন")}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="min-w-0 rounded-3xl border border-neutral-200 bg-white p-5 sm:p-7">
            {step === "configure" && (
              <div className="flex flex-col gap-8">
                <fieldset>
                  <legend className="text-sm font-semibold text-neutral-950">{L("1. Choose a plan", "১. প্ল্যান বেছে নিন")}</legend>
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {plans.map((p) => {
                      const on = p.id === selection.plan;
                      return (
                        <label
                          key={p.id}
                          className={`flex cursor-pointer flex-col gap-1 rounded-2xl border p-4 transition ${
                            on ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-200 hover:border-neutral-300"
                          }`}
                        >
                          <input type="radio" name="plan" className="sr-only" checked={on} onChange={() => choosePlan(p.id)} />
                          <span className="flex items-baseline justify-between gap-3">
                            <span className="font-semibold">{p.name}</span>
                            <span className={`text-xs ${on ? "text-neutral-300" : "text-neutral-500"}`}>
                              {p.price}
                              {p.period}
                            </span>
                          </span>
                          <span className={`text-xs leading-5 ${on ? "text-neutral-300" : "text-neutral-500"}`}>{p.description}</span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                {socialOnly && (
                  <fieldset>
                    <legend className="text-sm font-semibold text-neutral-950">{L("2. Choose services", "২. সেবা বেছে নিন")}</legend>
                    <p className="mt-1 text-xs leading-5 text-neutral-500">
                      {L(
                        "Pick one or more. Ad spend is paid to Meta from your own account and is not part of our fee.",
                        "এক বা একাধিক বেছে নিন। বিজ্ঞাপনের খরচ আপনার নিজের অ্যাকাউন্ট থেকে মেটাকে দিতে হয়, তা আমাদের ফি-র অংশ নয়।",
                      )}
                    </p>
                    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">{socialAddOns.map(renderAddOn)}</div>
                  </fieldset>
                )}

                {!standalone && (
                  <>
                    <fieldset>
                      <legend className="text-sm font-semibold text-neutral-950">{L("2. What are we building?", "২. কী বানাতে চান?")}</legend>
                      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {services.map((s) => {
                          const on = s.slug === selection.service;
                          return (
                            <label
                              key={s.slug}
                              className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 transition ${
                                on ? "border-neutral-950 bg-neutral-50" : "border-neutral-200 hover:border-neutral-300"
                              }`}
                            >
                              <input type="radio" name="service" className="sr-only" checked={on} onChange={() => update({ service: s.slug })} />
                              <span
                                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                                  on ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-300"
                                }`}
                              >
                                {on && <Check className="h-3 w-3" />}
                              </span>
                              <span className="min-w-0">
                                <span className="flex flex-wrap items-baseline justify-between gap-x-2">
                                  <span className="text-sm font-medium text-neutral-950">{s.title}</span>
                                  <span className="text-xs text-neutral-500">
                                    {L("from", "শুরু")} {taka(s.from)}
                                  </span>
                                </span>
                                <span className="mt-0.5 block text-xs leading-5 text-neutral-500">{s.short}</span>
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </fieldset>

                    <div>
                      <p className="text-sm font-semibold text-neutral-950">
                        {isApp ? L("3. How many screens?", "৩. কয়টি স্ক্রিন?") : L("3. How many pages?", "৩. কয়টি পেজ?")}
                      </p>
                      <div className="mt-3 flex items-center gap-4">
                        <button
                          type="button"
                          aria-label={L("Fewer pages", "পেজ কমান")}
                          onClick={() => update({ pages: selection.pages - 1 })}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 hover:bg-neutral-50"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <input
                          type="range"
                          min={1}
                          max={MAX_PAGES}
                          value={selection.pages}
                          onChange={(e) => update({ pages: Number(e.target.value) })}
                          aria-label={L("Number of pages", "পেজের সংখ্যা")}
                          className="h-2 min-w-0 flex-1 cursor-pointer accent-neutral-950"
                        />
                        <button
                          type="button"
                          aria-label={L("More pages", "পেজ বাড়ান")}
                          onClick={() => update({ pages: selection.pages + 1 })}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 hover:bg-neutral-50"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <span className="w-10 shrink-0 text-right text-lg font-bold text-neutral-950">{num(selection.pages)}</span>
                      </div>
                      <p className="mt-2 text-xs text-neutral-500">
                        {isApp
                          ? L(
                              `${plan.includedPages} screens included in ${planInfo?.name} · extra screens ${taka(addOns.find((a) => a.id === "page")?.price ?? 0)} each`,
                              `${planInfo?.name}-এ ${num(plan.includedPages)}টি স্ক্রিন অন্তর্ভুক্ত · অতিরিক্ত প্রতি স্ক্রিন ${taka(addOns.find((a) => a.id === "page")?.price ?? 0)}`,
                            )
                          : L(
                              `${plan.includedPages} pages included in ${planInfo?.name} · extra pages ${taka(addOns.find((a) => a.id === "page")?.price ?? 0)} each`,
                              `${planInfo?.name}-এ ${num(plan.includedPages)}টি পেজ অন্তর্ভুক্ত · অতিরিক্ত প্রতি পেজ ${taka(addOns.find((a) => a.id === "page")?.price ?? 0)}`,
                            )}
                      </p>
                    </div>

                    <fieldset>
                      <legend className="text-sm font-semibold text-neutral-950">{L("4. Add-ons", "৪. অ্যাড-অন")}</legend>
                      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">{websiteAddOns.map(renderAddOn)}</div>
                    </fieldset>

                    <fieldset>
                      <legend className="text-sm font-semibold text-neutral-950">
                        {L("5. Facebook & social media (optional)", "৫. ফেসবুক ও সোশ্যাল মিডিয়া (ঐচ্ছিক)")}
                      </legend>
                      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">{socialAddOns.map(renderAddOn)}</div>
                    </fieldset>
                  </>
                )}

                {!socialOnly && (
                <fieldset>
                  <legend className="text-sm font-semibold text-neutral-950">
                    {careOnly ? L("2. Choose a care plan", "২. কেয়ার প্ল্যান বেছে নিন") : L("6. Care after launch (optional)", "৬. লঞ্চের পর দেখভাল (ঐচ্ছিক)")}
                  </legend>
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {[...(careOnly ? [] : [{ name: L("No care plan", "কেয়ার প্ল্যান ছাড়া"), price: 0, features: [] as string[] }]), ...carePlans].map((c, i) => {
                      const index = careOnly ? i : i - 1;
                      const on = selection.care === index;
                      return (
                        <label
                          key={c.name}
                          className={`cursor-pointer rounded-2xl border p-3.5 text-sm transition ${
                            on ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-200 hover:border-neutral-300"
                          }`}
                        >
                          <input type="radio" name="care" className="sr-only" checked={on} onChange={() => update({ care: index })} />
                          <span className="block font-medium">{c.name}</span>
                          {c.price > 0 && (
                            <span className={`mt-0.5 block text-xs ${on ? "text-neutral-300" : "text-neutral-500"}`}>
                              {taka(c.price)}
                              {L("/month", "/মাস")}
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
                )}

                <div className="flex justify-end border-t border-neutral-100 pt-6">
                  <button
                    type="button"
                    onClick={() => go("details")}
                    disabled={socialOnly ? selection.addOns.length === 0 : !careOnly && !selection.service}
                    className="inline-flex h-12 items-center gap-2 rounded-full bg-neutral-950 px-6 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-40"
                  >
                    {L("Next", "পরবর্তী")} <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {step === "details" && (
              <form
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  if (validateDetails()) go("review");
                }}
                className="flex flex-col gap-5"
              >
                <div>
                  <h3 className="text-lg font-semibold text-neutral-950">{L("Your details", "আপনার তথ্য")}</h3>
                  <p className="mt-1 text-sm text-neutral-500">{L("So we can send your written quote.", "যাতে লিখিত কোটেশন পাঠাতে পারি।")}</p>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="q-name" label={L("Full name", "পুরো নাম")} required error={errors.name}>
                    <input id="q-name" autoComplete="name" className={inputClass} value={details.name} onChange={(e) => setDetails({ ...details, name: e.target.value })} />
                  </Field>
                  <Field id="q-email" label={L("Email", "ইমেইল")} required error={errors.email}>
                    <input id="q-email" type="email" autoComplete="email" className={inputClass} value={details.email} onChange={(e) => setDetails({ ...details, email: e.target.value })} />
                  </Field>
                  <Field id="q-phone" label={L("Phone / WhatsApp", "ফোন / হোয়াটসঅ্যাপ")} error={errors.phone}>
                    <input id="q-phone" type="tel" inputMode="tel" autoComplete="tel" className={inputClass} value={details.phone} onChange={(e) => setDetails({ ...details, phone: e.target.value })} />
                  </Field>
                  <Field id="q-org" label={L("Organisation (optional)", "প্রতিষ্ঠান (ঐচ্ছিক)")} error={errors.organisation}>
                    <input id="q-org" autoComplete="organization" className={inputClass} value={details.organisation} onChange={(e) => setDetails({ ...details, organisation: e.target.value })} />
                  </Field>
                  <Field id="q-timeline" label={L("When do you want to start?", "কবে শুরু করতে চান?")}>
                    <select id="q-timeline" className={inputClass} value={details.timeline} onChange={(e) => setDetails({ ...details, timeline: e.target.value })}>
                      <option value="">{L("Select…", "বেছে নিন…")}</option>
                      <option value="asap">{L("As soon as possible", "যত দ্রুত সম্ভব")}</option>
                      <option value="1-month">{L("Within a month", "এক মাসের মধ্যে")}</option>
                      <option value="1-3-months">{L("In 1–3 months", "১–৩ মাসের মধ্যে")}</option>
                      <option value="flexible">{L("Flexible", "সময় নিয়ে চিন্তা নেই")}</option>
                    </select>
                  </Field>
                  <Field id="q-contact" label={L("Best way to reach you", "যোগাযোগের সুবিধাজনক মাধ্যম")}>
                    <select
                      id="q-contact"
                      className={inputClass}
                      value={details.preferredContact}
                      onChange={(e) => setDetails({ ...details, preferredContact: e.target.value as Details["preferredContact"] })}
                    >
                      <option value="Email">{L("Email", "ইমেইল")}</option>
                      <option value="Phone">{L("Phone call", "ফোন কল")}</option>
                      <option value="WhatsApp">WhatsApp</option>
                    </select>
                  </Field>
                </div>
                <Field id="q-message" label={L("Anything we should know? (optional)", "আর কিছু জানাতে চান? (ঐচ্ছিক)")} error={errors.message}>
                  <textarea
                    id="q-message"
                    rows={4}
                    maxLength={2000}
                    className={`${inputClass} h-auto py-3 leading-6`}
                    placeholder={L("Your current website, goals, examples you like…", "বর্তমান ওয়েবসাইট, লক্ষ্য, পছন্দের উদাহরণ…")}
                    value={details.message}
                    onChange={(e) => setDetails({ ...details, message: e.target.value })}
                  />
                </Field>
                <div className="flex items-center justify-between gap-3 border-t border-neutral-100 pt-6">
                  <button type="button" onClick={() => go("configure")} className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-neutral-700 hover:bg-neutral-100">
                    <ArrowLeft className="h-4 w-4" /> {L("Back", "পেছনে")}
                  </button>
                  <button type="submit" className="inline-flex h-12 items-center gap-2 rounded-full bg-neutral-950 px-6 text-sm font-semibold text-white hover:bg-neutral-800">
                    {L("Next", "পরবর্তী")} <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </form>
            )}

            {step === "review" && (
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-950">{L("Review and confirm", "দেখে নিশ্চিত করুন")}</h3>
                  <p className="mt-1 text-sm text-neutral-500">
                    {L("Check everything below. You can go back to change anything.", "নিচের সবকিছু দেখে নিন। কিছু বদলাতে চাইলে পেছনে যেতে পারেন।")}
                  </p>
                </div>
                <dl className="grid grid-cols-1 gap-x-6 gap-y-4 rounded-2xl bg-neutral-50 p-5 text-sm sm:grid-cols-2">
                  <Review label={L("Plan", "প্ল্যান")} value={planInfo?.name} onEdit={() => go("configure")} editLabel={L("Edit", "বদলান")} />
                  {!standalone && <Review label={L("Project type", "প্রজেক্টের ধরন")} value={service?.title} />}
                  {!standalone && <Review label={isApp ? L("Screens", "স্ক্রিন") : L("Pages", "পেজ")} value={num(selection.pages)} />}
                  {!careOnly && (
                    <Review
                      label={socialOnly ? L("Services", "সেবা") : L("Add-ons", "অ্যাড-অন")}
                      value={[...plan.includedAddOns, ...selection.addOns.filter((a) => !plan.includedAddOns.includes(a))].map(addOnName).join(", ") || L("None", "নেই")}
                    />
                  )}
                  {!socialOnly && (
                    <Review label={L("Care plan", "কেয়ার প্ল্যান")} value={selection.care >= 0 ? carePlans[selection.care]?.name : L("None", "নেই")} />
                  )}
                  <Review label={L("Name", "নাম")} value={details.name} onEdit={() => go("details")} editLabel={L("Edit", "বদলান")} />
                  <Review label={L("Email", "ইমেইল")} value={details.email} />
                  {details.phone && <Review label={L("Phone", "ফোন")} value={details.phone} />}
                </dl>

                <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                  <label htmlFor="q-website">Website</label>
                  <input id="q-website" ref={honeypot} tabIndex={-1} autoComplete="off" />
                </div>

                <Captcha initial={initialCaptcha} refreshKey={captchaKey} onChange={setCaptcha} />

                <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-neutral-700">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => {
                      setAgree(e.target.checked);
                      setErrors((x) => ({ ...x, agree: "" }));
                    }}
                    className="mt-1 h-4 w-4 shrink-0 accent-neutral-950"
                  />
                  <span>
                    {L(
                      "I understand this is an estimate. Nirdeshona will send a written scope and fixed quote, and nothing is charged until I approve it.",
                      "আমি বুঝেছি এটি আনুমানিক হিসাব। নির্দেশনা লিখিত পরিসর ও নির্দিষ্ট কোটেশন পাঠাবে, আর আমি অনুমোদন না দেওয়া পর্যন্ত কোনো টাকা নেওয়া হবে না।",
                    )}{" "}
                    <Link href="/terms" className="font-medium underline">
                      {L("Terms", "শর্তাবলি")}
                    </Link>
                  </span>
                </label>
                {errors.agree && <p className="-mt-3 text-xs text-red-600">{errors.agree}</p>}
                {formError && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</p>}

                <div className="flex items-center justify-between gap-3 border-t border-neutral-100 pt-6">
                  <button type="button" onClick={() => go("details")} className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-neutral-700 hover:bg-neutral-100">
                    <ArrowLeft className="h-4 w-4" /> {L("Back", "পেছনে")}
                  </button>
                  <button
                    type="button"
                    onClick={submit}
                    disabled={pending}
                    className="inline-flex h-12 items-center gap-2 rounded-full bg-neutral-950 px-6 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-60"
                  >
                    {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                    {pending ? L("Confirming…", "নিশ্চিত হচ্ছে…") : L("Confirm request", "অনুরোধ নিশ্চিত করুন")}
                  </button>
                </div>
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl bg-neutral-950 p-6 text-white sm:p-7">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
                <ClipboardList className="h-4 w-4" /> {L("Your selection", "আপনার বাছাই")}
              </p>
              {careOnly ? (
                <p className="mt-4 text-3xl font-bold sm:text-4xl" aria-live="polite">
                  {taka(quote.monthly)}
                  <span className="text-base font-medium text-neutral-400">{L("/month", "/মাস")}</span>
                </p>
              ) : (
                <>
                  {socialOnly && quote.low === 0 ? (
                    <p className="mt-4 text-3xl font-bold sm:text-4xl" aria-live="polite">
                      {taka(quote.monthly)}
                      <span className="text-base font-medium text-neutral-400">{L("/month", "/মাস")}</span>
                    </p>
                  ) : (
                    <>
                      <p className="mt-4 text-3xl font-bold sm:text-4xl" aria-live="polite">
                        {quote.quoteOnly && <span className="mr-1 text-base font-medium text-neutral-400">{L("from", "শুরু")}</span>}
                        {taka(quote.low)}
                        {quote.high > quote.low && (
                          <>
                            {" "}
                            <span className="text-neutral-500">–</span> {taka(quote.high)}
                          </>
                        )}
                      </p>
                      <p className="mt-1 text-xs text-neutral-400">
                        {socialOnly ? L("One-time setup fee", "এককালীন সেটআপ ফি") : L("One-time project fee", "এককালীন প্রজেক্ট ফি")}
                        {service && !socialOnly ? ` · ${service.timeline}` : ""}
                      </p>
                      {quote.monthly > 0 && (
                        <p className="mt-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs">
                          {L(`+ ${taka(quote.monthly)}/month`, `+ মাসে ${taka(quote.monthly)}`)}
                        </p>
                      )}
                    </>
                  )}
                  <ul className="mt-6 flex flex-col gap-2 border-t border-white/10 pt-5 text-sm">
                    {quote.lines.map((l) => (
                      <li key={l.key} className="flex justify-between gap-4">
                        <span className="text-neutral-300">{lineLabel(l.key, l.qty)}</span>
                        <span className="shrink-0 font-medium">
                          {l.included ? L("Included", "অন্তর্ভুক্ত") : l.monthly ? `${taka(l.monthly)}${L("/mo", "/মাস")}` : taka(l.amount)}
                        </span>
                      </li>
                    ))}
                    {quote.care > 0 && (
                      <li className="flex justify-between gap-4">
                        <span className="text-neutral-300">{carePlans[selection.care]?.name}</span>
                        <span className="shrink-0 font-medium">
                          {taka(quote.care)}
                          {L("/mo", "/মাস")}
                        </span>
                      </li>
                    )}
                  </ul>
                </>
              )}
              {planInfo && planInfo.highlights.length > 0 && (
                <ul className="mt-5 flex flex-col gap-1.5 border-t border-white/10 pt-5 text-xs text-neutral-300">
                  {planInfo.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2">
                      <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" /> {h}
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-5 text-[11px] leading-5 text-neutral-500">
                {L(
                  "An estimate, not an invoice. Your final price is fixed in a written scope before any work or payment.",
                  "এটি আনুমানিক হিসাব, বিল নয়। কাজ বা পেমেন্টের আগে লিখিত পরিসরে চূড়ান্ত মূল্য ঠিক করা হয়।",
                )}
              </p>
            </div>
            <p className="mt-4 text-center text-xs text-neutral-500">
              {L("Prefer to talk first?", "আগে কথা বলতে চান?")}{" "}
              <Link href="/contact" className="font-semibold text-neutral-900 underline">
                {L("Send us a message", "আমাদের বার্তা পাঠান")}
              </Link>
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}

function Field({ id, label, required, error, children }: { id: string; label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-neutral-800">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function Review({ label, value, onEdit, editLabel }: { label: string; value?: string; onEdit?: () => void; editLabel?: string }) {
  return (
    <div className="min-w-0">
      <dt className="flex items-center gap-2 text-xs text-neutral-500">
        {label}
        {onEdit && (
          <button type="button" onClick={onEdit} className="text-xs font-semibold text-neutral-900 underline">
            {editLabel}
          </button>
        )}
      </dt>
      <dd className="mt-0.5 break-words font-medium text-neutral-950">{value || "—"}</dd>
    </div>
  );
}
