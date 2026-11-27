"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

import { useI18n } from "@/lib/i18n/client";

/** Share via the phone's share sheet, or copy the link on desktop. */
export default function PostShareButton({ title }: { title: string }) {
  const { L } = useI18n();
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href.split("#")[0];
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // The person closed the share sheet.
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      aria-label={L("Share this post", "পোস্টটি শেয়ার করুন")}
      className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950"
    >
      {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4" />}
      <span>{copied ? L("Link copied", "লিংক কপি হয়েছে") : L("Share", "শেয়ার")}</span>
    </button>
  );
}
