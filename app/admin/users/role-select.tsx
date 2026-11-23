"use client";

export default function RoleSelect({ action, value, disabled }: { action: (formData: FormData) => Promise<void>; value: string; disabled?: boolean }) {
  return (
    <form action={action}>
      <select
        name="role"
        defaultValue={value}
        disabled={disabled}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        aria-label="Role"
        className="h-8 rounded-lg border border-neutral-200 bg-white px-2 text-xs font-medium text-neutral-800 outline-none disabled:opacity-50"
      >
        <option value="USER">User</option>
        <option value="CLIENT">Client</option>
        <option value="ADMIN">Admin</option>
      </select>
    </form>
  );
}
