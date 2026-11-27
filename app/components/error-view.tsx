"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Home, Mail, RotateCw, TriangleAlert } from "lucide-react";

type Lang = "bn" | "en";

const COPY = {
  en: {
    eyebrow: "Something went wrong",
    title: "This page couldn't load",
    text: "It's probably a brief hiccup or a fresh update to the site. Reload to try again — your account and data are safe.",
    updating: "The site was just updated. Loading the latest version…",
    reload: "Reload page",
    back: "Go back",
    home: "Home",
    contact: "Contact us",
    code: "Error code",
  },
  bn: {
    eyebrow: "কিছু একটা সমস্যা হয়েছে",
    title: "পেজটি লোড করা যায়নি",
    text: "সম্ভবত সাময়িক সমস্যা, অথবা সাইটটি এইমাত্র আপডেট হয়েছে। আবার লোড করে দেখুন — আপনার অ্যাকাউন্ট ও তথ্য নিরাপদ আছে।",
    updating: "সাইটটি এইমাত্র আপডেট হয়েছে। নতুন সংস্করণ লোড হচ্ছে…",
    reload: "আবার লোড করুন",
    back: "পেছনে যান",
    home: "হোম",
    contact: "যোগাযোগ",
    code: "এরর কোড",
  },
} as const;

/** A deploy replaced the JS files this tab was using: a fresh load fixes it. */
function isStaleBuild(error: Error) {
  return /ChunkLoadError|Loading (CSS )?chunk|Failed to load chunk|dynamically imported module|Failed to fetch dynamically/i.test(
    `${error.name} ${error.message}`,
  );
}

function detectLang(): Lang {
  if (typeof window === "undefined") return "bn";
  const seg = window.location.pathname.split("/")[1];
  if (seg === "en" || seg === "bn") return seg;
  const cookie = document.cookie.match(/(?:^|; )nw_locale=(bn|en)/)?.[1];
  if (cookie === "en" || cookie === "bn") return cookie;
  return document.documentElement.lang === "en" ? "en" : "bn";
}

/** Branded error screen shared by error.tsx and global-error.tsx. */
export default function ErrorView({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const [lang, setLang] = useState<Lang>("bn");
  const [reloading, setReloading] = useState(false);
  const fallback = useRef<number | null>(null);
  // If the soft retry works, this view unmounts and the hard reload is cancelled.
  useEffect(() => () => {
    if (fallback.current) window.clearTimeout(fallback.current);
  }, []);
  const t = COPY[lang];
  const prefix = `/${lang}`;

  useEffect(() => {
    setLang(detectLang());
    console.error(error);
    // Reload once on a stale build; the timestamp stops a reload loop.
    if (isStaleBuild(error)) {
      const key = "nw_stale_reload";
      const last = Number(sessionStorage.getItem(key) || 0);
      if (Date.now() - last > 30_000) {
        sessionStorage.setItem(key, String(Date.now()));
        setReloading(true);
        window.location.reload();
      }
    }
  }, [error]);

  return (
    <main className="relative flex min-h-[calc(100vh-72px)] items-center justify-center overflow-hidden bg-white px-5 py-16" lang={lang}>
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[40%] h-[460px] w-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-100 blur-3xl" />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: "linear-gradient(to right, #e5e5e5 1px, transparent 1px), linear-gradient(to bottom, #e5e5e5 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(circle at center, black, transparent 70%)",
            WebkitMaskImage: "radial-gradient(circle at center, black, transparent 70%)",
          }}
        />
      </div>

      <div className="relative w-full max-w-md text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-600 shadow-sm">
          <TriangleAlert className="h-7 w-7" />
        </span>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">{t.eyebrow}</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">{t.title}</h1>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-neutral-500">{reloading ? t.updating : t.text}</p>

        <div className="mt-8 flex flex-col justify-center gap-2.5 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              setReloading(true);
              // A soft retry first; a hard reload if the error comes back.
              try {
                retry();
              } catch {
                window.location.reload();
              }
              fallback.current = window.setTimeout(() => window.location.reload(), 2500);
            }}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-neutral-950 px-6 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            <RotateCw className={`h-4 w-4 ${reloading ? "animate-spin" : ""}`} />
            {t.reload}
          </button>
          <button
            type="button"
            onClick={() => (window.history.length > 1 ? window.history.back() : window.location.assign(prefix))}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-6 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.back}
          </button>
        </div>

        <div className="mt-6 flex items-center justify-center gap-5 text-sm">
          <a href={prefix} className="inline-flex items-center gap-1.5 font-medium text-neutral-600 hover:text-neutral-950">
            <Home className="h-4 w-4" /> {t.home}
          </a>
          <a href={`${prefix}/contact`} className="inline-flex items-center gap-1.5 font-medium text-neutral-600 hover:text-neutral-950">
            <Mail className="h-4 w-4" /> {t.contact}
          </a>
        </div>

        {error.digest && (
          <p className="mt-8 text-[11px] text-neutral-400">
            {t.code}: <span className="font-mono">{error.digest}</span>
          </p>
        )}
      </div>
    </main>
  );
}
