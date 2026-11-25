"use client";

import { useEffect, useMemo, useState } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { TableKit } from "@tiptap/extension-table";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import { Markdown } from "tiptap-markdown";
import {
  Bold,
  Code,
  FileCode2,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListChecks,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  Strikethrough,
  Table2,
  Undo2,
} from "lucide-react";

/**
 * WYSIWYG editor that stores Markdown. What you type is shown with its real
 * styles (headings, bold, lists, quotes, tables, checklists) — no preview
 * step. The Markdown is submitted as a normal form field named `name`, so
 * the site renderer and existing content keep working unchanged.
 */

// Bangla-digit list markers ("১. ") are valid on our site but not in standard
// Markdown; convert them so they open as real lists in the editor. Bangla
// pages still number lists with Bangla digits (see globals.css).
const toEditorMarkdown = (md: string) =>
  md.replace(/^([০-৯]+)\. /gm, (_, d: string) => `${d.replace(/[০-৯]/g, (c) => String("০১২৩৪৫৬৭৮৯".indexOf(c)))}. `);

// tiptap-markdown writes hard line breaks as "\" + newline; our renderer
// treats a single newline inside a paragraph as a line break.
const fromEditorMarkdown = (md: string) => {
  let out = md.replace(/\\\n/g, "\n").replace(/\n{3,}/g, "\n\n");
  // Keep list items together (tiptap writes task lists "loose", with blank lines between items).
  for (let i = 0; i < 3; i++) {
    out = out.replace(/^((?:[-*]|\d+\.) .*)\n\n(?=(?:[-*]|\d+\.) )/gm, "$1\n");
  }
  return out.trim();
};

function getMarkdown(editor: Editor): string {
  const storage = (editor.storage as unknown as { markdown?: { getMarkdown(): string } }).markdown;
  return fromEditorMarkdown(storage?.getMarkdown() ?? "");
}

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
  const [source, setSource] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkDraft, setLinkDraft] = useState("");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener", target: null } },
      }),
      Placeholder.configure({ placeholder: placeholder ?? "" }),
      TableKit.configure({ table: { resizable: false } }),
      TaskList,
      TaskItem.configure({ nested: false }),
      Markdown.configure({ html: false, breaks: true, linkify: true, tightLists: true, transformPastedText: true }),
    ],
    content: toEditorMarkdown(defaultValue),
    editorProps: {
      attributes: {
        class: "nw-prose min-h-[var(--editor-min)] px-4 py-4 outline-none sm:px-5",
        ...(id ? { id } : {}),
        "aria-label": placeholder ?? "Editor",
      },
    },
    onUpdate: ({ editor: e }) => setValue(getMarkdown(e)),
  });

  // Keep the field in sync after the first render too (the editor normalises the input).
  useEffect(() => {
    if (editor) setValue(getMarkdown(editor));
  }, [editor]);

  const state = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            h2: e.isActive("heading", { level: 2 }),
            h3: e.isActive("heading", { level: 3 }),
            bold: e.isActive("bold"),
            italic: e.isActive("italic"),
            strike: e.isActive("strike"),
            link: e.isActive("link"),
            ul: e.isActive("bulletList"),
            ol: e.isActive("orderedList"),
            task: e.isActive("taskList"),
            quote: e.isActive("blockquote"),
            code: e.isActive("code"),
            table: e.isActive("table"),
            canUndo: e.can().undo(),
            canRedo: e.can().redo(),
          }
        : null,
  });

  const words = useMemo(() => (value.trim() ? value.replace(/[#*>`|_-]/g, " ").trim().split(/\s+/).length : 0), [value]);

  function setLink() {
    if (!editor) return;
    setLinkDraft((editor.getAttributes("link").href as string | undefined) ?? "");
    setLinkOpen(true);
  }

  function applyLink(remove = false) {
    if (!editor) return;
    const url = linkDraft.trim();
    const chain = editor.chain().focus().extendMarkRange("link");
    if (remove || !url) chain.unsetLink().run();
    else chain.setLink({ href: /^(https?:\/\/|\/|mailto:|tel:|#)/.test(url) ? url : `https://${url}` }).run();
    setLinkOpen(false);
  }

  function switchMode() {
    if (!editor) return;
    if (source) editor.commands.setContent(toEditorMarkdown(value));
    setSource(!source);
  }

  const btn = (active?: boolean) =>
    `flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition disabled:opacity-30 ${
      active ? "bg-neutral-950 text-white" : "text-neutral-600 hover:bg-white hover:text-neutral-950"
    }`;

  const tools: ({ label: string; icon: typeof Bold; active?: boolean; disabled?: boolean; run: () => void } | "sep")[] = editor
    ? [
        { label: "Paragraph", icon: Pilcrow, run: () => editor.chain().focus().setParagraph().run() },
        { label: "Heading", icon: Heading2, active: state?.h2, run: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
        { label: "Subheading", icon: Heading3, active: state?.h3, run: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
        "sep",
        { label: "Bold (Ctrl+B)", icon: Bold, active: state?.bold, run: () => editor.chain().focus().toggleBold().run() },
        { label: "Italic (Ctrl+I)", icon: Italic, active: state?.italic, run: () => editor.chain().focus().toggleItalic().run() },
        { label: "Strikethrough", icon: Strikethrough, active: state?.strike, run: () => editor.chain().focus().toggleStrike().run() },
        { label: "Link (Ctrl+K)", icon: Link2, active: state?.link, run: setLink },
        { label: "Inline code", icon: Code, active: state?.code, run: () => editor.chain().focus().toggleCode().run() },
        "sep",
        { label: "Bulleted list", icon: List, active: state?.ul, run: () => editor.chain().focus().toggleBulletList().run() },
        { label: "Numbered list", icon: ListOrdered, active: state?.ol, run: () => editor.chain().focus().toggleOrderedList().run() },
        { label: "Checklist", icon: ListChecks, active: state?.task, run: () => editor.chain().focus().toggleTaskList().run() },
        { label: "Quote", icon: Quote, active: state?.quote, run: () => editor.chain().focus().toggleBlockquote().run() },
        {
          label: state?.table ? "Add row" : "Table",
          icon: Table2,
          active: state?.table,
          run: () =>
            state?.table
              ? editor.chain().focus().addRowAfter().run()
              : editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
        },
        { label: "Divider", icon: Minus, run: () => editor.chain().focus().setHorizontalRule().run() },
        "sep",
        { label: "Undo", icon: Undo2, disabled: !state?.canUndo, run: () => editor.chain().focus().undo().run() },
        { label: "Redo", icon: Redo2, disabled: !state?.canRedo, run: () => editor.chain().focus().redo().run() },
      ]
    : [];

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white focus-within:border-neutral-400"
      style={{ ["--editor-min" as string]: `${Math.max(6, rows) * 1.75}rem` }}
      onKeyDown={(e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k" && !source) {
          e.preventDefault();
          setLink();
        }
      }}
    >
      <div className="sticky top-0 z-10 flex items-center gap-1 overflow-x-auto border-b border-neutral-200 bg-neutral-50/95 px-2 py-1.5 backdrop-blur [scrollbar-width:none]">
        {!source &&
          tools.map((t, i) =>
            t === "sep" ? (
              <span key={`sep-${i}`} className="mx-1 h-5 w-px shrink-0 bg-neutral-200" aria-hidden />
            ) : (
              <button
                key={t.label}
                type="button"
                title={t.label}
                aria-label={t.label}
                aria-pressed={t.active}
                disabled={t.disabled}
                onMouseDown={(e) => e.preventDefault()}
                onClick={t.run}
                className={btn(t.active)}
              >
                <t.icon className="h-4 w-4" />
              </button>
            ),
          )}
        <button
          type="button"
          onClick={switchMode}
          className={`ml-auto inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition ${
            source ? "bg-neutral-950 text-white" : "text-neutral-600 hover:bg-white"
          }`}
          title="Edit the Markdown source"
        >
          <FileCode2 className="h-3.5 w-3.5" /> {source ? "Back to editor" : "Markdown"}
        </button>
      </div>

      {linkOpen && !source && (
        <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 bg-white px-3 py-2">
          <input
            autoFocus
            value={linkDraft}
            onChange={(e) => setLinkDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyLink();
              }
              if (e.key === "Escape") setLinkOpen(false);
            }}
            placeholder="https://example.com or /pricing"
            className="h-9 min-w-0 flex-1 rounded-lg border border-neutral-200 px-3 text-sm outline-none focus:border-neutral-950"
          />
          <button type="button" onClick={() => applyLink()} className="h-9 rounded-lg bg-neutral-950 px-3 text-xs font-semibold text-white">
            Apply
          </button>
          <button type="button" onClick={() => applyLink(true)} className="h-9 rounded-lg border border-neutral-200 px-3 text-xs font-semibold text-neutral-700">
            Remove
          </button>
          <button type="button" onClick={() => setLinkOpen(false)} className="h-9 rounded-lg px-2 text-xs text-neutral-500">
            Cancel
          </button>
        </div>
      )}

      {source ? (
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={rows}
          spellCheck
          className="block w-full resize-y px-4 py-4 font-mono text-sm leading-6 text-neutral-800 outline-none sm:px-5"
        />
      ) : editor ? (
        <EditorContent editor={editor} />
      ) : (
        <div className="px-4 py-4 text-sm text-neutral-400 sm:px-5" style={{ minHeight: `${Math.max(6, rows) * 1.75}rem` }}>
          {placeholder}
        </div>
      )}

      {/* The form submits Markdown. A visually hidden textarea keeps `required` working. */}
      <textarea
        name={name}
        value={value}
        readOnly
        required={required}
        tabIndex={-1}
        aria-hidden
        className="pointer-events-none absolute h-px w-px opacity-0"
      />

      <div className="flex items-center justify-between border-t border-neutral-100 px-4 py-2 text-[11px] text-neutral-400">
        <span>{source ? "Markdown source" : "What you see is what visitors will see"}</span>
        <span>
          {words} word{words === 1 ? "" : "s"}
        </span>
      </div>
    </div>
  );
}
