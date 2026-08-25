"use client";

import { useState } from "react";
import { Search } from "lucide-react";

import SearchDialog from "./search-dialog";

export default function SearchTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
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