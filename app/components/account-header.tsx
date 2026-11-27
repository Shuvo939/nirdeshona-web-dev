import type { ReactNode } from "react";

import Breadcrumbs from "@/app/components/breadcrumbs";
import { getI18n } from "@/lib/i18n/server";

// Page title block for pages inside the account area (sidebar layout).
export default async function AccountHeader({
  title,
  description,
  crumbs = [],
  actions,
}: {
  title: string;
  description?: string;
  crumbs?: { label: string; href?: string }[];
  actions?: ReactNode;
}) {
  const { L } = await getI18n();
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <Breadcrumbs items={[{ label: L("Account", "অ্যাকাউন্ট"), href: "/account" }, ...crumbs]} />
        <h1 className="mt-3 break-words text-2xl font-bold tracking-[-0.03em] text-neutral-950 sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-neutral-600">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
  );
}
