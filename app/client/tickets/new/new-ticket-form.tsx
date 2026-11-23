"use client";

import { useActionState, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import { createTicket, type FormState } from "@/app/client/actions";

type Option = { id: string; name: string };
type ProjectOption = { id: string; title: string; client_id: string };

const PRIORITIES = [
  { value: "LOW", label: "Low", hint: "Question or minor tweak" },
  { value: "NORMAL", label: "Normal", hint: "Something isn't right" },
  { value: "HIGH", label: "High", hint: "Important feature broken" },
  { value: "URGENT", label: "Urgent", hint: "Site down or data at risk" },
];

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
  const [state, action, pending] = useActionState<FormState, FormData>(createTicket, {});
  const defaultProject = projects.find((p) => p.id === defaultProjectId);
  const [clientId, setClientId] = useState(defaultProject?.client_id ?? clients[0]?.id ?? "");
  const clientProjects = useMemo(() => projects.filter((p) => p.client_id === clientId), [projects, clientId]);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={action} className="flex flex-col gap-5">
      {state.error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Organisation" error={errors.clientId}>
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

        <Field label="Related project (optional)" error={errors.projectId}>
          <select name="projectId" defaultValue={defaultProject?.id ?? ""} key={clientId} className={`${inputClass} h-11`}>
            <option value="">General / not project-specific</option>
            {clientProjects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Subject" error={errors.subject}>
        <input name="subject" required maxLength={160} placeholder="e.g. Contact form not sending emails" className={`${inputClass} h-11`} />
      </Field>

      <fieldset>
        <legend className="mb-2 block text-sm font-medium text-neutral-800">Priority</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PRIORITIES.map((p) => (
            <label
              key={p.value}
              className="flex cursor-pointer flex-col rounded-xl border border-neutral-200 bg-white p-3 transition has-[:checked]:border-neutral-950 has-[:checked]:bg-neutral-50 has-[:checked]:ring-2 has-[:checked]:ring-neutral-950/10"
            >
              <input type="radio" name="priority" value={p.value} defaultChecked={p.value === "NORMAL"} className="sr-only" />
              <span className="text-sm font-semibold text-neutral-950">{p.label}</span>
              <span className="mt-0.5 text-xs text-neutral-500">{p.hint}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <Field label="Describe the issue" error={errors.message}>
        <textarea
          name="message"
          required
          rows={7}
          maxLength={5000}
          placeholder="What happened? Which page? What did you expect to happen? Include links if you can."
          className={`${inputClass} py-3 leading-6`}
        />
      </Field>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-neutral-500">We usually reply within one business day. Urgent issues are handled the same day.</p>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-neutral-950 px-6 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-60"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Submit ticket
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
