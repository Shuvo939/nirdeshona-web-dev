"use server";

import crypto from "node:crypto";
import { headers } from "next/headers";
import { z } from "zod";

import { getSessionUser } from "@/lib/auth/session";
import { verifyCaptcha } from "@/lib/captcha";
import { sql } from "@/lib/db";
import { notifyAdmins } from "@/lib/notifications";
import { sendEmail } from "@/lib/email";
import { getLocale, msg } from "@/lib/i18n/server";
import { computeQuote, normaliseSelection, type PlanId } from "@/lib/pricing";
import { addOns, carePlans, services, site } from "@/lib/site";

export type QuoteResult =
  | { ok: true; reference: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string>; captcha?: boolean };

const Details = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100, "Name is too long"),
  email: z.string().trim().email("Enter a valid email address").max(255),
  phone: z
    .string()
    .trim()
    .max(30, "Phone number is too long")
    .regex(/^[0-9+\-\s()]*$/, "Use digits, spaces and + only")
    .optional(),
  organisation: z.string().trim().max(150, "Organisation name is too long").optional(),
  timeline: z.enum(["asap", "1-month", "1-3-months", "flexible"]).optional(),
  preferredContact: z.enum(["Email", "Phone", "WhatsApp"]).default("Email"),
  message: z.string().trim().max(2000, "Message is too long").optional(),
  agree: z.literal(true, { message: "Please confirm to continue" }),
});

const Input = z.object({
  selection: z.object({
    plan: z.enum(["starter", "business", "custom", "care", "social"]),
    service: z.string().max(50).optional(),
    pages: z.number().int().min(0).max(200),
    addOns: z.array(z.string().max(40)).max(20),
    care: z.number().int().min(-1).max(10),
  }),
  details: z.record(z.string(), z.unknown()),
  website: z.string().max(200).optional(),
  captchaToken: z.string().optional(),
  captchaAnswer: z.string().optional(),
});

const PLAN_LABEL: Record<PlanId, string> = {
  starter: "Starter",
  business: "Business",
  custom: "Custom",
  care: "Care plan only",
  social: "Facebook & social media",
};

/** Postgres "relation does not exist" — the quote table has not been migrated yet. */
const missingTable = (error: unknown) => (error as { code?: string })?.code === "42P01";
const TIMELINE_LABEL: Record<string, string> = {
  asap: "As soon as possible",
  "1-month": "Within a month",
  "1-3-months": "In 1–3 months",
  flexible: "Flexible",
};

const taka = (n: number) => `৳${n.toLocaleString("en-IN")}`;

async function ipHash() {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const salt = process.env.AUTH_SECRET || process.env.SUPABASE_SECRET_KEY || "nirdeshona-web";
  return crypto.createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

function makeReference() {
  const year = new Date().getFullYear();
  return `NW-${year}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

export async function submitQuoteRequest(raw: unknown): Promise<QuoteResult> {
  const parsed = Input.safeParse(raw);
  if (!parsed.success) return { ok: false, error: await msg("Invalid request.", "অনুরোধটি সঠিক নয়।") };

  // Optional fields left empty arrive as "" — treat them as absent.
  const cleaned = Object.fromEntries(Object.entries(parsed.data.details).filter(([, v]) => v !== "" && v !== null));
  const details = Details.safeParse(cleaned);
  if (!details.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of details.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return { ok: false, error: await msg("Please check the highlighted fields.", "চিহ্নিত ঘরগুলো দেখে নিন।"), fieldErrors };
  }

  // Bots fill the hidden field — pretend success and store nothing.
  if (parsed.data.website) return { ok: true, reference: makeReference() };

  const captcha = await verifyCaptcha(parsed.data.captchaToken, parsed.data.captchaAnswer);
  if (!captcha.ok) return { ok: false, error: captcha.error, captcha: true };

  const d = details.data;
  const selection = normaliseSelection(parsed.data.selection as never);
  // Never trust the estimate from the browser; recompute it here.
  const quote = computeQuote(selection);
  const hash = await ipHash();
  const user = await getSessionUser().catch(() => null);
  const locale = await getLocale();

  if (selection.plan === "social" && selection.addOns.length === 0) {
    return {
      ok: false,
      error: await msg("Choose at least one social media service.", "অন্তত একটি সোশ্যাল মিডিয়া সেবা বেছে নিন।"),
    };
  }

  try {
    const [{ by_email, by_ip }] = await sql`
      select
        count(*) filter (where lower(email) = lower(${d.email}))::int as by_email,
        count(*) filter (where ip_hash = ${hash})::int as by_ip
      from public.quote_requests
      where created_at > now() - interval '24 hours'
    `.catch((error) => {
      if (missingTable(error)) return [{ by_email: 0, by_ip: 0 }];
      throw error;
    });
    if (by_email >= 3 || by_ip >= 6) {
      return {
        ok: false,
        error: await msg(
          "You've sent several requests today. We'll be in touch soon — or email us directly.",
          "আজ আপনি কয়েকটি অনুরোধ পাঠিয়েছেন। আমরা শিগগিরই যোগাযোগ করব — চাইলে সরাসরি ইমেইলও করতে পারেন।",
        ),
      };
    }

    // Emails and the fallback record are always in English (house rule).
    const serviceTitle = services.find((s) => s.slug === selection.service)?.title;
    const monthlyAddOns = selection.addOns
      .map((id) => addOns.find((a) => a.id === id))
      .filter((a) => a?.monthly)
      .map((a) => `${a!.name} (${taka(a!.price)}/month)`);
    const oneTimeAddOns = selection.addOns
      .map((id) => addOns.find((a) => a.id === id))
      .filter((a) => a && !a.monthly)
      .map((a) => a!.name);
    const standalone = selection.plan === "care" || selection.plan === "social";
    const summaryLines = (reference: string) =>
      [
        `Reference: ${reference}`,
        `Plan: ${PLAN_LABEL[selection.plan]}`,
        serviceTitle ? `Project type: ${serviceTitle}` : null,
        !standalone ? `Pages / screens: ${selection.pages}` : null,
        oneTimeAddOns.length ? `Add-ons: ${oneTimeAddOns.join(", ")}` : null,
        monthlyAddOns.length ? `Monthly services: ${monthlyAddOns.join(", ")}` : null,
        selection.care >= 0 ? `Care plan: ${carePlans[selection.care]?.name} (${taka(quote.care)}/month)` : null,
        selection.plan === "social" && quote.low > 0 ? `One-time setup: ${taka(quote.low)}` : null,
        selection.plan !== "care" && selection.plan !== "social"
          ? `Estimate: ${quote.quoteOnly ? "from " : ""}${taka(quote.low)} – ${taka(quote.high)} (one-time)`
          : null,
        quote.monthly > 0 ? `Monthly total: ${taka(quote.monthly)}` : null,
        d.timeline ? `Timeline: ${TIMELINE_LABEL[d.timeline]}` : null,
      ]
        .filter(Boolean)
        .join("\n");

    let reference = makeReference();
    let adminUrl = `${site.url}/admin/quotes`;
    try {
      for (let attempt = 0; attempt < 3; attempt++) {
        const [taken] = await sql`select 1 from public.quote_requests where reference = ${reference}`;
        if (!taken) break;
        reference = makeReference();
      }
      const [saved] = await sql`
        insert into public.quote_requests (
          reference, user_id, name, email, phone, organisation, plan, service, pages, add_ons, care_plan,
          estimate_low, estimate_high, monthly, timeline, preferred_contact, message, locale, ip_hash
        ) values (
          ${reference}, ${user?.id ?? null}, ${d.name}, ${d.email}, ${d.phone ?? null}, ${d.organisation ?? null},
          ${selection.plan}, ${selection.service ?? null}, ${selection.pages}, ${selection.addOns},
          ${selection.care >= 0 ? selection.care : null}, ${quote.low}, ${quote.high}, ${quote.monthly},
          ${d.timeline ?? null}, ${d.preferredContact}, ${d.message ?? null}, ${locale}, ${hash}
        )
        returning id
      `;
      adminUrl = `${site.url}/admin/quotes/${saved.id}`;
    } catch (error) {
      if (!missingTable(error)) throw error;
      // The quote table isn't migrated yet: keep the request in the contact inbox so nothing is lost.
      console.warn("quote_requests missing — saving quote as a contact request");
      const [saved] = await sql`
        insert into public.contact_requests (name, email, phone, service, budget, message, preferred_contact_method, ip_hash)
        values (
          ${d.name}, ${d.email}, ${d.phone ?? null}, ${`Quote request — ${PLAN_LABEL[selection.plan]}`},
          ${quote.low ? `${taka(quote.low)}${quote.high > quote.low ? ` – ${taka(quote.high)}` : ""}` : quote.monthly ? `${taka(quote.monthly)}/month` : null},
          ${`${summaryLines(reference)}${d.organisation ? `\nOrganisation: ${d.organisation}` : ""}\n\nNotes:\n${d.message || "-"}`},
          ${d.preferredContact}, ${hash}
        )
        returning id
      `;
      adminUrl = `${site.url}/admin/contacts/${saved.id}`;
    }

    const summary = summaryLines(reference);

    await notifyAdmins(
      { type: "quote", title: `New quote request ${reference} from ${d.name}`, message: `${PLAN_LABEL[selection.plan]}${serviceTitle ? ` · ${serviceTitle}` : ""}`, link: adminUrl.replace(site.url, "") },
      user?.id,
    );

    const adminEmail = process.env.ADMIN_EMAIL;
    await Promise.all([
      adminEmail
        ? sendEmail({
            to: adminEmail,
            replyTo: d.email,
            subject: `New quote request ${reference} — ${d.name}`,
            heading: "New quote request",
            body: `${summary}\n\nName: ${d.name}\nEmail: ${d.email}\nPhone: ${d.phone || "-"}\nOrganisation: ${d.organisation || "-"}\nPreferred contact: ${d.preferredContact}\n\nNotes:\n${d.message || "-"}`,
            cta: { label: "Open in admin", url: adminUrl },
          })
        : Promise.resolve(),
      sendEmail({
        to: d.email,
        replyTo: adminEmail || site.email,
        subject: `We received your quote request ${reference} — Nirdeshona Web`,
        heading: `Thanks, ${d.name.split(" ")[0]}!`,
        body: `We've received your request and will reply within 24 hours with a written scope and a fixed quote. Nothing is charged until you approve that quote.\n\n${summary}`,
        cta: { label: "See our work while you wait", url: `${site.url}/projects` },
      }),
    ]);

    return { ok: true, reference };
  } catch (error) {
    console.error("submitQuoteRequest failed", error);
    return {
      ok: false,
      error: await msg(
        "We couldn't save your request right now. Please try again, or email us directly.",
        "এই মুহূর্তে অনুরোধটি সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন, অথবা সরাসরি ইমেইল করুন।",
      ),
    };
  }
}
