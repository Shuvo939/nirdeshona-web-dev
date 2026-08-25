"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, X, Sparkles } from "lucide-react";

export default function ConstructionPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("construction-popup-dismissed");

    if (!dismissed) {
      setOpen(true);
    }
  }, []);

  function closePopup() {
    setOpen(false);
    localStorage.setItem("construction-popup-dismissed", "true");
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-950/45 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="construction-title"
        className="
          relative w-full max-w-md
          overflow-hidden
          rounded-3xl
          border border-neutral-200
          bg-white
          shadow-[0_25px_80px_rgba(0,0,0,0.18)]
        "
      >
        {/* Close */}
        <button
          type="button"
          onClick={closePopup}
          aria-label="Close"
          className="
            absolute right-4 top-4
            flex h-9 w-9 items-center justify-center
            rounded-full
            text-neutral-500
            transition
            hover:bg-neutral-100
            hover:text-neutral-950
          "
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-7 sm:p-8">
          {/* Icon */}
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-950 text-white">
            <Sparkles className="h-5 w-5" />
          </div>

          {/* Content */}
          <div className="pr-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
              Nirdeshona
            </p>

            <h2
              id="construction-title"
              className="text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl"
            >
              We’re building something better.
            </h2>

            <p className="mt-4 text-sm leading-6 text-neutral-600 sm:text-[15px]">
              Our website is currently under construction as we work on
              creating a better experience for you. We’ll be back soon.
            </p>
          </div>

          {/* Actions */}
          <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
            <button
              type="button"
              onClick={closePopup}
              className="
                inline-flex flex-1 items-center justify-center
                rounded-xl
                border border-neutral-200
                px-4 py-3
                text-sm font-medium text-neutral-700
                transition
                hover:bg-neutral-50
                hover:text-neutral-950
              "
            >
              Continue browsing
            </button>

            <Link
              href="/contact"
              onClick={closePopup}
              className="
                group inline-flex flex-1 items-center justify-center gap-1.5
                rounded-xl
                bg-neutral-950
                px-4 py-3
                text-sm font-medium text-white
                transition
                hover:bg-neutral-800
              "
            >
              Get in touch

              <ArrowUpRight
                className="
                  h-3.5 w-3.5
                  transition
                  group-hover:translate-x-0.5
                  group-hover:-translate-y-0.5
                "
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}