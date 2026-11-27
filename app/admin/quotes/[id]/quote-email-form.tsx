"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2, Send, TriangleAlert } from "lucide-react";

import { sendQuoteEmail, type QuoteEmailState } from "../actions";

type Template = { id: string; label: string; subject: string; body: string };

/** Compose an email to the client, with quick templates in the client's language. */
export default function QuoteEmailForm({
  quoteId,
  reference,
  name,
  email,
  locale,
  estimate,
  status,
}: {
  quoteId: string;
  reference: string;
  name: string;
  email: string;
  locale: string;
  estimate: string;
  status: string;
}) {
  const [state, action, pending] = useActionState<QuoteEmailState, FormData>(sendQuoteEmail.bind(null, quoteId), null);
  const first = name.split(/\s+/)[0] || name;
  const bn = locale === "bn";

  const templates: Template[] = bn
    ? [
        {
          id: "thanks",
          label: "ধন্যবাদ ও পরবর্তী ধাপ",
          subject: `আপনার কোটেশন অনুরোধ ${reference} — নির্দেশনা ওয়েব`,
          body: `প্রিয় ${first},\n\nআপনার কোটেশন অনুরোধের জন্য ধন্যবাদ (রেফারেন্স: ${reference})। আমরা আপনার বাছাই দেখেছি।\n\nপরবর্তী ধাপ হিসেবে ১৫–২০ মিনিটের একটি ছোট আলোচনা করতে চাই, যাতে আপনার প্রয়োজন ভালোভাবে বুঝে লিখিত পরিসর ও নির্দিষ্ট মূল্য পাঠাতে পারি। কোন দিন ও সময় আপনার জন্য সুবিধাজনক, জানাবেন?\n\nশুভেচ্ছান্তে,\nনির্দেশনা ওয়েব ডেভেলপমেন্ট`,
        },
        {
          id: "quote",
          label: "মূল্য ও পরিসর",
          subject: `আপনার প্রজেক্টের মূল্য — ${reference}`,
          body: `প্রিয় ${first},\n\nআপনার বাছাই অনুযায়ী প্রজেক্টের আনুমানিক মূল্য ${estimate}।\n\nএর মধ্যে যা থাকছে:\n- \n- \n- \n\nসময়সীমা: \nপেমেন্ট: শুরুতে ৫০%, লঞ্চের আগে বাকি ৫০%।\n\nরাজি থাকলে এই ইমেইলের উত্তর দিন, আমরা কাজ শুরুর ব্যবস্থা করব।\n\nশুভেচ্ছান্তে,\nনির্দেশনা ওয়েব ডেভেলপমেন্ট`,
        },
        {
          id: "info",
          label: "আরও তথ্য দরকার",
          subject: `কয়েকটি প্রশ্ন — ${reference}`,
          body: `প্রিয় ${first},\n\nআপনার প্রজেক্টটি ঠিকভাবে পরিকল্পনা করতে কয়েকটি বিষয় জানা দরকার:\n\n১. \n২. \n৩. \n\nউত্তর পেলেই আমরা চূড়ান্ত মূল্য পাঠিয়ে দেব।\n\nশুভেচ্ছান্তে,\nনির্দেশনা ওয়েব ডেভেলপমেন্ট`,
        },
      ]
    : [
        {
          id: "thanks",
          label: "Thanks & next steps",
          subject: `Your quote request ${reference} — Nirdeshona Web`,
          body: `Hi ${first},\n\nThank you for your quote request (reference ${reference}). We've gone through your selection.\n\nAs a next step, we'd like a short 15–20 minute call to understand your needs, so we can send a written scope and a fixed price. Which day and time suit you?\n\nBest regards,\nNirdeshona Web Development`,
        },
        {
          id: "quote",
          label: "Price & scope",
          subject: `Your project price — ${reference}`,
          body: `Hi ${first},\n\nBased on your selection, the estimated price for your project is ${estimate}.\n\nWhat's included:\n- \n- \n- \n\nTimeline: \nPayment: 50% to start, 50% before launch.\n\nIf you're happy to go ahead, just reply to this email and we'll get started.\n\nBest regards,\nNirdeshona Web Development`,
        },
        {
          id: "info",
          label: "Need more info",
          subject: `A few questions — ${reference}`,
          body: `Hi ${first},\n\nTo plan your project properly, we need a few details:\n\n1. \n2. \n3. \n\nOnce we have your answers, we'll send the final price.\n\nBest regards,\nNirdeshona Web Development`,
        },
      ];

  const [subject, setSubject] = useState(templates[0].subject);
  const [body, setBody] = useState(templates[0].body);
  const [active, setActive] = useState("thanks");
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  // Clear the form after a successful send.
  useEffect(() => {
    if (state?.ok) {
      setSubject("");
      setBody("");
      setActive("");
    }
  }, [state]);

  return (
    <form action={action} className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-neutral-950">Email the client</h2>
        <span className="text-xs text-neutral-500">To: {email}</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {templates.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setActive(t.id);
              setSubject(t.subject);
              setBody(t.body);
              bodyRef.current?.focus();
            }}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              active === t.id ? "bg-neutral-950 text-white" : "border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <label htmlFor="email-subject" className="mt-4 block text-xs text-neutral-500">
        Subject
      </label>
      <input
        id="email-subject"
        name="subject"
        required
        maxLength={200}
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="mt-1 h-10 w-full rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-neutral-400"
      />
      <label htmlFor="email-body" className="mt-4 block text-xs text-neutral-500">
        Message
      </label>
      <textarea
        id="email-body"
        ref={bodyRef}
        name="body"
        required
        rows={11}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="mt-1 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm leading-6 outline-none focus:border-neutral-400"
      />
      <p className="mt-1 text-[11px] text-neutral-400">Sent with the Nirdeshona Web email design. Replies come to your inbox.</p>

      {status === "new" && (
        <label className="mt-4 flex items-center gap-2 text-sm text-neutral-700">
          <input type="checkbox" name="mark_contacted" defaultChecked className="h-4 w-4 accent-neutral-950" />
          Mark as “Contacted” after sending
        </label>
      )}

      {state && (
        <p
          role="status"
          className={`mt-4 flex items-start gap-2 rounded-xl px-3 py-2 text-sm ${state.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}
        >
          {state.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />}
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || !subject.trim() || body.trim().length < 5}
        className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-neutral-950 px-4 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {pending ? "Sending…" : "Send email"}
      </button>
    </form>
  );
}
