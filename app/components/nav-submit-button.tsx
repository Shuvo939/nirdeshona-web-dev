"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

/**
 * Submit button for GET forms (search boxes) that navigate to a new URL.
 * Shows a spinner until the new page has loaded.
 */
export default function NavSubmitButton({
  children,
  className = "",
  icon,
}: {
  children?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}) {
  const [loading, setLoading] = useState(false);
  const params = useSearchParams();
  const pathname = usePathname();

  useEffect(() => setLoading(false), [params, pathname]);
  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => setLoading(false), 10000);
    return () => clearTimeout(t);
  }, [loading]);

  return (
    <button
      type="submit"
      aria-busy={loading}
      onClick={(e) => {
        const form = e.currentTarget.form;
        if (!form || !form.checkValidity()) return;
        const target = new URL(form.action || window.location.href, window.location.href);
        target.search = new URLSearchParams(new FormData(form) as unknown as Record<string, string>).toString();
        if (target.pathname + target.search !== window.location.pathname + window.location.search) setLoading(true);
      }}
      className={className}
    >
      {loading ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" /> : icon}
      {children}
    </button>
  );
}
