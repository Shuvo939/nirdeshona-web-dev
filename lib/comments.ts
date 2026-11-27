import { sql } from "@/lib/db";

export type CommentNode = {
  id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  edited_at: string | null;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  /** One line under the name, LinkedIn-style: company, else the start of the bio. */
  headline: string | null;
  reaction_count: number;
  top_reactions: ReactionType[];
  my_reaction: ReactionType | null;
};

export const REACTIONS = ["like", "love", "helpful", "celebrate", "wow", "sad"] as const;
export type ReactionType = (typeof REACTIONS)[number];

export async function getPostComments(postId: string, viewerId: string | null) {
  return (await sql`
    select c.id, c.parent_id, c.content, c.created_at, c.edited_at, c.user_id,
           p.full_name, p.avatar_url, p.role,
           coalesce(nullif(trim(p.company), ''), nullif(left(split_part(trim(coalesce(p.bio, '')), E'\n', 1), 90), '')) as headline,
           (select count(*)::int from comment_likes l where l.comment_id = c.id) as reaction_count,
           coalesce((select array_agg(t.reaction_type order by t.n desc, t.reaction_type)
                     from (select reaction_type, count(*) as n from comment_likes l where l.comment_id = c.id
                           group by reaction_type order by n desc limit 3) t), '{}') as top_reactions,
           (select l.reaction_type from comment_likes l where l.comment_id = c.id and l.user_id = ${viewerId}::uuid) as my_reaction
    from comments c
    join profiles p on p.id = c.user_id
    where c.post_id = ${postId} and c.status = 'visible'
    order by c.created_at asc
  `) as unknown as CommentNode[];
}

export async function getPostReactionSummary(postId: string, viewerId: string | null) {
  const rows = await sql`
    select reaction_type, count(*)::int as count,
           bool_or(user_id = ${viewerId}::uuid) as mine
    from post_reactions
    where post_id = ${postId}
    group by reaction_type
  `;
  const counts: Partial<Record<ReactionType, number>> = {};
  let mine: ReactionType | null = null;
  for (const r of rows) {
    counts[r.reaction_type as ReactionType] = r.count;
    if (r.mine) mine = r.reaction_type as ReactionType;
  }
  return { counts, mine };
}

export async function getCommentReactionSummary(commentId: string, viewerId: string) {
  const [row] = await sql`
    select
      (select count(*)::int from comment_likes where comment_id = ${commentId}) as count,
      coalesce((select array_agg(t.reaction_type order by t.n desc, t.reaction_type)
                from (select reaction_type, count(*) as n from comment_likes where comment_id = ${commentId}
                      group by reaction_type order by n desc limit 3) t), '{}') as top,
      (select reaction_type from comment_likes where comment_id = ${commentId} and user_id = ${viewerId}) as mine
  `;
  return { count: row.count as number, top: row.top as ReactionType[], mine: (row.mine ?? null) as ReactionType | null };
}
