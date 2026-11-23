"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Flag, Link2, Loader2, MoreHorizontal, Pencil, SendHorizonal, ShieldCheck, Trash2, EyeOff } from "lucide-react";

import ConfirmDialog from "@/app/components/confirm-dialog";
import type { CommentNode } from "@/lib/comments";

import { addComment, deleteComment, editComment, hideComment, reportComment, toggleCommentLike } from "./community-actions";

export type Viewer = { id: string; name: string | null; avatarUrl: string | null; isAdmin: boolean } | null;
type Sort = "relevant" | "newest" | "oldest";

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

function timeAgo(value: string) {
  const s = (Date.now() - new Date(value).getTime()) / 1000;
  if (s < 60) return "Just now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 604800) return `${Math.floor(s / 86400)}d`;
  if (s < 31536000) return `${Math.floor(s / 604800)}w`;
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function Avatar({ name, url, size = "h-9 w-9" }: { name: string | null; url: string | null; size?: string }) {
  return (
    <span className={`${size} flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-200 text-xs font-semibold text-neutral-700`}>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : (
        (name || "?").trim().charAt(0).toUpperCase()
      )}
    </span>
  );
}

// Render @mentions in bold and URLs as links, keeping everything else as plain text.
function RichText({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s]+|@[\p{L}\p{N}_.\- ]{1,40}?(?=\s|$|[,:!?]))/u);
  return (
    <>
      {parts.map((part, i) => {
        if (/^https?:\/\//.test(part)) {
          return (
            <a key={i} href={part} target="_blank" rel="noopener noreferrer nofollow ugc" className="break-all text-blue-600 hover:underline">
              {part}
            </a>
          );
        }
        if (part.startsWith("@") && i % 2 === 1) {
          return (
            <span key={i} className="font-semibold text-neutral-950">
              {part}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* composer                                                            */
/* ------------------------------------------------------------------ */

function Composer({
  viewer,
  placeholder,
  initial = "",
  autoFocus,
  compact,
  onSubmit,
  onCancel,
  id,
}: {
  viewer: NonNullable<Viewer>;
  placeholder: string;
  initial?: string;
  autoFocus?: boolean;
  compact?: boolean;
  onSubmit: (text: string) => Promise<boolean>;
  onCancel?: () => void;
  id?: string;
}) {
  const [text, setText] = useState(initial);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 240)}px`;
  }, [text]);

  useEffect(() => {
    if (autoFocus && ref.current) {
      ref.current.focus();
      const len = ref.current.value.length;
      ref.current.setSelectionRange(len, len);
    }
  }, [autoFocus]);

  async function submit() {
    const value = text.trim();
    if (!value || busy) return;
    setBusy(true);
    const ok = await onSubmit(value);
    setBusy(false);
    if (ok) setText("");
  }

  return (
    <div id={id} className="flex scroll-mt-28 items-start gap-2.5">
      <Avatar name={viewer.name} url={viewer.avatarUrl} size={compact ? "h-8 w-8" : "h-9 w-9"} />
      <div className="min-w-0 flex-1">
        <div className="flex items-end gap-1 rounded-2xl bg-neutral-100 px-3.5 py-2 focus-within:bg-neutral-50 focus-within:ring-2 focus-within:ring-neutral-200">
          <textarea
            ref={ref}
            value={text}
            rows={1}
            maxLength={3000}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void submit();
              }
              if (e.key === "Escape" && onCancel) onCancel();
            }}
            placeholder={placeholder}
            aria-label={placeholder}
            className="max-h-60 min-h-[24px] flex-1 resize-none bg-transparent py-0.5 text-sm leading-6 text-neutral-900 outline-none placeholder:text-neutral-500"
          />
          <button
            type="button"
            onClick={submit}
            disabled={!text.trim() || busy}
            aria-label="Send"
            className="mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-blue-600 transition hover:bg-blue-50 disabled:text-neutral-300 disabled:hover:bg-transparent"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizonal className="h-4 w-4" />}
          </button>
        </div>
        <p className="mt-1 px-3 text-[11px] text-neutral-400">
          Enter to post · Shift + Enter for a new line{onCancel ? " · Esc to cancel" : ""}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* one comment                                                         */
/* ------------------------------------------------------------------ */

function CommentItem({
  comment,
  viewer,
  postAuthorId,
  highlighted,
  isReply,
  onReply,
  onLike,
  onEdit,
  onDelete,
  onHide,
  onReport,
}: {
  comment: CommentNode;
  viewer: Viewer;
  postAuthorId: string | null;
  highlighted: boolean;
  isReply: boolean;
  onReply: (c: CommentNode) => void;
  onLike: (c: CommentNode) => void;
  onEdit: (c: CommentNode, text: string) => Promise<boolean>;
  onDelete: (c: CommentNode) => void;
  onHide: (c: CommentNode) => void;
  onReport: (c: CommentNode) => void;
}) {
  const [menu, setMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const mine = viewer?.id === comment.user_id;
  const pending = comment.id.startsWith("temp-");

  useEffect(() => {
    if (!menu) return;
    const close = (e: MouseEvent) => !menuRef.current?.contains(e.target as Node) && setMenu(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menu]);

  if (editing && viewer) {
    return (
      <div className="py-1">
        <Composer
          viewer={viewer}
          compact={isReply}
          placeholder="Edit your comment…"
          initial={comment.content}
          autoFocus
          onCancel={() => setEditing(false)}
          onSubmit={async (text) => {
            const ok = await onEdit(comment, text);
            if (ok) setEditing(false);
            return ok;
          }}
        />
      </div>
    );
  }

  return (
    <div id={`comment-${comment.id}`} className={`flex scroll-mt-28 gap-2.5 ${pending ? "opacity-60" : ""}`}>
      <Avatar name={comment.full_name} url={comment.avatar_url} size={isReply ? "h-8 w-8" : "h-9 w-9"} />
      <div className="min-w-0 flex-1">
        <div className="group flex items-center gap-1">
          <div
            className={`relative min-w-0 max-w-full rounded-2xl px-3.5 py-2 transition-colors duration-700 ${
              highlighted ? "bg-amber-100 ring-2 ring-amber-300" : "bg-neutral-100"
            }`}
          >
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
              <span className="text-[13px] font-semibold text-neutral-950">{comment.full_name || "Member"}</span>
              {comment.user_id === postAuthorId && (
                <span className="rounded bg-neutral-950 px-1.5 py-px text-[10px] font-semibold text-white">Author</span>
              )}
              {comment.role === "ADMIN" && comment.user_id !== postAuthorId && (
                <span className="inline-flex items-center gap-0.5 rounded bg-blue-50 px-1.5 py-px text-[10px] font-semibold text-blue-700">
                  <ShieldCheck className="h-2.5 w-2.5" /> Team
                </span>
              )}
            </div>
            <p className="whitespace-pre-wrap break-words text-sm leading-6 text-neutral-800">
              <RichText text={comment.content} />
            </p>
            {comment.like_count > 0 && (
              <span className="absolute -bottom-2.5 right-1 flex items-center gap-1 rounded-full bg-white px-1.5 py-0.5 text-[11px] text-neutral-600 shadow ring-1 ring-neutral-100">
                👍 {comment.like_count}
              </span>
            )}
          </div>

          {viewer && !pending && (
            <div ref={menuRef} className="relative shrink-0">
              <button
                type="button"
                aria-label="Comment options"
                onClick={() => setMenu((v) => !v)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 opacity-100 transition hover:bg-neutral-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100 data-[open=true]:opacity-100"
                data-open={menu}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              {menu && (
                <div className="absolute right-0 top-full z-20 mt-1 w-48 overflow-hidden rounded-xl border border-neutral-200 bg-white p-1 shadow-xl">
                  <MenuButton
                    icon={<Link2 className="h-4 w-4" />}
                    label="Copy link"
                    onClick={() => {
                      setMenu(false);
                      const url = `${window.location.href.split("#")[0]}#comment-${comment.id}`;
                      void navigator.clipboard?.writeText(url);
                    }}
                  />
                  {mine && <MenuButton icon={<Pencil className="h-4 w-4" />} label="Edit" onClick={() => { setMenu(false); setEditing(true); }} />}
                  {(mine || viewer.isAdmin) && (
                    <MenuButton danger icon={<Trash2 className="h-4 w-4" />} label="Delete" onClick={() => { setMenu(false); onDelete(comment); }} />
                  )}
                  {viewer.isAdmin && !mine && (
                    <MenuButton icon={<EyeOff className="h-4 w-4" />} label="Hide comment" onClick={() => { setMenu(false); onHide(comment); }} />
                  )}
                  {!mine && <MenuButton icon={<Flag className="h-4 w-4" />} label="Report" onClick={() => { setMenu(false); onReport(comment); }} />}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-3 px-3 text-xs text-neutral-500">
          <a href={`#comment-${comment.id}`} className="hover:underline" title={new Date(comment.created_at).toLocaleString("en-GB")}>
            {pending ? "Posting…" : timeAgo(comment.created_at)}
          </a>
          {!pending && (
            <>
              <button
                type="button"
                onClick={() => onLike(comment)}
                className={`font-semibold hover:underline ${comment.liked ? "text-blue-600" : "text-neutral-600"}`}
              >
                Like
              </button>
              <button type="button" onClick={() => onReply(comment)} className="font-semibold text-neutral-600 hover:underline">
                Reply
              </button>
            </>
          )}
          {comment.edited_at && <span>Edited</span>}
        </div>
      </div>
    </div>
  );
}

function MenuButton({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition ${
        danger ? "text-red-600 hover:bg-red-50" : "text-neutral-700 hover:bg-neutral-100"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* section                                                             */
/* ------------------------------------------------------------------ */

export default function CommentsSection({
  postId,
  postAuthorId,
  initialComments,
  viewer,
}: {
  postId: string;
  postAuthorId: string | null;
  initialComments: CommentNode[];
  viewer: Viewer;
}) {
  const pathname = usePathname();
  const [comments, setComments] = useState(initialComments);
  const [sort, setSort] = useState<Sort>("relevant");
  const [replyTo, setReplyTo] = useState<{ rootId: string; targetId: string; mention: string | null; key: number } | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [visibleRoots, setVisibleRoots] = useState(10);
  const [highlight, setHighlight] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ comment: CommentNode; kind: "delete" | "hide" } | null>(null);
  const [reporting, setReporting] = useState<CommentNode | null>(null);
  const [, start] = useTransition();

  function flash(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2800);
  }

  // Deep links: #comment-<id> scrolls to and highlights the comment (expanding its thread).
  useEffect(() => {
    function go() {
      const m = window.location.hash.match(/^#comment-([0-9a-f-]{36})$/);
      if (!m) return;
      const target = comments.find((c) => c.id === m[1]);
      if (!target) return;
      if (target.parent_id) setExpanded((e) => ({ ...e, [target.parent_id!]: true }));
      setVisibleRoots(1000);
      setHighlight(target.id);
      window.setTimeout(() => document.getElementById(`comment-${target.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 80);
      window.setTimeout(() => setHighlight(null), 2600);
    }
    go();
    window.addEventListener("hashchange", go);
    return () => window.removeEventListener("hashchange", go);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { roots, replies } = useMemo(() => {
    const replies: Record<string, CommentNode[]> = {};
    const roots: CommentNode[] = [];
    for (const c of comments) {
      if (c.parent_id) (replies[c.parent_id] ??= []).push(c);
      else roots.push(c);
    }
    const score = (c: CommentNode) => c.like_count * 2 + (replies[c.id]?.length ?? 0) * 3 + (c.user_id === postAuthorId ? 1 : 0);
    roots.sort((a, b) => {
      if (a.id.startsWith("temp-") || b.id.startsWith("temp-")) return a.id.startsWith("temp-") ? -1 : 1;
      if (sort === "oldest") return +new Date(a.created_at) - +new Date(b.created_at);
      if (sort === "newest") return +new Date(b.created_at) - +new Date(a.created_at);
      return score(b) - score(a) || +new Date(b.created_at) - +new Date(a.created_at);
    });
    return { roots, replies };
  }, [comments, sort, postAuthorId]);

  // parentId: the comment being replied to (server attaches it to the thread root);
  // rootId: where the optimistic copy is shown.
  async function submit(text: string, parentId: string | null, rootId: string | null = parentId) {
    if (!viewer) return false;
    const tempId = `temp-${crypto.randomUUID()}`;
    const optimistic: CommentNode = {
      id: tempId,
      parent_id: rootId,
      content: text,
      created_at: new Date().toISOString(),
      edited_at: null,
      user_id: viewer.id,
      full_name: viewer.name,
      avatar_url: viewer.avatarUrl,
      role: viewer.isAdmin ? "ADMIN" : "USER",
      like_count: 0,
      liked: false,
    };
    setComments((prev) => [...prev, optimistic]);
    if (rootId) setExpanded((e) => ({ ...e, [rootId]: true }));
    const res = await addComment({ postId, parentId, content: text });
    if (!res.ok) {
      setComments((prev) => prev.filter((c) => c.id !== tempId));
      flash(res.error);
      return false;
    }
    setComments((prev) => prev.map((c) => (c.id === tempId ? res.comment : c)));
    return true;
  }

  function like(c: CommentNode) {
    if (!viewer) return void (window.location.href = `/login?next=${encodeURIComponent(pathname)}`);
    const next = !c.liked;
    setComments((prev) => prev.map((x) => (x.id === c.id ? { ...x, liked: next, like_count: x.like_count + (next ? 1 : -1) } : x)));
    start(async () => {
      const res = await toggleCommentLike(c.id, next);
      if (!res.ok) {
        setComments((prev) => prev.map((x) => (x.id === c.id ? { ...x, liked: !next, like_count: x.like_count + (next ? -1 : 1) } : x)));
        flash(res.error);
      } else {
        setComments((prev) => prev.map((x) => (x.id === c.id ? { ...x, like_count: res.count } : x)));
      }
    });
  }

  async function edit(c: CommentNode, text: string) {
    const res = await editComment(c.id, text);
    if (!res.ok) {
      flash(res.error);
      return false;
    }
    setComments((prev) => prev.map((x) => (x.id === c.id ? { ...x, content: res.content, edited_at: res.edited_at } : x)));
    return true;
  }

  function remove(c: CommentNode, kind: "delete" | "hide") {
    const snapshot = comments;
    setComments((prev) => prev.filter((x) => x.id !== c.id && x.parent_id !== c.id));
    start(async () => {
      const res = kind === "delete" ? await deleteComment(c.id) : await hideComment(c.id);
      if (!res.ok) {
        setComments(snapshot);
        flash(res.error);
      } else flash(kind === "delete" ? "Comment deleted" : "Comment hidden");
    });
  }

  function startReply(c: CommentNode) {
    if (!viewer) return void (window.location.href = `/login?next=${encodeURIComponent(pathname)}`);
    const rootId = c.parent_id ?? c.id;
    const mention = c.user_id !== viewer.id && c.parent_id ? `@${c.full_name ?? "Member"} ` : null;
    setExpanded((e) => ({ ...e, [rootId]: true }));
    setReplyTo({ rootId, targetId: c.id, mention, key: Date.now() });
  }

  const total = comments.filter((c) => !c.id.startsWith("temp-")).length;

  return (
    <section id="comments" className="mt-12 scroll-mt-24">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold tracking-tight text-neutral-950">
          Comments <span className="text-neutral-400">{total}</span>
        </h2>
        {roots.length > 1 && (
          <label className="flex items-center gap-2 text-xs text-neutral-500">
            Sort by
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="h-8 rounded-lg border border-neutral-200 bg-white px-2 text-xs font-medium text-neutral-800 outline-none"
            >
              <option value="relevant">Most relevant</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </label>
        )}
      </div>

      <div className="mt-5">
        {viewer ? (
          <Composer id="comment-composer" viewer={viewer} placeholder="Write a comment…" onSubmit={(t) => submit(t, null)} />
        ) : (
          <div id="comment-composer" className="flex flex-col items-start gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-neutral-600">Sign in to join the conversation.</p>
            <div className="flex gap-2">
              <Link href={`/login?next=${encodeURIComponent(pathname)}`} className="rounded-full bg-neutral-950 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800">
                Sign in
              </Link>
              <Link href="/register" className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-800 hover:bg-neutral-100">
                Create account
              </Link>
            </div>
          </div>
        )}
      </div>

      {roots.length === 0 ? (
        <p className="mt-8 text-center text-sm text-neutral-500">No comments yet. Start the conversation!</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-5">
          {roots.slice(0, visibleRoots).map((root) => {
            const thread = replies[root.id] ?? [];
            const open = expanded[root.id] || thread.length <= 1;
            const shown = open ? thread : [];
            return (
              <li key={root.id}>
                <CommentItem
                  comment={root}
                  viewer={viewer}
                  postAuthorId={postAuthorId}
                  highlighted={highlight === root.id}
                  isReply={false}
                  onReply={startReply}
                  onLike={like}
                  onEdit={edit}
                  onDelete={(c) => setConfirm({ comment: c, kind: "delete" })}
                  onHide={(c) => setConfirm({ comment: c, kind: "hide" })}
                  onReport={setReporting}
                />

                {(thread.length > 0 || replyTo?.rootId === root.id) && (
                  <div className="ml-[22px] mt-3 flex flex-col gap-3 border-l-2 border-neutral-100 pl-6">
                    {!open && (
                      <button
                        type="button"
                        onClick={() => setExpanded((e) => ({ ...e, [root.id]: true }))}
                        className="w-fit text-left text-[13px] font-semibold text-neutral-600 hover:underline"
                      >
                        ↳ View {thread.length} replies
                      </button>
                    )}
                    {shown.map((reply) => (
                      <CommentItem
                        key={reply.id}
                        comment={reply}
                        viewer={viewer}
                        postAuthorId={postAuthorId}
                        highlighted={highlight === reply.id}
                        isReply
                        onReply={startReply}
                        onLike={like}
                        onEdit={edit}
                        onDelete={(c) => setConfirm({ comment: c, kind: "delete" })}
                        onHide={(c) => setConfirm({ comment: c, kind: "hide" })}
                        onReport={setReporting}
                      />
                    ))}
                    {viewer && replyTo?.rootId === root.id && (
                      <Composer
                        key={replyTo.key}
                        viewer={viewer}
                        compact
                        autoFocus
                        initial={replyTo.mention ?? ""}
                        placeholder={`Reply to ${root.full_name ?? "this comment"}…`}
                        onCancel={() => setReplyTo(null)}
                        onSubmit={async (t) => {
                          const ok = await submit(t, replyTo.targetId, root.id);
                          if (ok) setReplyTo(null);
                          return ok;
                        }}
                      />
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {roots.length > visibleRoots && (
        <button
          type="button"
          onClick={() => setVisibleRoots((v) => v + 10)}
          className="mt-6 w-full rounded-2xl border border-neutral-200 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
        >
          View more comments ({roots.length - visibleRoots})
        </button>
      )}

      {confirm && (
        <ConfirmDialog
          title={confirm.kind === "delete" ? "Delete comment?" : "Hide comment?"}
          description={
            confirm.kind === "delete"
              ? "This comment and its replies will be removed permanently."
              : "The comment will be hidden from everyone. You can restore it from the admin panel."
          }
          confirmLabel={confirm.kind === "delete" ? "Delete" : "Hide"}
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            remove(confirm.comment, confirm.kind);
            setConfirm(null);
          }}
        />
      )}

      {reporting && (
        <ReportDialog
          onCancel={() => setReporting(null)}
          onSubmit={async (reason) => {
            const res = await reportComment(reporting.id, reason);
            setReporting(null);
            flash(res.ok ? "Thanks — our team will review this comment." : res.error);
          }}
        />
      )}

      {toast && (
        <div role="status" className="fixed bottom-6 left-1/2 z-[130] -translate-x-1/2 rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white shadow-xl">
          {toast}
        </div>
      )}
    </section>
  );
}

const REPORT_REASONS = ["Spam or advertising", "Harassment or hate", "False information", "Off-topic", "Something else"];

function ReportDialog({ onCancel, onSubmit }: { onCancel: () => void; onSubmit: (reason: string) => Promise<void> }) {
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [busy, setBusy] = useState(false);
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-neutral-950/40 p-4 backdrop-blur-sm" onClick={onCancel}>
      <div role="dialog" aria-modal="true" className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-neutral-950">Report comment</h2>
        <p className="mt-1 text-sm text-neutral-500">Why are you reporting this?</p>
        <div className="mt-4 flex flex-col gap-1.5">
          {REPORT_REASONS.map((r) => (
            <label key={r} className="flex cursor-pointer items-center gap-3 rounded-xl border border-neutral-200 px-3 py-2.5 text-sm has-[:checked]:border-neutral-950 has-[:checked]:bg-neutral-50">
              <input type="radio" name="reason" checked={reason === r} onChange={() => setReason(r)} className="accent-neutral-950" />
              {r}
            </label>
          ))}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="h-10 rounded-xl border border-neutral-200 px-4 text-sm font-medium hover:bg-neutral-50">
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              await onSubmit(reason);
            }}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-neutral-950 px-4 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Report
          </button>
        </div>
      </div>
    </div>
  );
}
