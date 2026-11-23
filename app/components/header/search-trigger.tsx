"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

import { loadIndex, prefetchIndexWhenIdle } from "@/lib/search-client";

import SearchDialog from "./search-dialog";

export default function SearchTrigger() {
  const [open, setOpen] = useState(false);

  // Download the search index while the browser is idle so search is instant.
  useEffect(() => prefetchIndexWhenIdle(), []);

  // Global shortcuts: Ctrl/Cmd + K, or "/" when not typing in a field.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const typing = target && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        onPointerEnter={() => void loadIndex()}
        onFocus={() => void loadIndex()}
        aria-label="Search Nirdeshona"
        className="
          flex h-10 w-10 items-center justify-center
          rounded-xl border border-neutral-100
          text-neutral-500 transition
          bg-neutral-50
          hover:border-neutral-200
          hover:bg-neutral-100
          hover:text-neutral-950
          active:scale-95
        "
      >
        <Search className="h-[19px] w-[19px]" />
      </button>

      <SearchDialog
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}