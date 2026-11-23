"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Loader2, Send } from "lucide-react";

import type { FormState } from "@/app/(account)/client/actions";

import AttachmentPicker from "./attachment-picker";

export default function ReplyForm({
  action,
  placeholder = "Write a reply…",
  disabled = false,
  disabledText,
  ticketId,
}: {
  ticketId?: string;
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  placeholder?: string;
  disabled?: boolean;
  disabledText?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const formRef = useRef<HTMLFormElement>(null);
  const [uploading, setUploading] = useState(false);
  const [pickerKey, setPickerKey] = useState(0);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      setPickerKey((k) => k + 1);
    }
  }, [state]);

  if (disabled) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-4 text-center text-sm text-neutral-500">
        {disabledText}
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm focus-within:border-neutral-400">
      <label htmlFor="reply-message" className="sr-only">
        Message
      </label>
      <textarea
        id="reply-message"
        name="message"
        rows={4}
        required
        maxLength={5000}
        placeholder={placeholder}
        onKeyDown={(event) => {
          if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
            event.currentTarget.form?.requestSubmit();
          }
        }}
        className="w-full resize-y rounded-xl bg-transparent px-2 py-1 text-sm leading-6 outline-none placeholder:text-neutral-400"
      />
      <div className="px-1">
        <AttachmentPicker key={pickerKey} ticketId={ticketId} onBusyChange={setUploading} />
      </div>
      <div className="mt-2 flex items-center justify-between gap-3 border-t border-neutral-100 pt-3">
        <p className="text-xs text-neutral-400">
          {state.error || state.fieldErrors?.message ? (
            <span className="text-red-600">{state.error || state.fieldErrors?.message}</span>
          ) : (
            <span className="hidden sm:inline">Ctrl + Enter to send</span>
          )}
        </p>
        <button
          type="submit"
          disabled={pending || uploading}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-neutral-950 px-5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-60"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Send
        </button>
      </div>
    </form>
  );
}
