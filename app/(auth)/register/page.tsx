"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Check,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
      setError("Please enter your full name.");
      return;
    }

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: {
          full_name: trimmedName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(getAuthErrorMessage(error.message));
      setLoading(false);
      return;
    }

    /*
     * Email confirmation enabled.
     */
    if (data.user && !data.session) {
      setSuccess(true);
      setLoading(false);
      return;
    }

    /*
     * Email confirmation disabled.
     */
    router.push("/client");
    router.refresh();
  }

  /*
   * =========================================================
   * GOOGLE SIGNUP
   * =========================================================
   */

  async function handleGoogleSignup() {
    setError(null);
    setGoogleLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(getAuthErrorMessage(error.message));
      setGoogleLoading(false);
    }
  }

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
                Nirdeshona
              </span>
            </Link>

            <h1 className="mt-6 text-2xl font-semibold tracking-tight text-neutral-950">
              Check your email
            </h1>

            <p className="mt-1.5 text-sm leading-6 text-neutral-500">
              We&apos;ve sent a verification link to your email
              address.
            </p>
          </div>

          {/* Card */}

          <div className="rounded-2xl border border-neutral-200 bg-white p-5 text-center shadow-sm sm:p-7">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600">
              <Check className="h-6 w-6" />
            </div>

            <p className="mt-4 text-sm leading-6 text-neutral-500">
              Click the link in the email sent to{" "}
              <span className="font-medium text-neutral-800">
                {email.trim()}
              </span>{" "}
              to verify your account and continue.
            </p>

            <Link
              href="/login"
              className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-neutral-950 px-5 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              Back to login
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
              Nirdeshona
            </span>
          </Link>

          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-neutral-950">
            Create your account
          </h1>

          <p className="mt-1.5 text-sm leading-6 text-neutral-500">
            Get started with your Nirdeshona account.
          </p>
        </div>

        {/* =================================================
            CARD
        ================================================== */}

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-7">
          {/* =================================================
              GOOGLE
          ================================================== */}

          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={loading || googleLoading}
            className="flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-neutral-300 bg-white px-4 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <GoogleIcon />
            )}

            {googleLoading
              ? "Connecting..."
              : "Continue with Google"}
          </button>

          {/* =================================================
              DIVIDER
          ================================================== */}

          <div className="my-5 flex items-center gap-4">
            <div className="h-px flex-1 bg-neutral-200" />

            <span className="text-xs text-neutral-400">
              OR
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
              label="Full name"
              type="text"
              value={fullName}
              onChange={setFullName}
              autoComplete="name"
              disabled={loading || googleLoading}
            />

            {/* Email */}

            <FloatingInput
              id="email"
              label="Email address"
              type="email"
              value={email}
              onChange={setEmail}
              autoComplete="email"
              disabled={loading || googleLoading}
            />

            {/* Password */}

            <FloatingPasswordInput
              id="password"
              label="Password"
              value={password}
              onChange={setPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              autoComplete="new-password"
              disabled={loading || googleLoading}
            />

            {/* Confirm password */}

            <FloatingPasswordInput
              id="confirmPassword"
              label="Confirm password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              showPassword={showConfirmPassword}
              setShowPassword={setShowConfirmPassword}
              autoComplete="new-password"
              disabled={loading || googleLoading}
            />

            <p className="text-xs text-neutral-400">
              Password must be at least 8 characters.
            </p>

            {/* Error */}

            {error && <ErrorMessage message={error} />}

            {/* Submit */}

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}

              {loading
                ? "Creating account..."
                : "Create account"}
            </button>
          </form>

          {/* =================================================
              LOGIN
          ================================================== */}

          <p className="mt-6 text-center text-sm text-neutral-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-neutral-950 hover:underline"
            >
              Log in
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
            ? "Hide password"
            : "Show password"
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

function getAuthErrorMessage(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("user already registered")) {
    return "An account with this email already exists. Try logging in instead.";
  }

  if (normalized.includes("password")) {
    return message;
  }

  if (normalized.includes("email")) {
    return message;
  }

  return message;
}