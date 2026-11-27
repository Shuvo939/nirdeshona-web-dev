"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

import LoginPanel from "@/app/components/auth/login-panel";
import Portal from "@/app/components/ui/portal";
import { useI18n } from "@/lib/i18n/client";
import { AuthContext, type LoginOptions } from "@/app/components/auth/auth-context";

export { useAuthConfig, useLoginPrompt } from "@/app/components/auth/auth-context";

export function AuthDialogProvider({ googleClientId, children }: { googleClientId: string | null; children: React.ReactNode }) {
  const [options, setOptions] = useState<LoginOptions | null>(null);
  const openLogin = useCallback((o?: LoginOptions) => setOptions(o ?? {}), []);
  const value = useMemo(() => ({ googleClientId, openLogin }), [googleClientId, openLogin]);
  return (
    <AuthContext.Provider value={value}>
      {children}
      {options && <LoginDialog options={options} onClose={() => setOptions(null)} />}
    </AuthContext.Provider>
  );
}

function LoginDialog({ options, onClose }: { options: LoginOptions; onClose: () => void }) {
  const { L } = useI18n();
  const pathname = usePathname();
  const next = options.next ?? (typeof window !== "undefined" ? window.location.pathname + window.location.search : pathname);

  // Escape closes; the page behind stays put.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  function signedIn() {
    // A real reload: the header, comments and reactions all start from the
    // signed-in state (several client components seed local state from props).
    // The browser keeps the scroll position, so the reader stays where they were.
    if (options.onSuccess) options.onSuccess();
    else window.location.reload();
  }

  return (
    <Portal>
    <div
      className="fixed inset-0 z-[130] flex items-end justify-center bg-scrim/50 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-dialog-title"
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl bg-white px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 shadow-2xl sm:max-w-[400px] sm:rounded-3xl sm:p-7"
      >
        {/* Grab handle on phones */}
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-neutral-200 sm:hidden" />
        <button
          type="button"
          onClick={onClose}
          aria-label={L("Close", "বন্ধ করুন")}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 sm:right-4 sm:top-4"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-5 pr-8">
          <h2 id="login-dialog-title" className="text-xl font-semibold tracking-tight text-neutral-950">
            {L("Log in to continue", "চালিয়ে যেতে লগ ইন করুন")}
          </h2>
          <p className="mt-1 text-sm leading-6 text-neutral-500">
            {options.reason ?? L("Use Google or your email — it takes a few seconds.", "Google বা ইমেইল দিয়ে — কয়েক সেকেন্ডেই হয়ে যাবে।")}
          </p>
        </div>

        <LoginPanel initialCaptcha={null} next={next} onSignedIn={signedIn} onNavigate={onClose} />
      </div>
    </div>
    </Portal>
  );
}
