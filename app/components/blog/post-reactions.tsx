import {
  Heart,
  Lightbulb,
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
      icon: Lightbulb,
    },
  ];

  return (
    <section className="mt-12 border-y border-neutral-200 py-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-neutral-950">
            Enjoyed this article?
          </p>

          <p className="mt-1 text-xs leading-5 text-neutral-500">
            Let the author know what you think.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {reactions.map(({ type, label, icon: Icon }) => {
            const count = reactionMap[type] || 0;
            const isActive = currentReaction === type;

            return (
              <div
                key={type}
                className="relative"
              >
                {isActive ? (
                  <form action={removeReaction}>
                    <input
                      type="hidden"
                      name="postId"
                      value={postId}
                    />

                    <button
                      type="submit"
                      title={`Remove ${label} reaction`}
                      aria-label={`Remove ${label} reaction`}
                      className="group flex h-10 min-w-10 items-center justify-center gap-2 rounded-full border border-neutral-950 bg-neutral-950 px-3 text-white transition hover:bg-neutral-800"
                    >
                      <Icon className="h-4 w-4" />

                      {count > 0 && (
                        <span className="text-xs font-semibold tabular-nums">
                          {count.toLocaleString()}
                        </span>
                      )}
                    </button>
                  </form>
                ) : (
                  <form action={reactToPost}>
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
                      title={label}
                      aria-label={label}
                      className="group flex h-10 min-w-10 items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-3 text-neutral-500 transition hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-950"
                    >
                      <Icon className="h-4 w-4 transition-transform group-hover:scale-105" />

                      {count > 0 && (
                        <span className="text-xs font-medium tabular-nums text-neutral-500 group-hover:text-neutral-900">
                          {count.toLocaleString()}
                        </span>
                      )}
                    </button>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}