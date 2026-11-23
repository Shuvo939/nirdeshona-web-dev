import type { ReactionType } from "@/lib/comments";

export const REACTION_META: Record<ReactionType, { emoji: string; label: string; color: string }> = {
  like: { emoji: "👍", label: "Like", color: "text-blue-600" },
  love: { emoji: "❤️", label: "Love", color: "text-rose-600" },
  helpful: { emoji: "💡", label: "Helpful", color: "text-amber-600" },
  celebrate: { emoji: "🎉", label: "Celebrate", color: "text-violet-600" },
  wow: { emoji: "😮", label: "Wow", color: "text-amber-600" },
  sad: { emoji: "😢", label: "Sad", color: "text-amber-600" },
};

export const REACTION_ORDER: ReactionType[] = ["like", "love", "helpful", "celebrate", "wow", "sad"];
