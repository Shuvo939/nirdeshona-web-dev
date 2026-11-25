import type { ReactionType } from "@/lib/comments";

export const REACTION_META: Record<ReactionType, { emoji: string; label: string; labelBn: string; color: string }> = {
  like: { emoji: "👍", label: "Like", labelBn: "লাইক", color: "text-blue-600" },
  love: { emoji: "❤️", label: "Love", labelBn: "ভালোবাসা", color: "text-rose-600" },
  helpful: { emoji: "💡", label: "Helpful", labelBn: "উপকারী", color: "text-amber-600" },
  celebrate: { emoji: "🎉", label: "Celebrate", labelBn: "অভিনন্দন", color: "text-violet-600" },
  wow: { emoji: "😮", label: "Wow", labelBn: "অবাক", color: "text-amber-600" },
  sad: { emoji: "😢", label: "Sad", labelBn: "দুঃখিত", color: "text-amber-600" },
};

/** Reaction name in the given language. */
export function reactionLabel(type: ReactionType, locale: "bn" | "en") {
  return locale === "bn" ? REACTION_META[type].labelBn : REACTION_META[type].label;
}

export const REACTION_ORDER: ReactionType[] = ["like", "love", "helpful", "celebrate", "wow", "sad"];
