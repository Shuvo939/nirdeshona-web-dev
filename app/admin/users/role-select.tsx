"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

export default function RoleSelect({ action, value, disabled }: { action: (formData: FormData) => Promise<void>; value: string; disabled?: boolean }) {
  return (
    <form action={action} className="flex items-center gap-1.5">
      <RoleField value={value} disabled={disabled} />
    </form>
  );
}

function RoleField({ value, disabled }: { value: string; disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <>
      <select
        name="role"
        defaultValue={value}
        disabled={disabled || pending}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        aria-label="Role"
        aria-busy={pending}
        className="h-8 rounded-lg border border-neutral-200 bg-white px-2 text-xs font-medium text-neutral-800 outline-none disabled:opacity-50"
      >
        <option value="USER">User</option>
        <option value="CLIENT">Client</option>
        <option value="ADMIN">Admin</option>
      </select>
      {pending && <Loader2 className="h-3.5 w-3.5 animate-spin text-neutral-400" aria-label="Saving" />}
    </>
  );
}
