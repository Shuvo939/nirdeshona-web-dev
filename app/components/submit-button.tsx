"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

/**
 * Submit button for forms that use a server action (`<form action={fn}>`).
 * Shows a spinner, disables itself and announces "busy" while the form is
 * being submitted. `icon` is replaced by the spinner; `pendingText` (optional)
 * replaces the label.
 */
export default function SubmitButton({
  children,
  className = "",
  icon,
  pendingText,
  disabled,
  title,
  ...rest
}: {
  children?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  pendingText?: React.ReactNode;
  disabled?: boolean;
  title?: string;
  "aria-label"?: string;
  name?: string;
  value?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending || disabled} aria-busy={pending} title={title} className={className} {...rest}>
      {pending ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" /> : icon}
      {pending && pendingText ? pendingText : children}
    </button>
  );
}
