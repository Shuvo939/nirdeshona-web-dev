"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

import { useI18n } from "@/lib/i18n/client";
import { createClient } from "@/lib/supabase/client";

/* Minimal typings for Google Identity Services. */
interface GsiButtonOptions {
  type?: "standard" | "icon";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  shape?: "rectangular" | "pill" | "circle" | "square";
  logo_alignment?: "left" | "center";
  width?: number;
  locale?: string;
}
interface GsiId {
  initialize(o: {
    client_id: string;
    callback: (r: { credential?: string }) => void;
    nonce?: string;
    ux_mode?: "popup";
    use_fedcm_for_button?: boolean;
    itp_support?: boolean;
    context?: "signin" | "signup" | "use";
  }): void;
  renderButton(el: HTMLElement, o: GsiButtonOptions): void;
}
declare global {
  interface Window {
    google?: { accounts?: { id?: GsiId } };
  }
}

const GSI_SRC = "https://accounts.google.com/gsi/client";
let gsiPromise: Promise<GsiId> | null = null;
function loadGsi(): Promise<GsiId> {
  if (window.google?.accounts?.id) return Promise.resolve(window.google.accounts.id);
  gsiPromise ??= new Promise<GsiId>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = GSI_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => (window.google?.accounts?.id ? resolve(window.google.accounts.id) : reject(new Error("gsi")));
    s.onerror = () => {
      gsiPromise = null;
      reject(new Error("gsi"));
    };
    document.head.appendChild(s);
  });
  return gsiPromise;
}

async function makeNonce() {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  const raw = btoa(String.fromCharCode(...bytes)).replace(/[+/=]/g, "");
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  const hashed = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return { raw, hashed };
}

// Google only accepts origins registered for the client ID (so not Vercel previews).
const ALLOWED_HOSTS = ["web.nirdeshona.com", "localhost"];

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8Z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3a7.2 7.2 0 0 1-10.8-3.8h-4v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1Z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1A7.2 7.2 0 0 1 12 4.8Z" />
    </svg>
  );
}

/**
 * "Continue with Google". Uses Google's own popup button (the consent screen
 * shows web.nirdeshona.com), then signs in without leaving the page. Falls back
 * to the Supabase redirect flow if the client ID or Google's script isn't available.
 */
export default function GoogleSignIn({
  clientId,
  mode = "signin",
  next = "/account",
  onSignedIn,
}: {
  clientId: string | null;
  mode?: "signin" | "signup";
  next?: string;
  onSignedIn: (info: { isNew: boolean }) => void;
}) {
  const { L, locale } = useI18n();
  const box = useRef<HTMLDivElement>(null);
  const nonceRef = useRef<{ raw: string; hashed: string } | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "fallback" | "working">(clientId ? "loading" : "fallback");
  const [error, setError] = useState<string | null>(null);

  const onCredential = useCallback(
    async (r: { credential?: string }) => {
      const nonce = nonceRef.current;
      if (!r.credential || !nonce) return;
      setError(null);
      setState("working");
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: r.credential, nonce: nonce.raw }),
      }).catch(() => null);
      const json = await res?.json().catch(() => ({}));
      if (res?.ok) {
        onSignedIn({ isNew: Boolean(json?.isNew) });
        return;
      }
      setError(L("Google sign-in didn't complete. Please try again.", "Google দিয়ে লগইন সম্পন্ন হয়নি। আবার চেষ্টা করুন।"));
      setState("ready");
      // A nonce works once; prepare a fresh button.
      setRetry((n) => n + 1);
    },
    [L, onSignedIn],
  );
  const [retry, setRetry] = useState(0);

  // Google draws a fixed-colour button, so redraw it when the site theme changes.
  const [dark, setDark] = useState(() => typeof document !== "undefined" && document.documentElement.classList.contains("dark"));
  useEffect(() => {
    const html = document.documentElement;
    const read = () => setDark(html.classList.contains("dark"));
    read();
    const mo = new MutationObserver(read);
    mo.observe(html, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);

  useEffect(() => {
    if (!clientId) return;
    if (!ALLOWED_HOSTS.includes(window.location.hostname)) {
      setState("fallback");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        // Slow or blocked network: don't leave a skeleton forever, use the redirect button.
        const timeout = new Promise<never>((_, reject) => window.setTimeout(() => reject(new Error("gsi-timeout")), 8000));
        const [gsi, nonce] = await Promise.race([Promise.all([loadGsi(), makeNonce()]), timeout]);
        if (cancelled || !box.current) return;
        nonceRef.current = nonce;
        gsi.initialize({
          client_id: clientId,
          callback: (r) => void onCredential(r),
          nonce: nonce.hashed,
          ux_mode: "popup",
          use_fedcm_for_button: true,
          itp_support: true,
          context: mode === "signup" ? "signup" : "signin",
        });
        box.current.innerHTML = "";
        const width = Math.min(400, Math.max(220, Math.floor(box.current.getBoundingClientRect().width)));
        gsi.renderButton(box.current, {
          type: "standard",
          theme: dark ? "filled_black" : "outline",
          size: "large",
          shape: "pill",
          text: mode === "signup" ? "signup_with" : "continue_with",
          logo_alignment: "center",
          width,
          locale: locale === "bn" ? "bn" : "en",
        });
        setState((s) => (s === "working" ? s : "ready"));
      } catch {
        if (!cancelled) setState("fallback");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [clientId, mode, onCredential, locale, retry, dark]);

  async function redirectFlow() {
    setState("working");
    const { error } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        queryParams: { prompt: "select_account" },
      },
    });
    if (error) {
      setError(L("Couldn't reach Google. Please try again.", "Google-এ যাওয়া যায়নি। আবার চেষ্টা করুন।"));
      setState("fallback");
    }
  }

  return (
    <div>
      {state === "fallback" ? (
        <button
          type="button"
          onClick={redirectFlow}
          className="flex h-11 w-full items-center justify-center gap-3 rounded-full border border-neutral-300 bg-white text-sm font-medium text-neutral-800 transition hover:bg-neutral-100"
        >
          <GoogleIcon />
          {mode === "signup" ? L("Sign up with Google", "Google দিয়ে অ্যাকাউন্ট খুলুন") : L("Continue with Google", "Google দিয়ে চালিয়ে যান")}
        </button>
      ) : (
        <div className="relative flex min-h-11 justify-center">
          {/* Google draws its button here. */}
          {/* color-scheme: light — Google's iframe is light-scheme; if its host is dark
              the browser paints an opaque white box behind the button. */}
          <div
            ref={box}
            style={{ colorScheme: "light" }}
            className={state === "working" ? "pointer-events-none flex w-full justify-center opacity-30" : "flex w-full justify-center"}
          />
          {state === "loading" && <div className="absolute inset-0 animate-pulse rounded-full border border-neutral-200 bg-neutral-100" aria-label={L("Loading", "লোড হচ্ছে")} />}
          {state === "working" && (
            <div className="absolute inset-0 flex items-center justify-center gap-2 text-sm font-semibold text-neutral-800">
              <Loader2 className="h-4 w-4 animate-spin" />
              {L("Signing you in…", "লগইন করা হচ্ছে…")}
            </div>
          )}
        </div>
      )}
      {error && <p className="mt-2 text-center text-xs text-red-600">{error}</p>}
    </div>
  );
}
