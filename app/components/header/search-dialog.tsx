"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Code2,
  FileText,
  Globe2,
  Palette,
  Search,
  Sparkles,
  X,
} from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

const suggestions = [
  {
    title: "Web Development",
    description: "Modern websites and powerful web applications",
    href: "/services/web-development",
    icon: Code2,
    category: "Service",
  },
  {
    title: "WordPress",
    description: "Custom WordPress websites and solutions",
    href: "/services/wordpress",
    icon: Globe2,
    category: "Service",
  },
  {
    title: "UI / UX Design",
    description: "Clean, intuitive digital experiences",
    href: "/services/design",
    icon: Palette,
    category: "Service",
  },
  {
    title: "Our Work",
    description: "Explore selected projects and case studies",
    href: "/projects",
    icon: FileText,
    category: "Page",
  },
  {
    title: "About Nirdeshona",
    description: "Learn about our approach and capabilities",
    href: "/about",
    icon: Sparkles,
    category: "Page",
  },
  {
    title: "Contact",
    description: "Start a project or get in touch",
    href: "/contact",
    icon: ArrowRight,
    category: "Page",
  },
];

export default function SearchDialog({
  open,
  onClose,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;

    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 40);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  const normalized = query.trim().toLowerCase();

  const results = suggestions.filter((item) =>
    `${item.title} ${item.description} ${item.category}`
      .toLowerCase()
      .includes(normalized)
  );

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const value = query.trim();

    if (!value) return;

    window.location.href = `/search?q=${encodeURIComponent(value)}`;
  }

  return (
    <div className="fixed inset-0 z-[9999] h-[100dvh] w-screen">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close search"
        onClick={onClose}
        className="
          absolute inset-0 h-full w-full cursor-default
          bg-black/50 backdrop-blur-md
        "
      />

      <div className="relative flex h-full w-full justify-center overflow-y-auto px-4 pb-8 pt-[8vh] sm:pt-[12vh]">
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Search Nirdeshona"
          className="
            relative h-fit w-full max-w-2xl
            overflow-hidden rounded-3xl
            border border-neutral-200
            bg-white shadow-2xl shadow-black/25
          "
        >
          {/* Search input */}
          <form onSubmit={submit}>
            <div className="flex items-center gap-3 border-b border-neutral-200 px-4 sm:px-5">
              <Search className="h-5 w-5 shrink-0 text-neutral-400" />

              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search Nirdeshona..."
                autoComplete="off"
                className="
                  h-[68px] min-w-0 flex-1 bg-transparent
                  text-base text-neutral-950 outline-none
                  placeholder:text-neutral-400
                "
              />

              <button
                type="button"
                onClick={onClose}
                aria-label="Close search"
                className="
                  flex h-8 w-8 shrink-0 items-center
                  justify-center rounded-lg text-neutral-400
                  transition hover:bg-neutral-100
                  hover:text-neutral-900
                "
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </form>

          {/* Results */}
          <div className="max-h-[58vh] overflow-y-auto p-3 sm:p-4">
            <div className="mb-2 flex items-center justify-between px-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">
                {query ? "Search results" : "Explore Nirdeshona"}
              </p>

              {query && (
                <span className="text-[10px] text-neutral-400">
                  {results.length} result{results.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {results.length > 0 ? (
              <div className="space-y-1">
                {results.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className="
                        group flex items-center gap-3
                        rounded-2xl p-3 transition
                        hover:bg-neutral-50
                      "
                    >
                      <div
                        className="
                          flex h-11 w-11 shrink-0 items-center
                          justify-center rounded-xl
                          bg-neutral-100 text-neutral-600
                          transition group-hover:bg-black
                          group-hover:text-white
                        "
                      >
                        <Icon className="h-[18px] w-[18px]" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-neutral-900">
                            {item.title}
                          </p>

                          <span className="hidden rounded-md bg-neutral-100 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-neutral-400 sm:inline">
                            {item.category}
                          </span>
                        </div>

                        <p className="mt-0.5 truncate text-xs text-neutral-500">
                          {item.description}
                        </p>
                      </div>

                      <ArrowRight className="h-4 w-4 shrink-0 text-neutral-300 transition group-hover:translate-x-0.5 group-hover:text-neutral-800" />
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="px-4 py-14 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100">
                  <Search className="h-5 w-5 text-neutral-400" />
                </div>

                <p className="mt-4 text-sm font-semibold text-neutral-800">
                  No results found
                </p>

                <p className="mt-1 text-xs text-neutral-400">
                  Try searching for a service, project or page.
                </p>
              </div>
            )}
          </div>

          {/* Bottom */}
          <div className="flex items-center justify-between border-t border-neutral-200 bg-neutral-50 px-4 py-3">
            <span className="text-[10px] text-neutral-400">
              Search Nirdeshona Web Development
            </span>

            <div className="flex items-center gap-2">
              <span className="hidden text-[10px] text-neutral-400 sm:inline">
                Close
              </span>

              <kbd className="rounded-md border border-neutral-200 bg-white px-2 py-1 text-[10px] font-medium text-neutral-400 shadow-sm">
                ESC
              </kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}