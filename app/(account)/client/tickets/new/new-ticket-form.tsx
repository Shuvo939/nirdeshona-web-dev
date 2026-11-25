"use client";

import { useActionState, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import { createTicket, type FormState } from "@/app/(account)/client/actions";
import AttachmentPicker from "@/app/components/tickets/attachment-picker";
import { useI18n } from "@/lib/i18n/client";

type Option = { id: string; name: string };
type ProjectOption = { id: string; title: string; client_id: string };

const PRIORITIES = [
  { value: "LOW", label: ["Low", "কম"], hint: ["Question or minor tweak", "প্রশ্ন বা ছোট পরিবর্তন"] },
  { value: "NORMAL", label: ["Normal", "সাধারণ"], hint: ["Something isn't right", "কিছু একটা ঠিক নেই"] },
  { value: "HIGH", label: ["High", "বেশি"], hint: ["Important feature broken", "গুরুত্বপূর্ণ ফিচার কাজ করছে না"] },
  { value: "URGENT", label: ["Urgent", "জরুরি"], hint: ["Site down or data at risk", "সাইট বন্ধ বা ডেটা ঝুঁকিতে"] },
] as const;

const inputClass =
  "w-full rounded-xl border border-neutral-200 bg-white px-3.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10";

export default function NewTicketForm({
  clients,
  projects,
  defaultProjectId,
}: {
  clients: Option[];
  projects: ProjectOption[];
  defaultProjectId?: string;
}) {
  const { L, tm, tfe } = useI18n();
  const [state, action, pending] = useActionState<FormState, FormData>(createTicket, {});
  const defaultProject = projects.find((p) => p.id === defaultProjectId);
  const [clientId, setClientId] = useState(defaultProject?.client_id ?? clients[0]?.id ?? "");
  const clientProjects = useMemo(() => projects.filter((p) => p.client_id === clientId), [projects, clientId]);
  const errors = tfe(state.fieldErrors) ?? {};
  const [uploading, setUploading] = useState(false);

  return (
    <form action={action} className="flex flex-col gap-5">
      {state.error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{tm(state.error)}</p>}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label={L("Organisation", "প্রতিষ্ঠান")} error={errors.clientId}>
          <select
            name="clientId"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className={`${inputClass} h-11`}
            disabled={clients.length === 1}
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {clients.length === 1 && <input type="hidden" name="clientId" value={clientId} />}
        </Field>

        <Field label={L("Related project (optional)", "সংশ্লিষ্ট প্রজেক্ট (ঐচ্ছিক)")} error={errors.projectId}>
          <select name="projectId" defaultValue={defaultProject?.id ?? ""} key={clientId} className={`${inputClass} h-11`}>
            <option value="">{L("General / not project-specific", "সাধারণ / নির্দিষ্ট প্রজেক্ট নয়")}</option>
            {clientProjects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label={L("Subject", "বিষয়")} error={errors.subject}>
        <input name="subject" required maxLength={160} placeholder={L("e.g. Contact form not sending emails", "যেমন: কন্টাক্ট ফর্ম থেকে ইমেইল যাচ্ছে না")} className={`${inputClass} h-11`} />
      </Field>

      <fieldset>
        <legend className="mb-2 block text-sm font-medium text-neutral-800">{L("Priority", "অগ্রাধিকার")}</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PRIORITIES.map((p) => (
            <label
              key={p.value}
              className="flex cursor-pointer flex-col rounded-xl border border-neutral-200 bg-white p-3 transition has-[:checked]:border-neutral-950 has-[:checked]:bg-neutral-50 has-[:checked]:ring-2 has-[:checked]:ring-neutral-950/10"
            >
              <input type="radio" name="priority" value={p.value} defaultChecked={p.value === "NORMAL"} className="sr-only" />
              <span className="text-sm font-semibold text-neutral-950">{L(p.label[0], p.label[1])}</span>
              <span className="mt-0.5 text-xs text-neutral-500">{L(p.hint[0], p.hint[1])}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <Field label={L("Describe the issue", "সমস্যাটি লিখুন")} error={errors.message}>
        <textarea
          name="message"
          required
          rows={7}
          maxLength={5000}
          placeholder={L("What happened? Which page? What did you expect to happen? Include links if you can.", "কী হয়েছে? কোন পেজে? কী হওয়ার কথা ছিল? সম্ভব হলে লিংক দিন।")}
          className={`${inputClass} py-3 leading-6`}
        />
      </Field>

      <div className="rounded-xl border border-dashed border-neutral-200 p-3">
        <p className="mb-1 text-xs text-neutral-500">{L("Screenshots or documents help us fix things faster (up to 5 files, 10 MB each).", "স্ক্রিনশট বা ডকুমেন্ট দিলে দ্রুত সমাধান করতে পারি (সর্বোচ্চ ৫টি ফাইল, প্রতিটি ১০ MB)।")}</p>
        <AttachmentPicker onBusyChange={setUploading} />
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-neutral-500">{L("We usually reply within one business day. Urgent issues are handled the same day.", "সাধারণত এক কর্মদিবসের মধ্যে উত্তর দিই। জরুরি সমস্যা একই দিনে দেখা হয়।")}</p>
        <button
          type="submit"
          disabled={pending || uploading}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-neutral-950 px-6 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-60"
        >
          {(pending || uploading) && <Loader2 className="h-4 w-4 animate-spin" />}
          {uploading ? L("Uploading files…", "ফাইল আপলোড হচ্ছে…") : pending ? L("Submitting…", "জমা হচ্ছে…") : L("Submit ticket", "টিকেট জমা দিন")}
        </button>
      </div>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-neutral-800">{label}</span>
        {children}
      </label>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
