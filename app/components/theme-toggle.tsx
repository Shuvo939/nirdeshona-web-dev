"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Monitor, Moon, Sun } from "lucide-react";

import { useI18n } from "@/lib/i18n/client";
import { THEME_COOKIE, type ThemeChoice } from "@/lib/theme";

function readChoice(): ThemeChoice {
  const v = document.documentElement.dataset.theme;
  return v === "light" || v === "dark" ? v : "system";
}

function apply(choice: ThemeChoice) {
  const dark = choice === "dark" || (choice === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  root.dataset.theme = choice;
  document.cookie = `${THEME_COOKIE}=${choice}; path=/; max-age=31536000; samesite=lax`;
}

/** Keeps "system" in sync when the device switches between light and dark. */
function useSystemSync(choice: ThemeChoice) {
  useEffect(() => {
    if (choice !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const on = () => document.documentElement.classList.toggle("dark", mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [choice]);
}

function useTheme() {
  const [choice, setChoice] = useState<ThemeChoice>("system");
  useEffect(() => setChoice(readChoice()), []);
  useSystemSync(choice);
  return {
    choice,
    set: (next: ThemeChoice) => {
      apply(next);
      setChoice(next);
    },
  };
}

const OPTIONS: { id: ThemeChoice; icon: typeof Sun; en: string; bn: string }[] = [
  { id: "light", icon: Sun, en: "Light", bn: "লাইট" },
  { id: "dark", icon: Moon, en: "Dark", bn: "ডার্ক" },
  { id: "system", icon: Monitor, en: "System", bn: "ডিভাইস অনুযায়ী" },
];

/** Header button with a small menu: Light, Dark, System. */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { L } = useI18n();
  const { choice, set } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={L("Theme", "থিম")}
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-xl text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950"
      >
        <Sun className="h-[18px] w-[18px] dark:hidden" />
        <Moon className="hidden h-[18px] w-[18px] dark:block" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-1.5 shadow-[0_18px_50px_rgba(0,0,0,0.14)]">
          {OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              role="menuitemradio"
              aria-checked={choice === o.id}
              onClick={() => {
                set(o.id);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-950"
            >
              <o.icon className="h-4 w-4 text-neutral-500" />
              <span className="flex-1">{L(o.en, o.bn)}</span>
              {choice === o.id && <Check className="h-4 w-4 text-neutral-950" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Three-way switch for the mobile menu and the footer. */
export function ThemeSwitch({ dark = false }: { dark?: boolean }) {
  const { L } = useI18n();
  const { choice, set } = useTheme();
  return (
    <div
      role="radiogroup"
      aria-label={L("Theme", "থিম")}
      className={`inline-flex items-center gap-1 rounded-xl border p-1 text-sm ${dark ? "border-white/10 bg-white/5" : "border-neutral-200 bg-white"}`}
    >
      {OPTIONS.map((o) => {
        const active = choice === o.id;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={L(o.en, o.bn)}
            title={L(o.en, o.bn)}
            onClick={() => set(o.id)}
            className={`flex h-8 items-center gap-1.5 rounded-lg px-2.5 font-medium transition ${
              active
                ? dark
                  ? "bg-white text-neutral-950"
                  : "bg-neutral-950 text-white"
                : dark
                  ? "text-neutral-400 hover:text-white"
                  : "text-neutral-500 hover:text-neutral-950"
            }`}
          >
            <o.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{L(o.en, o.bn)}</span>
          </button>
        );
      })}
    </div>
  );
}
