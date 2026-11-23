"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

// Controlled confirmation dialog (never window.confirm).
export default function ConfirmDialog({
  title,
  description,
  confirmLabel = "Confirm",
  danger = true,
  onConfirm,
  onCancel,
}: {
  title: string;
  description: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-neutral-950/40 p-4 backdrop-blur-sm" onClick={onCancel}>
      <div role="alertdialog" aria-modal="true" className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${danger ? "bg-red-50 text-red-600" : "bg-neutral-100 text-neutral-700"}`}>
          <AlertTriangle className="h-5 w-5" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-neutral-950">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-neutral-600">{description}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="h-10 rounded-xl border border-neutral-200 px-4 text-sm font-medium hover:bg-neutral-50">
            Cancel
          </button>
          <button
            type="button"
            autoFocus
            onClick={onConfirm}
            className={`h-10 rounded-xl px-4 text-sm font-semibold text-white ${danger ? "bg-red-600 hover:bg-red-700" : "bg-neutral-950 hover:bg-neutral-800"}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
