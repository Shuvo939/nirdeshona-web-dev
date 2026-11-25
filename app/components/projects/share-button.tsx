"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

import { useI18n } from "@/lib/i18n/client";

export default function ShareButton({ title, className = "" }: { title: string; className?: string }) {
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
    <button type="button" onClick={share} className={className}>
      {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
      {copied ? L("Link copied", "লিংক কপি হয়েছে") : L("Share", "শেয়ার")}
    </button>
  );
}
