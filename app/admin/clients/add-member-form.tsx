"use client";

import { useActionState, useEffect, useRef } from "react";
import { Loader2, UserPlus } from "lucide-react";

import type { FormState } from "@/app/(account)/client/actions";

export default function AddMemberForm({ action }: { action: (prev: FormState, formData: FormData) => Promise<FormState> }) {
  const [state, formAction, pending] = useActionState(action, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={formAction} className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          name="email"
          type="email"
          required
          placeholder="user@example.com"
          className="h-10 flex-1 rounded-xl border border-neutral-200 px-3.5 text-sm outline-none focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10"
        />
        <button type="submit" disabled={pending} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-neutral-950 px-4 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-60">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
          Add user
        </button>
      </div>
      {(state.error || state.fieldErrors?.email) && <p className="text-xs text-red-600">{state.error || state.fieldErrors?.email}</p>}
      {state.ok && <p className="text-xs text-emerald-700">User linked and notified.</p>}
    </form>
  );
}
