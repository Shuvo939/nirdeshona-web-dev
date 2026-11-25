"use client";

import { safeNextPath } from "@/lib/safe-url";
import { FormEvent, useState } from "react";
import Link from "@/app/components/locale-link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import Captcha, { type CaptchaValue } from "@/app/components/captcha";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/client";

function getSafeNext() {
  if (typeof window === "undefined") return "/client";
  const next = new URLSearchParams(window.location.search).get("next");
  return safeNextPath(next, "/account");
}

export default function LoginForm({ initialCaptcha }: { initialCaptcha: { token: string; image: string } }) {
  const router = useRouter();
  const { L, lp, tm } = useI18n();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [remember, setRemember] = useState(true);
  const [captcha, setCaptcha] = useState<CaptchaValue>({ token: initialCaptcha.token, answer: "" });
  const [captchaKey, setCaptchaKey] = useState(0);

  /*
   * =========================================================
   * LOGIN
   * =========================================================
   */

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
    });
    const result = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(tm(result.error) ?? L("Couldn't log in. Please try again.", "লগ ইন করা যায়নি। আবার চেষ্টা করুন।"));
      setCaptchaKey((k) => k + 1); // every challenge works once
      setLoading(false);
      return;
    }

    router.push(lp(getSafeNext()));
    router.refresh();
  }

  /*
   * =========================================================
   * GOOGLE LOGIN
   * =========================================================
   */

  async function handleGoogleLogin() {
    setError(null);
    setGoogleLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(getSafeNext())}`,
      },
    });

    if (error) {
      setError(getAuthErrorMessage(error.message, L));
      setGoogleLoading(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-72px)] bg-neutral-50 px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-sm">
        {/* =================================================
            HEADER
        ================================================== */}

        <div className="mb-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-sm font-bold text-white">
              N
            </span>

            <span className="font-bold text-neutral-950">
              {L("Nirdeshona", "নির্দেশনা")}
            </span>
          </Link>

          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-neutral-950">
            {L("Welcome back", "আবার স্বাগতম")}
          </h1>

          <p className="mt-1.5 text-sm leading-6 text-neutral-500">
            {L("Log in to your Nirdeshona account.", "আপনার নির্দেশনা অ্যাকাউন্টে লগ ইন করুন।")}
          </p>
        </div>

        {/* =================================================
            CARD
        ================================================== */}

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-7">
          {/* Google */}

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading || googleLoading}
            className="flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-neutral-300 bg-white text-sm font-medium text-neutral-800 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <GoogleIcon />
            )}

            {googleLoading
              ? L("Connecting...", "সংযোগ হচ্ছে...")
              : L("Continue with Google", "Google দিয়ে চালিয়ে যান")}
          </button>

          {/* Divider */}

          <div className="my-5 flex items-center gap-4">
            <div className="h-px flex-1 bg-neutral-200" />

            <span className="text-xs text-neutral-400">
              {L("OR", "অথবা")}
            </span>

            <div className="h-px flex-1 bg-neutral-200" />
          </div>

          {/* =================================================
              LOGIN FORM
          ================================================== */}

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* Email */}

            <FloatingInput
              id="email"
              label={L("Email address", "ইমেইল ঠিকানা")}
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              autoComplete="email"
              disabled={loading || googleLoading}
            />

            {/* Password */}

            <div>
              <div className="mb-1.5 flex items-center justify-end">
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-neutral-600 hover:text-neutral-950 hover:underline"
                >
                  {L("Forgot password?", "পাসওয়ার্ড ভুলে গেছেন?")}
                </Link>
              </div>

              <FloatingPasswordInput
                id="password"
                label={L("Password", "পাসওয়ার্ড")}
                value={password}
                onChange={setPassword}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                autoComplete="current-password"
                disabled={loading || googleLoading}
              />
            </div>

            {/* Security check */}

            <Captcha initial={initialCaptcha} refreshKey={captchaKey} onChange={setCaptcha} />

            {/* Remember me */}

            <label className="flex cursor-pointer select-none items-center gap-2.5 text-sm text-neutral-700">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-neutral-300 accent-neutral-950"
              />
              {L("Remember me", "আমাকে মনে রাখুন")}
              <span className="text-xs text-neutral-400">{L("— stay signed in on this device", "— এই ডিভাইসে লগ ইন থাকুন")}</span>
            </label>

            {/* Error */}

            {error && (
              <ErrorMessage message={error} />
            )}

            {/* Submit */}

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}

              {loading ? L("Logging in...", "লগ ইন হচ্ছে...") : L("Log in", "লগ ইন")}
            </button>
          </form>

          {/* Register */}

          <p className="mt-6 text-center text-sm text-neutral-500">
            {L("Don't have an account?", "অ্যাকাউন্ট নেই?")}{" "}
            <Link
              href="/register"
              className="font-medium text-neutral-950 hover:underline"
            >
              {L("Create an account", "অ্যাকাউন্ট খুলুন")}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

/*
 * =========================================================
 * FLOATING INPUT
 * =========================================================
 */

function FloatingInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  disabled,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder ?? " "}
        autoComplete={autoComplete}
        required
        disabled={disabled}
        className="peer h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm outline-none transition placeholder:text-transparent focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10 disabled:bg-neutral-50"
      />

      <label
        htmlFor={id}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 bg-white px-1 text-sm text-neutral-400 transition-all peer-placeholder-shown:text-sm peer-focus:top-0 peer-focus:text-xs peer-focus:font-medium peer-focus:text-neutral-950 peer-focus:-translate-y-1/2 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-medium peer-[:not(:placeholder-shown)]:-translate-y-1/2"
      >
        {label}
      </label>
    </div>
  );
}

/*
 * =========================================================
 * FLOATING PASSWORD INPUT
 * =========================================================
 */

function FloatingPasswordInput({
  id,
  label,
  value,
  onChange,
  showPassword,
  setShowPassword,
  autoComplete,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  showPassword: boolean;
  setShowPassword: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  autoComplete?: string;
  disabled?: boolean;
}) {
  const { L } = useI18n();
  return (
    <div className="relative">
      <input
        id={id}
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder=" "
        autoComplete={autoComplete}
        required
        disabled={disabled}
        className="peer h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 pr-11 text-sm outline-none transition placeholder:text-transparent focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10 disabled:bg-neutral-50"
      />

      <label
        htmlFor={id}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 bg-white px-1 text-sm text-neutral-400 transition-all peer-placeholder-shown:text-sm peer-focus:top-0 peer-focus:text-xs peer-focus:font-medium peer-focus:text-neutral-950 peer-focus:-translate-y-1/2 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-medium peer-[:not(:placeholder-shown)]:-translate-y-1/2"
      >
        {label}
      </label>

      <button
        type="button"
        onClick={() =>
          setShowPassword((value) => !value)
        }
        disabled={disabled}
        aria-label={
          showPassword
            ? L("Hide password", "পাসওয়ার্ড লুকান")
            : L("Show password", "পাসওয়ার্ড দেখুন")
        }
        className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}

/*
 * =========================================================
 * ERROR MESSAGE
 * =========================================================
 */

function ErrorMessage({
  message,
}: {
  message: string;
}) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm leading-5 text-red-700"
    >
      {message}
    </div>
  );
}

/*
 * =========================================================
 * GOOGLE ICON
 * =========================================================
 */

function GoogleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4"
    >
      <path
        fill="#4285F4"
        d="M21.35 12.27c0-.78-.07-1.53-.2-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.7 2.91-4.2 2.91-7.42Z"
      />

      <path
        fill="#34A853"
        d="M12 21.6c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.7-1.72-5.47-4.03H3.29v2.53A9.75 9.75 0 0 0 12 21.6Z"
      />

      <path
        fill="#FBBC05"
        d="M6.53 13.68A5.86 5.86 0 0 1 6.22 12c0-.58.11-1.14.31-1.68V7.79H3.29A9.76 9.76 0 0 0 2.25 12c0 1.57.38 3.05 1.04 4.21l3.24-2.53Z"
      />

      <path
        fill="#EA4335"
        d="M12 6.29c1.43 0 2.72.49 3.73 1.45l2.8-2.8C16.84 3.39 14.63 2.4 12 2.4a9.75 9.75 0 0 0-8.71 5.39l3.24 2.53C7.3 8.01 9.46 6.29 12 6.29Z"
      />
    </svg>
  );
}

/*
 * =========================================================
 * SUPABASE AUTH ERROR MESSAGES
 * =========================================================
 */

function getAuthErrorMessage(message: string, L: <T>(en: T, bn: T) => T) {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("invalid login credentials")
  ) {
    return L("The email or password is incorrect.", "ইমেইল বা পাসওয়ার্ড সঠিক নয়।");
  }

  if (
    normalized.includes("email not confirmed")
  ) {
    return L("Please verify your email address before logging in.", "লগ ইন করার আগে আপনার ইমেইল ঠিকানা যাচাই করুন।");
  }

  if (
    normalized.includes("too many requests")
  ) {
    return L("Too many attempts. Please wait a moment and try again.", "অনেকবার চেষ্টা করা হয়েছে। একটু অপেক্ষা করে আবার চেষ্টা করুন।");
  }

  if (
    normalized.includes("rate limit")
  ) {
    return L("Too many requests. Please wait a moment before trying again.", "অনেক বেশি অনুরোধ। একটু অপেক্ষা করে আবার চেষ্টা করুন।");
  }

  return message;
}