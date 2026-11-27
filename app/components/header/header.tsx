import { Suspense } from "react";
import Link from "@/app/components/locale-link";
import { redirect } from "next/navigation";
import { ArrowUpRight, Sparkles } from "lucide-react";

import { LanguageSwitcher } from "@/app/components/language-switcher";
import { getSessionUser } from "@/lib/auth/session";
import { sql } from "@/lib/db";
import { localizePath } from "@/lib/i18n/config";
import { getI18n, getLocale } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

import DesktopNav from "./desktop-nav";
import MobileNav from "./mobile-nav";
import SearchTrigger from "./search-trigger";
import NotificationBell from "./notification-bell";
import UserMenu from "./user-menu";

async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  // Server actions can't close over render values, so the locale is read here.
  redirect(localizePath(await getLocale(), "/login"));
}

/** Account-dependent parts stream in after auth; the rest of the header renders at once. */
async function MobileNavSlot() {
  const user = await getSessionUser();
  return <MobileNav authenticated={Boolean(user)} role={user?.role ?? null} />;
}

async function DesktopNavSlot() {
  const user = await getSessionUser();
  return <DesktopNav role={user?.role ?? null} />;
}

function AccountPlaceholder() {
  return (
    <div className="flex items-center gap-1.5 sm:gap-3" aria-hidden>
      <span className="h-10 w-10 animate-pulse rounded-xl bg-neutral-100 sm:w-24" />
    </div>
  );
}

async function AccountSlot() {
  const { L } = await getI18n();
  const user = await getSessionUser();
  if (user) {
    const unreadCount = await sql`
      select count(*)::int as unread from notifications where user_id = ${user.id} and read_at is null
    `
      .then(([row]) => (row?.unread as number) ?? 0)
      .catch(() => 0);
    return (
      <>
        <NotificationBell initialUnread={unreadCount} />
        <UserMenu user={{ email: user.email, fullName: user.fullName, role: user.role, avatarUrl: user.avatarUrl }} signOut={signOut} />
      </>
    );
  }
  return (
    <>
      <div className="hidden items-center gap-1.5 sm:flex">
        <Link href="/login" className="rounded-xl px-3.5 py-2.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950">
          {L("Log in", "লগইন")}
        </Link>
        <Link
          href="/register"
          className="group inline-flex items-center gap-1.5 rounded-xl bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-lg"
        >
          {L("Get started", "শুরু করুন")}
          <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </div>
      <div className="sm:hidden">
        <Link href="/login" className="rounded-xl px-2.5 py-2 text-xs font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950">
          {L("Log in", "লগইন")}
        </Link>
      </div>
    </>
  );
}

export default async function Header() {
  const { L } = await getI18n();

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200/70 bg-white/85 backdrop-blur-2xl">
      {/* Top accent */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[65px] items-center justify-between gap-3 lg:h-[68px] lg:gap-6">

          {/* =====================================================
              LEFT SIDE
              Mobile: Brand + Nav Toggle
              Desktop: Brand only
          ====================================================== */}
          <div className="flex min-w-0 shrink-0 items-center gap-2.5">

            {/* BRAND */}
            <Link
              href="/"
              className="group flex shrink-0 items-center gap-3"
            >
              <div className="relative">
                <div
                  className="
                    flex h-10 w-10 items-center justify-center
                    rounded-[13px] bg-neutral-950
                    text-sm font-bold text-white
                    shadow-[0_6px_20px_rgba(0,0,0,0.12)]
                    transition duration-300
                    group-hover:-translate-y-0.5
                    group-hover:shadow-[0_10px_28px_rgba(0,0,0,0.18)]
                  "
                >
                  N
                </div>

                <span
                  className="
                    absolute -right-1 -top-1
                    flex h-3 w-3 items-center justify-center
                    rounded-full border-2 border-white bg-neutral-950
                  "
                >
                  <span className="h-1 w-1 rounded-full bg-white" />
                </span>
              </div>

              <div className="hidden sm:block">
                <div className="text-[15px] font-bold leading-none tracking-[-0.02em] text-neutral-950">
                  {L("Nirdeshona", "নির্দেশনা")}
                </div>

                <div className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
                  {L("Web Development", "ওয়েব ডেভেলপমেন্ট")}
                </div>
              </div>
            </Link>

            {/* MOBILE NAV TOGGLE */}
            <div className="lg:hidden">
              <Suspense fallback={<MobileNav authenticated={false} role={null} />}>
                <MobileNavSlot />
              </Suspense>
            </div>
          </div>

          {/* =====================================================
              DESKTOP NAVIGATION
          ====================================================== */}
          <div className="hidden flex-1 justify-center lg:flex">
            <Suspense fallback={<DesktopNav role={null} />}>
              <DesktopNavSlot />
            </Suspense>
          </div>

          {/* =====================================================
              RIGHT SIDE
              Mobile: Search + Avatar
              Desktop: Search/Auth/User
          ====================================================== */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">

            {/* MOBILE SEARCH */}
            <div>
              <SearchTrigger />
            </div>

            <LanguageSwitcher />

            <Suspense fallback={<AccountPlaceholder />}>
              <AccountSlot />
            </Suspense>
          </div>
        </div>
      </div>

      {/* =======================================================
          SMALL SCREEN BRANDING STRIP
      ======================================================== */}
      <div className="hidden border-t border-neutral-100 bg-neutral-50/70 sm:block lg:hidden">
        <div className="mx-auto flex h-8 max-w-7xl items-center justify-center px-4">
          <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.16em] text-neutral-400">
            <Sparkles className="h-3 w-3" />
            {L("Digital solutions that move ideas forward", "ভাবনাকে এগিয়ে নেওয়ার ডিজিটাল সমাধান")}
          </div>
        </div>
      </div>
    </header>
  );
}