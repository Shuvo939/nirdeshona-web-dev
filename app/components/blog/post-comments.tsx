import Link from "next/link";

import {
  ArrowUpRight,
  MessageCircle,
  Send,
  User,
} from "lucide-react";

import {
  addComment,
} from "./post-actions";

import CommentItem from "./comment-item";

import type {
  Comment,
  CurrentUser,
} from "./types";

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

export default function PostComments({
  postId,
  comments,
  user,
}: {
  postId: string;
  comments: Comment[];
  user: CurrentUser;
}) {
  const topLevelComments =
    comments.filter(
      (comment) => !comment.parent_id
    );

  const replies = (commentId: string) =>
    comments.filter(
      (comment) =>
        comment.parent_id === commentId
    );

  return (
    <section
      id="comments"
      className="mt-14"
    >
      <div className="flex items-end justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
            Discussion
          </p>

          <h2 className="mt-1 text-2xl font-bold tracking-tight text-neutral-950">
            Comments
          </h2>
        </div>

        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-500">
          {comments.length}
        </span>
      </div>

      {user ? (
        <form
          action={addComment}
          className="mt-6 rounded-3xl border border-neutral-200 bg-neutral-50 p-5 sm:p-6"
        >
          <input
            type="hidden"
            name="postId"
            value={postId}
          />

          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white">
              {initials(
                typeof user.user_metadata
                  ?.full_name === "string"
                  ? user.user_metadata.full_name
                  : user.email?.split(
                      "@"
                    )[0] || null
              )}
            </div>

            <div className="min-w-0 flex-1">
              <textarea
                name="content"
                required
                maxLength={5000}
                rows={4}
                placeholder="Write a comment..."
                className="w-full resize-none rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm leading-6 text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-4 focus:ring-neutral-950/[0.04]"
              />

              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-xs text-neutral-400">
                  Be respectful and constructive.
                </p>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-neutral-950 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-neutral-800"
                >
                  Comment
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mt-6 rounded-3xl border border-dashed border-neutral-200 bg-neutral-50 px-6 py-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-neutral-400 shadow-sm">
            <User className="h-5 w-5" />
          </div>

          <h3 className="mt-4 text-sm font-semibold text-neutral-900">
            Join the discussion
          </h3>

          <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-neutral-500">
            Sign in to leave a comment or
            reply to other readers.
          </p>

          <Link
            href="/login"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-neutral-950 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-neutral-800"
          >
            Sign in
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      <div className="mt-8 space-y-7">
        {topLevelComments.length > 0 ? (
          topLevelComments.map((comment) => {
            const commentReplies =
              replies(comment.id);

            return (
              <div key={comment.id}>
                <CommentItem
                  comment={comment}
                  postId={postId}
                  user={user}
                />

                {commentReplies.length > 0 && (
                  <div className="ml-6 mt-5 space-y-5 border-l border-neutral-200 pl-5 sm:ml-12">
                    {commentReplies.map(
                      (reply) => (
                        <CommentItem
                          key={reply.id}
                          comment={reply}
                          postId={postId}
                          user={user}
                        />
                      )
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center">
            <MessageCircle className="mx-auto h-6 w-6 text-neutral-300" />

            <p className="mt-3 text-sm font-medium text-neutral-500">
              No comments yet.
            </p>

            <p className="mt-1 text-xs text-neutral-400">
              Be the first to start the discussion.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}