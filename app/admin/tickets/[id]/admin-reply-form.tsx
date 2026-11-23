"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Loader2, Send } from "lucide-react";

import type { FormState } from "@/app/client/actions";
import AttachmentPicker from "@/app/components/tickets/attachment-picker";

export default function AdminReplyForm({
  action,
  ticketId,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  ticketId: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const ref = useRef<HTMLFormElement>(null);
  const [uploading, setUploading] = useState(false);
  const [pickerKey, setPickerKey] = useState(0);
  useEffect(() => {
    if (state.ok) {
      ref.current?.reset();
      setPickerKey((k) => k + 1);
    }
  }, [state]);

  return (
    <form ref={ref} action={formAction} className="rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm">
      <textarea
        name="message"
        rows={5}
        required
        maxLength={5000}
        placeholder="Reply to the client…"
        className="w-full resize-y bg-transparent px-2 py-1 text-sm leading-6 outline-none"
      />
      <div className="px-1">
        <AttachmentPicker key={pickerKey} ticketId={ticketId} onBusyChange={setUploading} />
      </div>
      <div className="mt-2 flex flex-col gap-3 border-t border-neutral-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 text-xs text-neutral-500">
          After sending, set status to
          <select name="nextStatus" defaultValue="WAITING_FOR_CLIENT" className="h-8 rounded-lg border border-neutral-200 bg-white px-2 text-xs">
            <option value="WAITING_FOR_CLIENT">Awaiting client</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </label>
        <div className="flex items-center gap-3">
          {(state.error || state.fieldErrors?.message) && <span className="text-xs text-red-600">{state.error || state.fieldErrors?.message}</span>}
          <button type="submit" disabled={pending || uploading} className="inline-flex h-10 items-center gap-2 rounded-xl bg-neutral-950 px-5 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-60">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send reply
          </button>
        </div>
      </div>
    </form>
  );
}
