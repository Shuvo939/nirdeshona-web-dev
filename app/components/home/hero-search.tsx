"use client";

import { useState } from "react";
import { Search } from "lucide-react";

import SearchDialog from "@/app/components/header/search-dialog";

// Display-only search bar: opens the live search popup.
export default function HeroSearch() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex h-14 w-full items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 text-left shadow-sm transition hover:border-neutral-300 hover:shadow-md"
      >
        <Search className="h-5 w-5 text-neutral-400 transition group-hover:text-neutral-700" />
        <span className="flex-1 truncate text-sm text-neutral-500">Search articles, projects, services…</span>
        <kbd className="hidden rounded-lg border border-neutral-200 bg-neutral-50 px-2 py-1 text-[11px] font-medium text-neutral-500 sm:block">Ctrl K</kbd>
      </button>
      <SearchDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
