"use client";

import Link from "@/app/components/locale-link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { L, lp } = useI18n();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
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

    const { error } = await createClient().auth.updateUser({
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    setTimeout(() => {
      router.push(lp("/client"));
      router.refresh();
    }, 1500);
  }

  return (
    <main className="min-h-[calc(100vh-72px)] bg-neutral-50 px-4 py-12 sm:py-20">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-sm font-bold text-white">
              N
            </span>

            <span className="font-bold">{L("Nirdeshona", "নির্দেশনা")}</span>
          </Link>

          <h1 className="mt-8 text-2xl font-semibold">
            {L("Create a new password", "নতুন পাসওয়ার্ড দিন")}
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            {L("Choose a strong password for your account.", "আপনার অ্যাকাউন্টের জন্য একটি শক্তিশালী পাসওয়ার্ড বেছে নিন।")}
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          {success ? (
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600">
                <Check className="h-7 w-7" />
              </div>

              <h2 className="mt-5 text-lg font-semibold">
                {L("Password updated", "পাসওয়ার্ড আপডেট হয়েছে")}
              </h2>

              <p className="mt-2 text-sm text-neutral-500">
                {L("Your password has been changed successfully.", "আপনার পাসওয়ার্ড সফলভাবে বদলানো হয়েছে।")}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium"
                >
                  {L("New password", "নতুন পাসওয়ার্ড")}
                </label>

                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="new-password"
                    required
                    className="h-11 w-full rounded-xl border border-neutral-200 pl-10 pr-11 text-sm outline-none focus:border-black"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-1.5 block text-sm font-medium"
                >
                  {L("Confirm password", "পাসওয়ার্ড নিশ্চিত করুন")}
                </label>

                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />

                  <input
                    id="confirmPassword"
                    type={
                      showConfirmPassword ? "text" : "password"
                    }
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    autoComplete="new-password"
                    required
                    className="h-11 w-full rounded-xl border border-neutral-200 pl-10 pr-11 text-sm outline-none focus:border-black"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((value) => !value)
                    }
                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-black text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {L("Updating...", "আপডেট হচ্ছে...")}
                  </>
                ) : (
                  L("Update password", "পাসওয়ার্ড আপডেট করুন")
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}