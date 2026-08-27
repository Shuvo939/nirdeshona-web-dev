import { Send } from "lucide-react";

import { addComment } from "./post-actions";

import type {
  Comment,
  CurrentUser,
} from "./types";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function formatRelativeDate(date: string) {
  const diff = Math.max(
    0,
    Date.now() - new Date(date).getTime()
  );

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return formatDate(date);
}

function initials(name: string | null) {
  if (!name) return "U";

  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(
      (part) => part[0]?.toUpperCase()
    )
    .join("");
}

export default function CommentItem({
  comment,
  postId,
  user,
}: {
  comment: Comment;
  postId: string;
  user: CurrentUser;
}) {
  const displayName =
    comment.full_name || "User";

  return (
    <div className="group">
      <div className="flex gap-3">
        {comment.avatar_url ? (
          <img
            src={comment.avatar_url}
            alt={displayName}
            className="h-9 w-9 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-semibold text-neutral-600">
            {initials(displayName)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm font-semibold text-neutral-900">
              {displayName}
            </span>

            <span className="text-[11px] text-neutral-400">
              {formatRelativeDate(
                comment.created_at
              )}
            </span>
          </div>

          <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-neutral-600">
            {comment.content}
          </p>

          {user && (
            <details className="mt-3">
              <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 text-xs font-medium text-neutral-400 transition hover:text-neutral-900">
                Reply
              </summary>

              <form
                action={addComment}
                className="mt-3 max-w-xl rounded-2xl border border-neutral-200 bg-neutral-50 p-3"
              >
                <input
                  type="hidden"
                  name="postId"
                  value={postId}
                />

                <input
                  type="hidden"
                  name="parentId"
                  value={comment.id}
                />

                <textarea
                  name="content"
                  required
                  maxLength={5000}
                  rows={3}
                  placeholder={`Reply to ${displayName}...`}
                  className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm leading-6 outline-none transition focus:border-neutral-400"
                />

                <div className="mt-2 flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-950 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-neutral-800"
                  >
                    Reply
                    <Send className="h-3 w-3" />
                  </button>
                </div>
              </form>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}