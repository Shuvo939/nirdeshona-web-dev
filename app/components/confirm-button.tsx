"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

// A submit button that asks for confirmation in a custom dialog
// (never window.confirm) before running a server action.
export default function ConfirmButton({
  action,
  title,
  description,
  confirmLabel = "Delete",
  className,
  children,
}: {
  action: () => Promise<void>;
  title: string;
  description: string;
  confirmLabel?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      {open && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-neutral-950/40 p-4 backdrop-blur-sm" onClick={() => !pending && setOpen(false)}>
          <div role="alertdialog" aria-modal="true" className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-neutral-950">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">{description}</p>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" disabled={pending} onClick={() => setOpen(false)} className="h-10 rounded-xl border border-neutral-200 px-4 text-sm font-medium hover:bg-neutral-50">
                Cancel
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => start(async () => {
                  await action();
                  setOpen(false);
                })}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
