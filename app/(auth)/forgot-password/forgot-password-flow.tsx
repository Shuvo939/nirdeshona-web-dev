"use client";

import Link from "@/app/components/locale-link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import Captcha, { type CaptchaValue } from "@/app/components/captcha";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/client";

type Step = "email" | "otp" | "password" | "success";

const OTP_LENGTH = 8;

// Used on /forgot-password (signed out) and inside the account area at
// /settings/password (signed in, email locked to the account's address).
export default function ForgotPasswordFlow({
  accountEmail,
  initialCaptcha,
}: {
  accountEmail?: string;
  initialCaptcha?: { token: string; image: string };
}) {
  const router = useRouter();
  const { L, lp, num, tm } = useI18n();
  const supabase = createClient();
  const embedded = Boolean(accountEmail);

  const [step, setStep] = useState<Step>("email");

  const [email, setEmail] = useState(accountEmail ?? "");
  const [captcha, setCaptcha] = useState<CaptchaValue>({ token: initialCaptcha?.token ?? "", answer: "" });
  const [captchaKey, setCaptchaKey] = useState(0);
  const [otp, setOtp] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /*
   * =========================================================
   * SEND OTP
   * =========================================================
   */

  async function handleSendOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError(L("Please enter your email address.", "আপনার ইমেইল ঠিকানা লিখুন।"));
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/recover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: trimmedEmail,
        ...(embedded ? {} : { captchaToken: captcha.token, captchaAnswer: captcha.answer }),
      }),
    });
    const result = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(tm(result.error) ?? L("Couldn't send the code. Please try again.", "কোড পাঠানো যায়নি। আবার চেষ্টা করুন।"));
      if (!embedded) setCaptchaKey((k) => k + 1);
      setLoading(false);
      return;
    }

    setEmail(trimmedEmail);
    setOtp("");
    setStep("otp");
    setLoading(false);
  }

  /*
   * =========================================================
   * VERIFY OTP
   * =========================================================
   */

  async function handleVerifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);

    const cleanOtp = otp.replace(/\D/g, "");

    if (cleanOtp.length !== OTP_LENGTH) {
      setError(
        L(`Please enter the ${OTP_LENGTH}-digit verification code.`, `${num(OTP_LENGTH)} অঙ্কের যাচাই কোডটি লিখুন।`)
      );
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: cleanOtp,
      type: "recovery",
    });

    if (error) {
      setError(getAuthErrorMessage(error.message, L));
      setLoading(false);
      return;
    }

    setOtp("");
    setStep("password");
    setLoading(false);
  }

  /*
   * =========================================================
   * RESEND OTP
   * =========================================================
   */

  async function handleResendOtp() {
    setError(null);
    setResending(true);

    const { error } =
      await supabase.auth.resetPasswordForEmail(email.trim());

    if (error) {
      setError(getAuthErrorMessage(error.message, L));
      setResending(false);
      return;
    }

    setOtp("");
    setResending(false);
  }

  /*
   * =========================================================
   * UPDATE PASSWORD
   * =========================================================
   */

  async function handleUpdatePassword(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError(null);

    if (password.length < 8) {
      setError(L("Password must be at least 8 characters long.", "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।"));
      return;
    }

    if (password !== confirmPassword) {
      setError(L("Passwords do not match.", "পাসওয়ার্ড দুটি মেলেনি।"));
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setError(getAuthErrorMessage(error.message, L));
      setLoading(false);
      return;
    }

    setStep("success");
    setLoading(false);

    setTimeout(() => {
      router.push(lp(embedded ? "/settings?password=updated" : "/account"));
      router.refresh();
    }, 1500);
  }

  /*
   * =========================================================
   * HEADER
   * =========================================================
   */

  const header = {
    email: embedded
      ? {
          title: L("Reset your password", "পাসওয়ার্ড রিসেট করুন"),
          description: L("We'll email you a verification code to confirm it's you.", "আপনিই কি না নিশ্চিত হতে ইমেইলে একটি যাচাই কোড পাঠাব।"),
        }
      : {
          title: L("Forgot your password?", "পাসওয়ার্ড ভুলে গেছেন?"),
          description:
            L("Enter your email, we'll send a verification code.", "আপনার ইমেইল দিন, আমরা একটি যাচাই কোড পাঠাব।"),
        },

    otp: {
      title: L("Verify your email", "ইমেইল যাচাই করুন"),
      description: L(`Enter the code sent to ${email}.`, `${email} ঠিকানায় পাঠানো কোডটি লিখুন।`),
    },

    password: {
      title: L("Create a new password", "নতুন পাসওয়ার্ড দিন"),
      description:
        L("Your email has been verified. Choose a new password.", "আপনার ইমেইল যাচাই হয়েছে। নতুন পাসওয়ার্ড বেছে নিন।"),
    },

    success: {
      title: L("Password updated", "পাসওয়ার্ড আপডেট হয়েছে"),
      description:
        L("Your password has been changed successfully.", "আপনার পাসওয়ার্ড সফলভাবে বদলানো হয়েছে।"),
    },
  }[step];

  return (
    <main className={embedded ? "" : "min-h-[400px] bg-neutral-50 px-4 py-10 sm:py-16"}>
      <div className={embedded ? "max-w-md" : "mx-auto max-w-sm"}>
        {/* Header */}
        {embedded ? (
          step !== "email" && <div className="mb-4">
            <h2 className="text-lg font-semibold text-neutral-950">{header.title}</h2>
            <p className="mt-1 text-sm leading-6 text-neutral-500">{header.description}</p>
          </div>
        ) : (
          <div className="mb-6 text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-sm font-bold text-white">
                N
              </span>
              <span className="font-bold text-neutral-950">
                {L("Nirdeshona", "নির্দেশনা")}
              </span>
            </Link>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-neutral-950">
              {header.title}
            </h1>
            <p className="mt-1.5 text-sm leading-6 text-neutral-500">
              {header.description}
            </p>
          </div>
        )}

        {/* Card */}

        <div className={embedded ? "rounded-3xl border border-neutral-200 bg-white p-5 sm:p-6" : "rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-7"}>
          {/* =================================================
              STEP 1 — EMAIL
          ================================================== */}

          {step === "email" && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              {embedded ? (
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                  <p className="text-xs text-neutral-500">{L("Code will be sent to", "কোড পাঠানো হবে")}</p>
                  <p className="mt-0.5 break-all text-sm font-medium text-neutral-900">{email}</p>
                </div>
              ) : (
                <FloatingInput
                  id="email"
                  label={L("Email address", "ইমেইল ঠিকানা")}
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={loading}
                />
              )}

              {!embedded && initialCaptcha && (
                <Captcha initial={initialCaptcha} refreshKey={captchaKey} onChange={setCaptcha} />
              )}

              {error && <ErrorMessage message={error} />}

              <button
                type="submit"
                disabled={loading}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}

                {loading ? L("Sending code...", "কোড পাঠানো হচ্ছে...") : embedded ? L("Send verification code", "যাচাই কোড পাঠান") : L("Send OTP", "OTP পাঠান")}
              </button>

              {embedded ? (
                <p className="text-center text-sm text-neutral-500">
                  {L("Know your current password?", "বর্তমান পাসওয়ার্ড জানেন?")}{" "}
                  <Link href="/settings" className="font-medium text-neutral-950 hover:underline">
                    {L("Change it in Settings", "সেটিংসে গিয়ে বদলান")}
                  </Link>
                </p>
              ) : (
                <p className="text-center text-sm text-neutral-500">
                  {L("Remember your password?", "পাসওয়ার্ড মনে পড়েছে?")}{" "}
                  <Link
                    href="/login"
                    className="font-medium text-neutral-950 hover:underline"
                  >
                    {L("Log in", "লগ ইন")}
                  </Link>
                </p>
              )}
            </form>
          )}

          {/* =================================================
              STEP 2 — OTP
          ================================================== */}

          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-neutral-100">
                  <ShieldCheck className="h-5 w-5 text-neutral-700" />
                </div>

                <p className="mt-3 text-sm leading-6 text-neutral-500">
                  Enter the {OTP_LENGTH}-digit code sent to{" "}
                  <span className="font-medium text-neutral-800">
                    {email}
                  </span>
                </p>
              </div>

              <FloatingInput
                id="otp"
                label={L("Verification code", "যাচাই কোড")}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={(value) =>
                  setOtp(
                    value.replace(/\D/g, "").slice(0, OTP_LENGTH)
                  )
                }
                placeholder="00000000"
                maxLength={OTP_LENGTH}
                disabled={loading}
                autoFocus
              />

              {error && <ErrorMessage message={error} />}

              <button
                type="submit"
                disabled={loading || otp.length !== OTP_LENGTH}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}

                {loading ? L("Verifying...", "যাচাই হচ্ছে...") : L("Verify OTP", "OTP যাচাই করুন")}
              </button>

              <div className="flex items-center justify-center gap-1 text-sm text-neutral-500">
                <span>{L("Didn't receive the code?", "কোড পাননি?")}</span>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resending}
                  className="font-medium text-neutral-950 hover:underline disabled:opacity-50"
                >
                  {resending ? L("Sending...", "পাঠানো হচ্ছে...") : L("Resend OTP", "আবার OTP পাঠান")}
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setOtp("");
                  setStep("email");
                }}
                className="block w-full text-center text-sm text-neutral-500 hover:text-neutral-950 hover:underline"
              >
                {L("Use a different email", "অন্য ইমেইল ব্যবহার করুন")}
              </button>
            </form>
          )}

          {/* =================================================
              STEP 3 — PASSWORD
          ================================================== */}

          {step === "password" && (
            <form
              onSubmit={handleUpdatePassword}
              className="space-y-4"
            >
              <div className="rounded-xl border border-green-200 bg-green-50 px-3.5 py-2.5">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />

                  <p className="text-sm font-medium text-green-800">
                    {L("Email verified", "ইমেইল যাচাই হয়েছে")}
                  </p>
                </div>

                <p className="mt-0.5 pl-6 text-xs text-green-700">
                  {L("You can now create a new password.", "এখন নতুন পাসওয়ার্ড দিতে পারেন।")}
                </p>
              </div>

              <FloatingPasswordInput
                id="password"
                label={L("New password", "নতুন পাসওয়ার্ড")}
                value={password}
                onChange={setPassword}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                disabled={loading}
                autoComplete="new-password"
              />

              <FloatingPasswordInput
                id="confirmPassword"
                label={L("Confirm new password", "নতুন পাসওয়ার্ড নিশ্চিত করুন")}
                value={confirmPassword}
                onChange={setConfirmPassword}
                showPassword={showConfirmPassword}
                setShowPassword={setShowConfirmPassword}
                disabled={loading}
                autoComplete="new-password"
              />

              <p className="text-xs text-neutral-400">
                {L("Password must be at least 8 characters.", "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।")}
              </p>

              {error && <ErrorMessage message={error} />}

              <button
                type="submit"
                disabled={loading}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}

                {loading
                  ? L("Updating password...", "পাসওয়ার্ড আপডেট হচ্ছে...")
                  : L("Update password", "পাসওয়ার্ড আপডেট করুন")}
              </button>
            </form>
          )}

          {/* =================================================
              STEP 4 — SUCCESS
          ================================================== */}

          {step === "success" && (
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600">
                <Check className="h-7 w-7" />
              </div>

              <h2 className="mt-4 text-lg font-semibold text-neutral-950">
                {L("Password updated", "পাসওয়ার্ড আপডেট হয়েছে")}
              </h2>

              <p className="mt-1.5 text-sm leading-6 text-neutral-500">
                {L(
                  "Your password has been changed successfully. Redirecting you to your account...",
                  "আপনার পাসওয়ার্ড সফলভাবে বদলানো হয়েছে। আপনাকে অ্যাকাউন্টে নিয়ে যাওয়া হচ্ছে...",
                )}
              </p>
            </div>
          )}
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
  inputMode,
  autoComplete,
  maxLength,
  disabled,
  autoFocus,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputMode?: "text" | "numeric" | "decimal" | "tel" | "email";
  autoComplete?: string;
  maxLength?: number;
  disabled?: boolean;
  autoFocus?: boolean;
}) {
  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder ?? " "}
        inputMode={inputMode}
        autoComplete={autoComplete}
        maxLength={maxLength}
        required
        disabled={disabled}
        autoFocus={autoFocus}
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
  disabled,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  disabled?: boolean;
  autoComplete?: string;
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
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 bg-white px-1 text-sm text-neutral-400 transition-all peer-placeholder-shown:text-sm peer-focus:top-0 peer-focus:text-xs peer-focus:font-medium peer-focus:text-neutral-950 peer-focus:-translate-y-1/2 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-medium peer-[:not(:placeholder-shown)]:-translate-y-1/2"
      >
        {label}
      </label>

      <button
        type="button"
        onClick={() => setShowPassword((value) => !value)}
        disabled={disabled}
        aria-label={
          showPassword ? L("Hide password", "পাসওয়ার্ড লুকান") : L("Show password", "পাসওয়ার্ড দেখুন")
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

function ErrorMessage({ message }: { message: string }) {
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
 * SUPABASE AUTH ERROR MESSAGES
 * =========================================================
 */

function getAuthErrorMessage(message: string, L: <T>(en: T, bn: T) => T) {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("otp") &&
    (normalized.includes("expired") ||
      normalized.includes("invalid"))
  ) {
    return L("This verification code is invalid or has expired. Please request a new code.", "যাচাই কোডটি ভুল বা মেয়াদোত্তীর্ণ। নতুন কোড চেয়ে নিন।");
  }

  if (
    normalized.includes("token") &&
    normalized.includes("expired")
  ) {
    return L("This verification code has expired. Please request a new code.", "যাচাই কোডের মেয়াদ শেষ। নতুন কোড চেয়ে নিন।");
  }

  if (
    normalized.includes("too many requests") ||
    normalized.includes("rate limit")
  ) {
    return L("Too many requests. Please wait a moment before trying again.", "অনেক বেশি অনুরোধ। একটু অপেক্ষা করে আবার চেষ্টা করুন।");
  }

  if (normalized.includes("password")) {
    return message;
  }

  return message;
}