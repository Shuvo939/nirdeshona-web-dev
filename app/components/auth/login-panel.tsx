"use client";

import { FormEvent, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import Link from "@/app/components/locale-link";
import Captcha, { type CaptchaValue } from "@/app/components/captcha";
import GoogleSignIn from "@/app/components/auth/google-sign-in";
import { useAuthConfig } from "@/app/components/auth/auth-context";
import { useI18n } from "@/lib/i18n/client";

/**
 * Google + email/password sign-in. Shared by /login and the login popup so
 * both behave identically. `onSignedIn` decides what happens next.
 */
export default function LoginPanel({
  initialCaptcha,
  next,
  onSignedIn,
  onNavigate,
}: {
  initialCaptcha: { token: string; image: string };
  next: string;
  onSignedIn: () => void;
  /** Called when a link inside the panel is followed (the popup closes). */
  onNavigate?: () => void;
}) {
  const { L, tm } = useI18n();
  const { googleClientId } = useAuthConfig();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remember, setRemember] = useState(true);
  const [captcha, setCaptcha] = useState<CaptchaValue>({ token: initialCaptcha.token, answer: "" });
  const [captchaKey, setCaptchaKey] = useState(0);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim(),
        password,
        remember,
        captchaToken: captcha.token,
        captchaAnswer: captcha.answer,
      }),
    }).catch(() => null);
    const result = await res?.json().catch(() => ({}));
    if (!res?.ok) {
      setError(tm(result?.error) ?? L("Couldn't log in. Please try again.", "লগ ইন করা যায়নি। আবার চেষ্টা করুন।"));
      setCaptchaKey((k) => k + 1); // every challenge works once
      setLoading(false);
      return;
    }
    onSignedIn();
  }

  return (
    <div>
      <GoogleSignIn clientId={googleClientId} next={next} onSignedIn={onSignedIn} />

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-neutral-200" />
        <span className="text-xs text-neutral-400">{L("or with email", "অথবা ইমেইল দিয়ে")}</span>
        <div className="h-px flex-1 bg-neutral-200" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FloatingInput
          id="login-email"
          label={L("Email address", "ইমেইল ঠিকানা")}
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          disabled={loading}
        />

        <div>
          <div className="mb-1.5 flex items-center justify-end">
            <Link
              href="/forgot-password"
              onClick={onNavigate}
              className="text-xs font-medium text-neutral-600 hover:text-neutral-950 hover:underline"
            >
              {L("Forgot password?", "পাসওয়ার্ড ভুলে গেছেন?")}
            </Link>
          </div>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=" "
              autoComplete="current-password"
              required
              disabled={loading}
              className="peer h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 pr-11 text-sm text-neutral-950 outline-none transition placeholder:text-transparent focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10 disabled:bg-neutral-50"
            />
            <FloatLabel htmlFor="login-password">{L("Password", "পাসওয়ার্ড")}</FloatLabel>
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              disabled={loading}
              aria-label={showPassword ? L("Hide password", "পাসওয়ার্ড লুকান") : L("Show password", "পাসওয়ার্ড দেখুন")}
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Captcha initial={initialCaptcha} refreshKey={captchaKey} onChange={setCaptcha} />

        <label className="flex cursor-pointer select-none items-center gap-2.5 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 rounded border-neutral-300 accent-neutral-950"
          />
          {L("Remember me", "আমাকে মনে রাখুন")}
        </label>

        {error && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm leading-5 text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-neutral-950 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? L("Logging in…", "লগ ইন হচ্ছে…") : L("Log in", "লগ ইন")}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-neutral-500">
        {L("Don't have an account?", "অ্যাকাউন্ট নেই?")}{" "}
        <Link
          href={`/register?next=${encodeURIComponent(next)}`}
          onClick={onNavigate}
          className="font-semibold text-neutral-950 hover:underline"
        >
          {L("Create an account", "অ্যাকাউন্ট খুলুন")}
        </Link>
      </p>
    </div>
  );
}

function FloatLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 bg-white px-1 text-sm text-neutral-400 transition-all peer-focus:top-0 peer-focus:text-xs peer-focus:font-medium peer-focus:text-neutral-950 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-medium"
    >
      {children}
    </label>
  );
}

function FloatingInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  autoComplete,
  disabled,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder=" "
        autoComplete={autoComplete}
        required
        disabled={disabled}
        className="peer h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-950 outline-none transition placeholder:text-transparent focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10 disabled:bg-neutral-50"
      />
      <FloatLabel htmlFor={id}>{label}</FloatLabel>
    </div>
  );
}
