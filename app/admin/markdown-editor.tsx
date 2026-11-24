"use client";

import { useMemo, useRef, useState } from "react";
import {
  Bold,
  Code,
  Eye,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  PencilLine,
  Quote,
  Redo2,
  Undo2,
} from "lucide-react";

import { renderMarkdown } from "@/app/components/blog/markdown";

type Action = "h2" | "h3" | "bold" | "italic" | "link" | "ul" | "ol" | "quote" | "code" | "hr";

/**
 * A light rich-text editor that writes Markdown: toolbar buttons and
 * shortcuts (Ctrl/⌘ + B, I, K) format the selection, and Preview shows
 * exactly how the text will look on the site. The value is submitted as a
 * normal form field named `name`.
 */
export default function MarkdownEditor({
  name,
  id,
  defaultValue = "",
  rows = 14,
  placeholder,
  required,
}: {
  name: string;
  id?: string;
  defaultValue?: string;
  rows?: number;
  placeholder?: string;
  required?: boolean;
}) {
  const [value, setValue] = useState(defaultValue);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const ref = useRef<HTMLTextAreaElement>(null);

  const words = useMemo(() => (value.trim() ? value.trim().split(/\s+/).length : 0), [value]);
  const preview = useMemo(() => (tab === "preview" ? renderMarkdown(value) : ""), [tab, value]);

  /** Replace the selection via execCommand so the browser's undo/redo keeps working. */
  function replaceSelection(next: string, selectFrom: number, selectTo: number) {
    const el = ref.current!;
    el.focus();
    const ok = document.execCommand?.("insertText", false, next);
    if (!ok) {
      const { selectionStart: s, selectionEnd: e } = el;
      el.setRangeText(next, s, e, "end");
      setValue(el.value);
    }
    requestAnimationFrame(() => el.setSelectionRange(selectFrom, selectTo));
  }

  function apply(action: Action) {
    const el = ref.current;
    if (!el) return;
    setTab("write");
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = el.value;
    const selected = text.slice(start, end);

    const wrap = (left: string, right: string, fallback: string) => {
      const inner = selected || fallback;
      replaceSelection(`${left}${inner}${right}`, start + left.length, start + left.length + inner.length);
    };

    const linePrefix = (prefix: (i: number) => string, fallback: string) => {
      const lineStart = text.lastIndexOf("\n", start - 1) + 1;
      const lineEnd = end > start && text[end - 1] === "\n" ? end - 1 : text.indexOf("\n", end) === -1 ? text.length : text.indexOf("\n", end);
      el.setSelectionRange(lineStart, lineEnd);
      const lines = (text.slice(lineStart, lineEnd) || fallback).split("\n");
      const next = lines.map((l, i) => prefix(i) + l.replace(/^(#{1,3} |> |- |\d+\. )/, "")).join("\n");
      replaceSelection(next, lineStart, lineStart + next.length);
    };

    switch (action) {
      case "bold":
        return wrap("**", "**", "bold text");
      case "italic":
        return wrap("*", "*", "italic text");
      case "code":
        return selected.includes("\n") ? wrap("```\n", "\n```", "code") : wrap("`", "`", "code");
      case "link": {
        const label = selected || "link text";
        const next = `[${label}](https://)`;
        replaceSelection(next, start + label.length + 3, start + next.length - 1);
        return;
      }
      case "h2":
        return linePrefix(() => "## ", "Heading");
      case "h3":
        return linePrefix(() => "### ", "Heading");
      case "quote":
        return linePrefix(() => "> ", "Quote");
      case "ul":
        return linePrefix(() => "- ", "List item");
      case "ol":
        return linePrefix((i) => `${i + 1}. `, "List item");
      case "hr": {
        const next = `${start > 0 && text[start - 1] !== "\n" ? "\n" : ""}\n---\n\n`;
        replaceSelection(next, start + next.length, start + next.length);
        return;
      }
    }
  }

  const tools: { action: Action; icon: typeof Bold; label: string; key?: string }[] = [
    { action: "h2", icon: Heading2, label: "Heading" },
    { action: "h3", icon: Heading3, label: "Subheading" },
    { action: "bold", icon: Bold, label: "Bold", key: "B" },
    { action: "italic", icon: Italic, label: "Italic", key: "I" },
    { action: "link", icon: Link2, label: "Link", key: "K" },
    { action: "ul", icon: List, label: "Bulleted list" },
    { action: "ol", icon: ListOrdered, label: "Numbered list" },
    { action: "quote", icon: Quote, label: "Quote" },
    { action: "code", icon: Code, label: "Code" },
    { action: "hr", icon: Minus, label: "Divider" },
  ];

  return (
    <div className="mt-2 overflow-hidden rounded-xl border border-neutral-200 bg-white focus-within:border-neutral-400 focus-within:ring-4 focus-within:ring-neutral-100">
      <div className="flex items-center gap-1 border-b border-neutral-200 bg-neutral-50 px-2 py-1.5">
        <div className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto [scrollbar-width:none]">
          {tools.map(({ action, icon: Icon, label, key }) => (
            <button
              key={action}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => apply(action)}
              title={key ? `${label} (Ctrl+${key})` : label}
              aria-label={label}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-neutral-600 transition hover:bg-white hover:text-neutral-950 hover:shadow-sm"
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
          <span className="mx-1 h-5 w-px shrink-0 bg-neutral-200" />
          <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { ref.current?.focus(); document.execCommand("undo"); }} title="Undo (Ctrl+Z)" aria-label="Undo" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-neutral-600 hover:bg-white hover:text-neutral-950">
            <Undo2 className="h-4 w-4" />
          </button>
          <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { ref.current?.focus(); document.execCommand("redo"); }} title="Redo (Ctrl+Y)" aria-label="Redo" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-neutral-600 hover:bg-white hover:text-neutral-950">
            <Redo2 className="h-4 w-4" />
          </button>
        </div>
        <div className="flex shrink-0 rounded-lg border border-neutral-200 bg-white p-0.5" role="tablist">
          {(
            [
              ["write", PencilLine, "Write"],
              ["preview", Eye, "Preview"],
            ] as const
          ).map(([key, Icon, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={`inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs font-semibold transition ${tab === key ? "bg-neutral-950 text-white" : "text-neutral-600 hover:text-neutral-950"}`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <textarea
        ref={ref}
        id={id ?? name}
        name={name}
        value={value}
        required={required}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (!(e.ctrlKey || e.metaKey)) return;
          const k = e.key.toLowerCase();
          if (k === "b" || k === "i" || k === "k") {
            e.preventDefault();
            apply(k === "b" ? "bold" : k === "i" ? "italic" : "link");
          }
        }}
        rows={rows}
        placeholder={placeholder}
        className={`block w-full resize-y bg-white px-4 py-3 font-mono text-[13px] leading-6 text-neutral-800 outline-none placeholder:font-sans placeholder:text-neutral-400 ${tab === "preview" ? "hidden" : ""}`}
      />
      {tab === "preview" && (
        <div className="min-h-[200px] px-5 py-4 text-[15px] leading-7 text-neutral-700">
          {value.trim() ? <div dangerouslySetInnerHTML={{ __html: preview }} /> : <p className="text-sm text-neutral-400">Nothing to preview yet.</p>}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-neutral-100 bg-neutral-50 px-3 py-1.5 text-[11px] text-neutral-400">
        <span>Markdown · Ctrl+B bold · Ctrl+I italic · Ctrl+K link</span>
        <span className="tabular-nums">{words.toLocaleString("en-US")} words</span>
      </div>
    </div>
  );
}
