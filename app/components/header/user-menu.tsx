"use client";

import { useI18n } from "@/lib/i18n/client";

import SubmitButton from "@/app/components/submit-button";
import Link from "@/app/components/locale-link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  ChevronDown,
  CircleHelp,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";

type Props = {
  user: {
    email: string;
    fullName: string | null;
    role: string;
    avatarUrl: string | null;
  };
  signOut: () => Promise<void>;
};

export default function UserMenu({
  user,
  signOut,
}: Props) {
  const [open, setOpen] = useState(false);
  const { L } = useI18n();
  const menuRef = useRef<HTMLDivElement>(null);

  const displayName =
    user.fullName?.trim() ||
    user.email.split("@")[0] ||
    "User";

  const initials =
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  const roleLabel =
    user.role === "ADMIN"
      ? L("Administrator", "অ্যাডমিনিস্ট্রেটর")
      : user.role === "CLIENT"
        ? L("Client", "ক্লায়েন্ট")
        : L("Account", "অ্যাকাউন্ট");

  useEffect(() => {
    function handleOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutside);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
    };
  }, []);

  return (
    <div
      ref={menuRef}
      className="relative"
    >
      {/* =====================================================
          TRIGGER
      ====================================================== */}
    <button
    type="button"
    onClick={() => setOpen((value) => !value)}
    aria-expanded={open}
    aria-haspopup="menu"
    aria-label={`Open account menu for ${displayName}`}
    className="
        group flex items-center gap-2 rounded-xl
        border border-neutral-200 bg-white p-1
        shadow-sm transition
        hover:border-neutral-300 hover:bg-neutral-50
        active:scale-95
    "
    >
    {user.avatarUrl ? (
        <img
        src={user.avatarUrl}
        alt={displayName}
        className="h-9 w-9 rounded-lg object-cover"
        />
    ) : (
        <div
        className="
            flex h-9 w-9 items-center justify-center
            rounded-lg bg-neutral-950
            text-xs font-bold text-white
        "
        >
        {initials}
        </div>
    )}

    {/* Name — desktop/tablet only */}
    <div className="hidden max-w-[125px] text-left md:block">
        <p className="truncate text-xs font-semibold text-neutral-900">
        {displayName}
        </p>

        <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
        {roleLabel}
        </p>
    </div>

    {/* Chevron — desktop/tablet only */}
    <ChevronDown
        className={`
        hidden h-3.5 w-3.5 text-neutral-400
        transition-transform md:block
        ${open ? "rotate-180" : ""}
        `}
    />
    </button>

      {/* =====================================================
          DROPDOWN
      ====================================================== */}
      {open && (
        <div
          role="menu"
          className="
            absolute right-0 top-full z-[100]
            mt-2.5 sm:mt-3 lg:mt-3 w-[300px] overflow-hidden
            rounded-bl-2xl rounded-br-2xl border border-neutral-200
            bg-white p-2 shadow-2xl shadow-black/10
          "
        >
          {/* Profile summary */}
          <div className="rounded-xl bg-neutral-50 p-3">
            <div className="flex items-center gap-3">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={displayName}
                  className="h-11 w-11 rounded-xl object-cover"
                />
              ) : (
                <div
                  className="
                    flex h-11 w-11 items-center justify-center
                    rounded-xl bg-black text-sm font-bold text-white
                  "
                >
                  {initials}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-neutral-950">
                  {displayName}
                </p>

                <p className="mt-0.5 truncate text-xs text-neutral-500">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-neutral-500 ring-1 ring-neutral-200">
                {roleLabel}
              </span>

              <Link
                href="/account"
                onClick={() => setOpen(false)}
                className="
                  flex items-center gap-1 text-[11px]
                  font-medium text-neutral-500
                  hover:text-neutral-950
                "
              >
                {L("My account", "আমার অ্যাকাউন্ট")}
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Navigation */}
          <div className="py-2">
            <MenuItem
              href="/account"
              icon={<LayoutDashboard className="h-4 w-4" />}
              label={L("My account", "আমার অ্যাকাউন্ট")}
              description={L("Overview and activity", "সারসংক্ষেপ ও কার্যক্রম")}
              onClick={() => setOpen(false)}
            />

            {user.role !== "USER" && (
              <MenuItem
                href="/client"
                icon={<FolderKanban className="h-4 w-4" />}
                label={L("Client portal", "ক্লায়েন্ট পোর্টাল")}
                description={L("Projects and support tickets", "প্রজেক্ট ও সাপোর্ট টিকেট")}
                onClick={() => setOpen(false)}
              />
            )}

            {user.role === "ADMIN" && (
              <MenuItem
                href="/admin"
                icon={<ShieldCheck className="h-4 w-4" />}
                label={L("Admin Panel", "অ্যাডমিন প্যানেল")}
                description={L("Manage Nirdeshona", "নির্দেশনা পরিচালনা")}
                onClick={() => setOpen(false)}
              />
            )}

            <MenuItem
              href="/profile"
              icon={<UserRound className="h-4 w-4" />}
              label={L("Profile", "প্রোফাইল")}
              description={L("Personal information", "ব্যক্তিগত তথ্য")}
              onClick={() => setOpen(false)}
            />

            <MenuItem
              href="/settings"
              icon={<Settings className="h-4 w-4" />}
              label={L("Settings", "সেটিংস")}
              description={L("Account preferences", "অ্যাকাউন্টের পছন্দ")}
              onClick={() => setOpen(false)}
            />

            <MenuItem
              href="/contact"
              icon={<CircleHelp className="h-4 w-4" />}
              label={L("Support", "সাপোর্ট")}
              description={L("Get help or contact us", "সাহায্য নিন বা যোগাযোগ করুন")}
              onClick={() => setOpen(false)}
            />
          </div>

          {/* Logout */}
          <div className="border-t border-neutral-100 pt-2">
            <form action={signOut}>
              <SubmitButton
                icon={<LogOut className="h-4 w-4" />}
                pendingText={<span className="flex-1">{L("Logging out…", "লগ আউট হচ্ছে…")}</span>}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-70"
              >
                <span className="flex-1">{L("Log out", "লগআউট")}</span>
                <span className="text-[10px] text-red-300">{L("Sign out", "সাইন আউট")}</span>
              </SubmitButton>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuItem({
  href,
  icon,
  label,
  description,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="
        group flex items-center gap-3 rounded-xl
        px-3 py-2.5 transition
        hover:bg-neutral-50
      "
    >
      <div
        className="
          flex h-9 w-9 shrink-0 items-center justify-center
          rounded-lg bg-neutral-100 text-neutral-500
          transition group-hover:bg-white
          group-hover:text-neutral-900
          group-hover:shadow-sm
        "
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-neutral-800">
          {label}
        </p>

        <p className="mt-0.5 text-[10px] text-neutral-400">
          {description}
        </p>
      </div>

      <ArrowUpRight className="h-3.5 w-3.5 text-neutral-300 transition group-hover:text-neutral-700" />
    </Link>
  );
}