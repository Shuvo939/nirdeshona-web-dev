"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";

import { useI18n } from "@/lib/i18n/client";

type Item = { id: string; file_url: string; caption: string | null };

export default function ProjectGallery({ items, title }: { items: Item[]; title: string }) {
  const { L, num } = useI18n();
  const [open, setOpen] = useState<number | null>(null);

  const go = useCallback((dir: 1 | -1) => setOpen((i) => (i === null ? i : (i + dir + items.length) % items.length)), [items.length]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, go]);

  const current = open === null ? null : items[open];

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((item, i) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setOpen(i)}
            className={`group relative overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 text-left ${
              i === 0 && items.length > 2 ? "col-span-2 row-span-2 aspect-[4/3] sm:aspect-auto" : "aspect-[4/3]"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.file_url} alt={item.caption ?? `${title} screenshot ${i + 1}`} loading="lazy" className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105" />
            <span className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-neutral-700 opacity-0 shadow transition group-hover:opacity-100">
              <Expand className="h-4 w-4" />
            </span>
            {item.caption && (
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8 text-xs font-medium text-white">{item.caption}</span>
            )}
          </button>
        ))}
      </div>

      {current && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black/95" role="dialog" aria-modal="true" aria-label={L("Image viewer", "ছবি দেখুন")} onClick={() => setOpen(null)}>
          <div className="flex items-center justify-between px-4 py-3 text-sm text-white/80">
            <span>
              {num(open! + 1)} / {num(items.length)}
            </span>
            <button type="button" aria-label={L("Close", "বন্ধ করুন")} onClick={() => setOpen(null)} className="rounded-full p-2 hover:bg-white/10">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-16" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={current.file_url} alt={current.caption ?? title} className="max-h-full max-w-full rounded-lg object-contain" />
            {items.length > 1 && (
              <>
                <button type="button" aria-label={L("Previous image", "আগের ছবি")} onClick={() => go(-1)} className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:left-4">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button type="button" aria-label={L("Next image", "পরের ছবি")} onClick={() => go(1)} className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:right-4">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
          <p className="min-h-12 px-4 py-3 text-center text-sm text-white/80">{current.caption}</p>
        </div>
      )}
    </>
  );
}
