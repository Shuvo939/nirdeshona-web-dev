"use client";

import { useI18n } from "@/lib/i18n/client";

import { ArrowLeft } from "lucide-react";

export default function NotFoundActions() {
  const { L } = useI18n();
  function handleBack() {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    window.location.href = "/";
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-6 text-sm font-semibold text-neutral-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-950 sm:w-auto"
    >
      <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />

      {L("Go back", "পেছনে যান")}
    </button>
  );
}