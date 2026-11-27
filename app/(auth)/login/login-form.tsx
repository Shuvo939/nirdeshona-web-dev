"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Link from "@/app/components/locale-link";
import LoginPanel from "@/app/components/auth/login-panel";
import { useI18n } from "@/lib/i18n/client";
import { safeNextPath } from "@/lib/safe-url";

function getSafeNext() {
  if (typeof window === "undefined") return "/account";
  return safeNextPath(new URLSearchParams(window.location.search).get("next"), "/account");
}

export default function LoginForm({ initialCaptcha }: { initialCaptcha: { token: string; image: string } }) {
  const router = useRouter();
  const { L, lp } = useI18n();
  const [next, setNext] = useState("/account");
  useEffect(() => setNext(getSafeNext()), []);

  function signedIn() {
    // Full navigation so the header and every server component see the new session.
    window.location.replace(lp(getSafeNext()));
    router.refresh();
  }

  return (
    <main className="min-h-[calc(100vh-72px)] bg-neutral-50 px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-sm">
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-sm font-bold text-white">N</span>
            <span className="font-bold text-neutral-950">{L("Nirdeshona", "নির্দেশনা")}</span>
          </Link>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-neutral-950">{L("Welcome back", "আবার স্বাগতম")}</h1>
          <p className="mt-1.5 text-sm leading-6 text-neutral-500">
            {L("Log in to your Nirdeshona account.", "আপনার নির্দেশনা অ্যাকাউন্টে লগ ইন করুন।")}
          </p>
        </div>

        <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-7">
          <LoginPanel initialCaptcha={initialCaptcha} next={next} onSignedIn={signedIn} />
        </div>
      </div>
    </main>
  );
}
