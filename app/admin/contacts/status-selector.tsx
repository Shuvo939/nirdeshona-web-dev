"use client";

import { useTransition } from "react";

import { updateContactStatus } from "./actions";

const statuses = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "closed", label: "Closed" },
];

export function StatusSelector({
  id,
  currentStatus,
}: {
  id: string;
  currentStatus: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-3">
      <select
        defaultValue={currentStatus}
        disabled={isPending}
        onChange={(event) => {
          const nextStatus = event.target.value;

          startTransition(async () => {
            await updateContactStatus(id, nextStatus);
          });
        }}
        className="h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-800 outline-none transition focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {statuses.map((status) => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </select>

      {isPending && (
        <span className="text-xs text-neutral-400">Saving...</span>
      )}
    </div>
  );
}