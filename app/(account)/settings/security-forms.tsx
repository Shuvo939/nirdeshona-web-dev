"use client";

import Link from "@/app/components/locale-link";
import { FormEvent, useState } from "react";

import { useI18n } from "@/lib/i18n/client";
import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

const inputClass =
  "h-11 w-full rounded-xl border border-neutral-200 bg-white px-3.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10";

type Status = { type: "ok" | "error"; text: string } | null;

export function PasswordForm({ email }: { email: string }) {
  const { L, tm } = useI18n();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setStatus(null);
    if (next.length < 8) return setStatus({ type: "error", text: L("New password must be at least 8 characters.", "নতুন পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।") });
    if (next !== confirm) return setStatus({ type: "error", text: L("The new passwords don't match.", "নতুন পাসওয়ার্ড দুটি মেলেনি।") });

    setLoading(true);
    const supabase = createClient();
    // Re-authenticate first so a stolen session alone can't change the password.
    const { error: reauthError } = await supabase.auth.signInWithPassword({ email, password: current });
    if (reauthError) {
      setLoading(false);
      return setStatus({ type: "error", text: L("Your current password is incorrect.", "আপনার বর্তমান পাসওয়ার্ড সঠিক নয়।") });
    }
    const { error } = await supabase.auth.updateUser({ password: next });
    setLoading(false);
    if (error) return setStatus({ type: "error", text: tm(error.message) });
    setCurrent("");
    setNext("");
    setConfirm("");
    setStatus({ type: "ok", text: L("Password updated.", "পাসওয়ার্ড আপডেট হয়েছে।") });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <PasswordInput id="current-password" label={L("Current password", "বর্তমান পাসওয়ার্ড")} value={current} onChange={setCurrent} autoComplete="current-password" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <PasswordInput id="new-password" label={L("New password", "নতুন পাসওয়ার্ড")} value={next} onChange={setNext} autoComplete="new-password" />
        <PasswordInput id="confirm-password" label={L("Confirm new password", "নতুন পাসওয়ার্ড নিশ্চিত করুন")} value={confirm} onChange={setConfirm} autoComplete="new-password" />
      </div>
      {next.length > 0 && <StrengthMeter password={next} />}
      <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
        <StatusText status={status} />
        <SubmitButton loading={loading}>{L("Update password", "পাসওয়ার্ড আপডেট করুন")}</SubmitButton>
      </div>
      <p className="text-xs leading-5 text-neutral-500">
        {L("Forgot your current password, or signed up with Google?", "বর্তমান পাসওয়ার্ড ভুলে গেছেন, নাকি Google দিয়ে সাইন আপ করেছিলেন?")}{" "}
        <Link href="/settings/password" className="font-medium text-neutral-900 underline">
          {L("Reset it with an email code", "ইমেইল কোড দিয়ে রিসেট করুন")}
        </Link>
        .
      </p>
    </form>
  );
}

export function EmailForm({ email }: { email: string }) {
  const { L, tm } = useI18n();
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setStatus(null);
    const nextEmail = value.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) return setStatus({ type: "error", text: L("Enter a valid email address.", "সঠিক ইমেইল ঠিকানা লিখুন।") });
    if (nextEmail === email.toLowerCase()) return setStatus({ type: "error", text: L("That's already your email.", "এটি তো আপনার বর্তমান ইমেইল।") });

    setLoading(true);
    const { error } = await createClient().auth.updateUser(
      { email: nextEmail },
      { emailRedirectTo: `${window.location.origin}/auth/callback?next=/settings` },
    );
    setLoading(false);
    if (error) return setStatus({ type: "error", text: tm(error.message) });
    setValue("");
    setStatus({ type: "ok", text: L("Check both inboxes to confirm the change.", "পরিবর্তন নিশ্চিত করতে দুটি ইনবক্সই দেখুন।") });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-neutral-800">{L("New email address", "নতুন ইমেইল ঠিকানা")}</span>
        <input type="email" value={value} onChange={(e) => setValue(e.target.value)} placeholder="you@example.com" className={inputClass} autoComplete="email" />
      </label>
      <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
        <StatusText status={status} />
        <SubmitButton loading={loading}>{L("Change email", "ইমেইল বদলান")}</SubmitButton>
      </div>
    </form>
  );
}

function PasswordInput({
  id,
  label,
  value,
  onChange,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
}) {
  const { L } = useI18n();
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-neutral-800">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          autoComplete={autoComplete}
          className={`${inputClass} pr-11`}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? L(`Hide ${label.toLowerCase()}`, `${label} লুকান`) : L(`Show ${label.toLowerCase()}`, `${label} দেখুন`)}
          aria-pressed={show}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-neutral-400 transition hover:text-neutral-800"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function StrengthMeter({ password }: { password: string }) {
  const { L } = useI18n();
  const checks = [password.length >= 8, /[A-Z]/.test(password) && /[a-z]/.test(password), /\d/.test(password), /[^A-Za-z0-9]/.test(password), password.length >= 12];
  const score = checks.filter(Boolean).length;
  const levels = [
    { label: L("Too weak", "খুব দুর্বল"), color: "bg-red-500" },
    { label: L("Weak", "দুর্বল"), color: "bg-red-500" },
    { label: L("Fair", "মোটামুটি"), color: "bg-amber-500" },
    { label: L("Good", "ভালো"), color: "bg-lime-500" },
    { label: L("Strong", "শক্তিশালী"), color: "bg-emerald-500" },
    { label: L("Very strong", "খুব শক্তিশালী"), color: "bg-emerald-600" },
  ];
  const level = levels[score];
  return (
    <div>
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-full ${i < score ? level.color : "bg-neutral-200"}`} />
        ))}
      </div>
      <p className="mt-1.5 text-xs text-neutral-500">
        {L("Strength:", "শক্তি:")} <span className="font-medium text-neutral-800">{level.label}</span> ·{" "}
        {L("use 12+ characters with numbers and symbols", "সংখ্যা ও চিহ্নসহ ১২+ অক্ষর ব্যবহার করুন")}
      </p>
    </div>
  );
}

function StatusText({ status }: { status: Status }) {
  if (!status) return null;
  return status.type === "ok" ? (
    <p className="flex items-center gap-1.5 text-sm text-emerald-700">
      <CheckCircle2 className="h-4 w-4" /> {status.text}
    </p>
  ) : (
    <p className="text-sm text-red-600">{status.text}</p>
  );
}

function SubmitButton({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-neutral-950 px-5 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-60"
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
