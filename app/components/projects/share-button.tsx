"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

import { useI18n } from "@/lib/i18n/client";

export default function ShareButton({ title, className = "", labelClassName = "" }: { title: string; className?: string; labelClassName?: string }) {
  const { L } = useI18n();
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ url, title });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* user cancelled */
    }
  }

  return (
    <button type="button" onClick={share} className={className} aria-label={L("Share", "শেয়ার")}>
      {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
      <span className={labelClassName}>{copied ? L("Link copied", "লিংক কপি হয়েছে") : L("Share", "শেয়ার")}</span>
    </button>
  );
}
