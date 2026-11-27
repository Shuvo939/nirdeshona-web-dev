import { MessageCircle, ThumbsUp } from "lucide-react";

import { sql } from "@/lib/db";
import { getI18n } from "@/lib/i18n/server";

export type PostCardStats = {
  author_name: string | null;
  author_avatar: string | null;
  published_at: string | Date | null;
  comment_count: number;
  reaction_count: number;
  top_reactions: string[] | null;
  reading_minutes?: number;
};

/** SQL fragment helpers live with the callers; this renders the card footer. */
export default async function PostCardFooter({ post }: { post: PostCardStats }) {
  const { L, num, date } = await getI18n();
  const name = post.author_name || L("Nirdeshona Web", "নির্দেশনা ওয়েব");
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="mt-4 flex items-center justify-between gap-3 border-t border-neutral-100 pt-4">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-950 text-[11px] font-bold text-white ring-2 ring-white">
          {post.author_avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.author_avatar} alt="" loading="lazy" className="h-full w-full object-cover" />
          ) : (
            initials
          )}
        </span>
        <span className="min-w-0 leading-tight">
          <span className="block truncate text-xs font-semibold text-neutral-800">{name}</span>
          <span className="block truncate text-[11px] text-neutral-500">
            {post.published_at ? date(post.published_at) : ""}
            {post.reading_minutes ? ` · ${L(`${post.reading_minutes} min read`, `${num(post.reading_minutes)} মিনিট`)}` : ""}
          </span>
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-3 text-xs text-neutral-500">
        <span
          className="inline-flex items-center gap-1"
          title={L(`${post.reaction_count} reactions`, `${num(post.reaction_count)}টি রিঅ্যাকশন`)}
        >
          <ThumbsUp className="h-3.5 w-3.5" aria-hidden />
          <span className="sr-only">{L("Reactions", "রিঅ্যাকশন")}:</span>
          {num(post.reaction_count)}
        </span>
        <span className="inline-flex items-center gap-1" title={L(`${post.comment_count} comments`, `${num(post.comment_count)}টি মন্তব্য`)}>
          <MessageCircle className="h-3.5 w-3.5" aria-hidden />
          <span className="sr-only">{L("Comments", "মন্তব্য")}:</span>
          {num(post.comment_count)}
        </span>
      </div>
    </div>
  );
}

/** Columns every post card query selects (expects posts as `p`, profiles joined as `pr`). */
export const postCardStats = () => sql`
  pr.full_name as author_name, pr.avatar_url as author_avatar,
  (select count(*)::int from comments c where c.post_id = p.id and c.status = 'visible') as comment_count,
  (select count(*)::int from post_reactions r where r.post_id = p.id) as reaction_count,
  (select array_agg(t.reaction_type order by t.n desc) from (
     select r.reaction_type, count(*) as n from post_reactions r where r.post_id = p.id group by r.reaction_type order by n desc limit 3
   ) t) as top_reactions
`;
