"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AlertTriangle, Loader2, RotateCcw, Trash2 } from "lucide-react";

import type { BinResult } from "./actions";

export function BinRowActions({ id, label, restore, purge }: { id: string; label: string; restore: (id: string) => Promise<BinResult>; purge: (id: string) => Promise<BinResult> }) {
  const [pending, start] = useTransition();
  const [which, setWhich] = useState<"restore" | "purge" | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const run = (kind: "restore" | "purge") => {
    setWhich(kind);
    start(async () => {
      const res = await (kind === "restore" ? restore(id) : purge(id));
      if (res.ok) {
        // The row leaves the list; show what happened at the top of the page.
        router.replace(`/admin/bin?notice=${encodeURIComponent(kind === "restore" ? `Restored “${label}”. ${res.message !== "Restored." ? res.message : ""}` : `Deleted “${label}” forever.`)}`, { scroll: false });
      } else setMessage(res.message ?? "Something went wrong.");
      setConfirming(false);
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => run("restore")}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-800 hover:bg-neutral-50 disabled:opacity-60"
        >
          {pending && which === "restore" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
          Restore
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => setConfirming(true)}
          aria-label={`Delete “${label}” forever`}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
        >
          {pending && which === "purge" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          <span className="hidden sm:inline">Delete forever</span>
        </button>
      </div>
      {message && <p className="max-w-xs text-right text-[11px] text-amber-700">{message}</p>}
      {confirming && (
        <ConfirmDialog
          title="Delete forever?"
          text={`“${label}” and its files will be removed permanently. This can't be undone.`}
          confirmLabel="Delete forever"
          pending={pending}
          onCancel={() => setConfirming(false)}
          onConfirm={() => run("purge")}
        />
      )}
    </div>
  );
}

export function EmptyBinButton({ count, action }: { count: number; action: () => Promise<BinResult> }) {
  const [pending, start] = useTransition();
  const [confirming, setConfirming] = useState(false);
  if (count === 0) return null;
  return (
    <>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-700 hover:bg-red-100"
      >
        <Trash2 className="h-4 w-4" /> Empty bin
      </button>
      {confirming && (
        <ConfirmDialog
          title="Empty the bin?"
          text={`All ${count} item${count === 1 ? "" : "s"} and their files will be deleted forever. This can't be undone.`}
          confirmLabel="Empty bin"
          pending={pending}
          onCancel={() => setConfirming(false)}
          onConfirm={() =>
            start(async () => {
              await action();
              setConfirming(false);
            })
          }
        />
      )}
    </>
  );
}

function ConfirmDialog({ title, text, confirmLabel, pending, onCancel, onConfirm }: { title: string; text: string; confirmLabel: string; pending: boolean; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-scrim/45 p-4 backdrop-blur-sm" onClick={() => !pending && onCancel()}>
      <div role="alertdialog" aria-modal="true" className="w-full max-w-sm rounded-3xl bg-white p-6 text-left shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-neutral-950">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-neutral-600">{text}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" disabled={pending} onClick={onCancel} className="h-10 rounded-xl border border-neutral-200 px-4 text-sm font-medium hover:bg-neutral-50">
            Cancel
          </button>
          <button type="button" disabled={pending} onClick={onConfirm} className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
