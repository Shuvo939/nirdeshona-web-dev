import {
  Check,
  Heart,
  ThumbsUp,
} from "lucide-react";

import {
  reactToPost,
  removeReaction,
} from "./post-actions";

import type { ReactionCount } from "./types";

type ReactionType =
  | "like"
  | "love"
  | "helpful";

export default function PostReactions({
  postId,
  reactionCounts,
  currentReaction,
}: {
  postId: string;
  reactionCounts: ReactionCount[];
  currentReaction: ReactionType | null;
}) {
  const reactionMap = Object.fromEntries(
    reactionCounts.map((reaction) => [
      reaction.reaction_type,
      Number(reaction.count),
    ])
  );

  const reactions = [
    {
      type: "like" as const,
      label: "Like",
      icon: ThumbsUp,
    },
    {
      type: "love" as const,
      label: "Love",
      icon: Heart,
    },
    {
      type: "helpful" as const,
      label: "Helpful",
      icon: Check,
    },
  ];

  return (
    <section className="mt-10 rounded-3xl border border-neutral-200 bg-neutral-50 p-5 sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-neutral-950">
            Was this article helpful?
          </h2>

          <p className="mt-1 text-xs text-neutral-500">
            Share your reaction with the author.
          </p>
        </div>

        {currentReaction && (
          <form action={removeReaction}>
            <input
              type="hidden"
              name="postId"
              value={postId}
            />

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-950"
            >
              <Check className="h-3.5 w-3.5" />
              Remove reaction
            </button>
          </form>
        )}
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-3">
        {reactions.map(
          ({ type, label, icon: Icon }) => (
            <form
              action={reactToPost}
              key={type}
            >
              <input
                type="hidden"
                name="postId"
                value={postId}
              />

              <input
                type="hidden"
                name="reactionType"
                value={type}
              />

              <button
                type="submit"
                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm transition ${
                  currentReaction === type
                    ? "border-neutral-950 bg-neutral-950 text-white"
                    : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {label}
                </span>

                <span className="text-xs opacity-60">
                  {reactionMap[type] || 0}
                </span>
              </button>
            </form>
          )
        )}
      </div>
    </section>
  );
}