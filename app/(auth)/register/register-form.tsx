"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "@/app/components/locale-link";
import { useRouter } from "next/navigation";
import Captcha, { type CaptchaValue } from "@/app/components/captcha";
import GoogleSignIn from "@/app/components/auth/google-sign-in";
import { useAuthConfig } from "@/app/components/auth/auth-context";
import { safeNextPath } from "@/lib/safe-url";
import { useI18n } from "@/lib/i18n/client";
import {
  Check,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

export default function RegisterForm({ initialCaptcha }: { initialCaptcha: { token: string; image: string } }) {
  const { L, tm, lp } = useI18n();
  const { googleClientId } = useAuthConfig();
  const [next, setNext] = useState("/account");
  useEffect(() => setNext(safeNextPath(new URLSearchParams(window.location.search).get("next"), "/account")), []);
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [captcha, setCaptcha] = useState<CaptchaValue>({ token: initialCaptcha.token, answer: "" });
  const [captchaKey, setCaptchaKey] = useState(0);

  /*
   * =========================================================
   * REGISTER
   * =========================================================
   */

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    if (trimmedName.length < 2) {
      setError(L("Please enter your full name.", "আপনার পুরো নাম লিখুন।"));
      return;
    }

    if (!trimmedEmail) {
      setError(L("Please enter your email address.", "আপনার ইমেইল ঠিকানা লিখুন।"));
      return;
    }

    if (password.length < 8) {
      setError(L("Password must be at least 8 characters long.", "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।"));
      return;
    }

    if (password !== confirmPassword) {
      setError(L("Passwords do not match.", "পাসওয়ার্ড দুটি মেলেনি।"));
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: trimmedName,
        email: trimmedEmail,
        password,
        captchaToken: captcha.token,
        captchaAnswer: captcha.answer,
      }),
    });
    const result = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(tm(result.error) ?? L("Couldn't create your account. Please try again.", "অ্যাকাউন্ট খোলা যায়নি। আবার চেষ্টা করুন।"));
      setCaptchaKey((k) => k + 1);
      setLoading(false);
      return;
    }

    /*
     * Email confirmation enabled.
     */
    if (result.needsConfirmation) {
      setSuccess(true);
      setLoading(false);
      return;
    }

    /*
     * Email confirmation disabled.
     */
    router.push(lp(next));
    router.refresh();
  }

  /*
   * =========================================================
   * GOOGLE SIGNUP
   * =========================================================
   */



  /*
   * =========================================================
   * SUCCESS
   * =========================================================
   */

  if (success) {
    return (
      <main className="min-h-[calc(100vh-72px)] bg-neutral-50 px-4 py-10 sm:py-16">
        <div className="mx-auto max-w-md">
          {/* Header */}

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

            <h1 className="mt-6 text-2xl font-semibold tracking-tight text-neutral-950">
              {L("Check your email", "আপনার ইমেইল দেখুন")}
            </h1>

            <p className="mt-1.5 text-sm leading-6 text-neutral-500">
              {L("We've sent a verification link to your email address.", "আপনার ইমেইল ঠিকানায় একটি যাচাই লিংক পাঠানো হয়েছে।")}
            </p>
          </div>

          {/* Card */}

          <div className="rounded-2xl border border-neutral-200 bg-white p-5 text-center shadow-sm sm:p-7">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600">
              <Check className="h-6 w-6" />
            </div>

            <p className="mt-4 text-sm leading-6 text-neutral-500">
              {L("Click the link in the email sent to ", "")}
              <span className="font-medium text-neutral-800">
                {email.trim()}
              </span>
              {L(" to verify your account and continue.", " ঠিকানায় পাঠানো ইমেইলের লিংকে ক্লিক করে অ্যাকাউন্ট যাচাই করুন।")}
            </p>

            <Link
              href="/login"
              className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-neutral-950 px-5 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              {L("Back to login", "লগ ইনে ফিরে যান")}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /*
   * =========================================================
   * REGISTER PAGE
   * =========================================================
   */

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
            {L("Create your account", "আপনার অ্যাকাউন্ট খুলুন")}
          </h1>

          <p className="mt-1.5 text-sm leading-6 text-neutral-500">
            {L("Get started with your Nirdeshona account.", "নির্দেশনা অ্যাকাউন্ট দিয়ে শুরু করুন।")}
          </p>
        </div>

        {/* =================================================
            CARD
        ================================================== */}

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-7">
          {/* =================================================
              GOOGLE
          ================================================== */}

          <GoogleSignIn
            clientId={googleClientId}
            mode="signup"
            next={next}
            onSignedIn={() => window.location.replace(lp(next))}
          />

          {/* =================================================
              DIVIDER
          ================================================== */}

          <div className="my-5 flex items-center gap-4">
            <div className="h-px flex-1 bg-neutral-200" />

            <span className="text-xs text-neutral-400">
              {L("or with email", "অথবা ইমেইল দিয়ে")}
            </span>

            <div className="h-px flex-1 bg-neutral-200" />
          </div>

          {/* =================================================
              REGISTER FORM
          ================================================== */}

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* Full name */}

            <FloatingInput
              id="fullName"
              label={L("Full name", "পুরো নাম")}
              type="text"
              value={fullName}
              onChange={setFullName}
              autoComplete="name"
              disabled={loading}
            />

            {/* Email */}

            <FloatingInput
              id="email"
              label={L("Email address", "ইমেইল ঠিকানা")}
              type="email"
              value={email}
              onChange={setEmail}
              autoComplete="email"
              disabled={loading}
            />

            {/* Password */}

            <FloatingPasswordInput
              id="password"
              label={L("Password", "পাসওয়ার্ড")}
              value={password}
              onChange={setPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              autoComplete="new-password"
              disabled={loading}
            />

            {/* Confirm password */}

            <FloatingPasswordInput
              id="confirmPassword"
              label={L("Confirm password", "পাসওয়ার্ড নিশ্চিত করুন")}
              value={confirmPassword}
              onChange={setConfirmPassword}
              showPassword={showConfirmPassword}
              setShowPassword={setShowConfirmPassword}
              autoComplete="new-password"
              disabled={loading}
            />

            <p className="text-xs text-neutral-400">
              {L("Password must be at least 8 characters.", "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।")}
            </p>

            {/* Security check */}

            <Captcha initial={initialCaptcha} refreshKey={captchaKey} onChange={setCaptcha} />

            {/* Error */}

            {error && <ErrorMessage message={error} />}

            {/* Submit */}

            <button
              type="submit"
              disabled={loading}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}

              {loading
                ? L("Creating account...", "অ্যাকাউন্ট খোলা হচ্ছে...")
                : L("Create account", "অ্যাকাউন্ট খুলুন")}
            </button>
          </form>

          {/* =================================================
              LOGIN
          ================================================== */}

          <p className="mt-6 text-center text-sm text-neutral-500">
            {L("Already have an account?", "আগেই অ্যাকাউন্ট আছে?")}{" "}
            <Link
              href="/login"
              className="font-medium text-neutral-950 hover:underline"
            >
              {L("Log in", "লগ ইন")}
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
        onChange={(event) => onChange(event.target.value)}
        placeholder=" "
        autoComplete={autoComplete}
        required
        disabled={disabled}
        className="peer h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm outline-none transition placeholder:text-transparent focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10 disabled:bg-neutral-50"
      />

      <label
        htmlFor={id}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 bg-white px-1 text-sm text-neutral-400 transition-all peer-placeholder-shown:text-sm peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:font-medium peer-focus:text-neutral-950 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-medium"
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
        onChange={(event) => onChange(event.target.value)}
        placeholder=" "
        autoComplete={autoComplete}
        required
        disabled={disabled}
        className="peer h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 pr-11 text-sm outline-none transition placeholder:text-transparent focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10 disabled:bg-neutral-50"
      />

      <label
        htmlFor={id}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 bg-white px-1 text-sm text-neutral-400 transition-all peer-placeholder-shown:text-sm peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:font-medium peer-focus:text-neutral-950 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-medium"
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
