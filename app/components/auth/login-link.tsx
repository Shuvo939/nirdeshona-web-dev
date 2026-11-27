"use client";

import type { MouseEvent, ReactNode } from "react";

import Link from "@/app/components/locale-link";
import { useLoginPrompt } from "@/app/components/auth/auth-context";
import { useI18n } from "@/lib/i18n/client";

/**
 * A "Log in" link that opens the login popup instead of leaving the page.
 * Still a real link to /login, so middle-click / new tab / no-JS keep working.
 * `goTo`: where to go after signing in (stays on this page when omitted).
 */
export default function LoginLink({
  goTo,
  reason,
  className,
  onClick,
  children,
}: {
  goTo?: string;
  reason?: string;
  className?: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  const openLogin = useLoginPrompt();
  const { lp } = useI18n();
  function handle(e: MouseEvent<HTMLAnchorElement>) {
    onClick?.();
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    openLogin({
      reason,
      next: goTo,
      onSuccess: goTo ? () => window.location.assign(lp(goTo)) : undefined,
    });
  }
  return (
    <Link href={goTo ? `/login?next=${encodeURIComponent(goTo)}` : "/login"} onClick={handle} className={className} prefetch={false} data-no-progress>
      {children}
    </Link>
  );
}
