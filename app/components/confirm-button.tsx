"use client";

import { useEffect, useState, useTransition } from "react";
import { AlertTriangle, Loader2, LogOut } from "lucide-react";

import { useI18n } from "@/lib/i18n/client";
import Portal from "@/app/components/ui/portal";

// A button that asks for confirmation in a custom dialog
// (never window.confirm) before running a server action.
export default function ConfirmButton({
  action,
  title,
  description,
  confirmLabel,
  pendingLabel,
  tone = "danger",
  icon = "alert",
  className,
  children,
}: {
  action: () => Promise<void>;
  title: string;
  description: string;
  confirmLabel?: string;
  pendingLabel?: string;
  tone?: "danger" | "neutral";
  icon?: "alert" | "logout";
  className?: string;
  children: React.ReactNode;
}) {
  const { L } = useI18n();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !pending && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, pending]);

  const Icon = icon === "logout" ? LogOut : AlertTriangle;

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      {open && (
        <Portal>
        <div
          className="fixed inset-0 z-[120] flex items-end justify-center bg-scrim/45 p-4 backdrop-blur-sm sm:items-center"
          onClick={() => !pending && setOpen(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            className="w-full max-w-sm rounded-3xl bg-white p-6 text-left shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                tone === "danger" ? "bg-red-50 text-red-600" : "bg-neutral-100 text-neutral-700"
              }`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <h2 id="confirm-title" className="mt-4 text-lg font-semibold text-neutral-950">
              {title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">{description}</p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                autoFocus
                disabled={pending}
                onClick={() => setOpen(false)}
                className="h-10 rounded-xl border border-neutral-200 px-4 text-sm font-medium text-neutral-800 hover:bg-neutral-50 disabled:opacity-60"
              >
                {L("Cancel", "বাতিল")}
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    await action();
                    setOpen(false);
                  })
                }
                className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white disabled:opacity-60 ${
                  tone === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-neutral-950 hover:bg-neutral-800"
                }`}
              >
                {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                {pending && pendingLabel ? pendingLabel : (confirmLabel ?? L("Delete", "মুছুন"))}
              </button>
            </div>
          </div>
        </div>
        </Portal>
      )}
    </>
  );
}
