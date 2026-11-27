"use server";

import { z } from "zod";

import { logActivity } from "@/lib/audit";
import { getSessionUser } from "@/lib/auth/session";
import { REACTIONS, getCommentReactionSummary, type CommentNode, type ReactionType } from "@/lib/comments";
import { sql } from "@/lib/db";
import { moveToTrash } from "@/lib/trash";
import { msg } from "@/lib/i18n/server";
import { notifyUsers } from "@/lib/notifications";

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

const ContentSchema = z.string().trim().min(1, "Write something first.").max(3000, "Comments can be up to 3000 characters.");

async function activeUser() {
  const user = await getSessionUser();
  if (!user) return { error: (await msg("Please sign in to continue.", "চালিয়ে যেতে লগইন করুন।")) as string };
  if (user.isBanned) return { error: (await msg("Your account can't post or react right now.", "এই মুহূর্তে আপনার অ্যাকাউন্ট থেকে পোস্ট বা রিঅ্যাকশন দেওয়া যাচ্ছে না।")) as string };
  return { user };
}

async function notify(userId: string, type: "comment" | "reply" | "reaction", title: string, message: string | null, link: string) {
  await notifyUsers([userId], { type, title, message, link });
}

/** One reaction notification per person and target, and only for a brand-new reaction. */
async function notifyReaction(ownerId: string | null, actor: { id: string; fullName: string | null }, title: string, link: string) {
  if (!ownerId || ownerId === actor.id) return;
  const [recent] = await sql`
    select 1 from notifications
    where user_id = ${ownerId} and type = 'reaction' and link = ${link} and title = ${title}
      and created_at > now() - interval '1 day'
    limit 1
  `.catch(() => [] as unknown[]);
  if (recent) return;
  await notify(ownerId, "reaction", title, null, link);
}

export async function addComment(input: { postId: string; parentId?: string | null; content: string }): Promise<Result<{ comment: CommentNode }>> {
  const auth = await activeUser();
  if ("error" in auth) return { ok: false, error: auth.error! };
  const { user } = auth;

  const content = ContentSchema.safeParse(input.content);
  if (!content.success) return { ok: false, error: content.error.issues[0].message };
  if (!z.guid().safeParse(input.postId).success) return { ok: false, error: await msg("Post not found.", "লেখাটি পাওয়া যায়নি।") };

  const [post] = await sql`select id, slug, title, author_id from posts where id = ${input.postId} and status = 'published'`;
  if (!post) return { ok: false, error: await msg("Post not found.", "লেখাটি পাওয়া যায়নি।") };

  // Rate limit: 5 comments per 2 minutes, and no exact duplicates within 10 minutes.
  const [{ recent, dupes }] = await sql`
    select count(*) filter (where created_at > now() - interval '2 minutes')::int as recent,
           count(*) filter (where content = ${content.data} and created_at > now() - interval '10 minutes')::int as dupes
    from comments where user_id = ${user.id}
  `;
  if (recent >= 5) return { ok: false, error: await msg("You're commenting too fast. Please wait a moment.", "খুব দ্রুত মন্তব্য করছেন। একটু অপেক্ষা করুন।") };
  if (dupes > 0) return { ok: false, error: await msg("You already posted that comment.", "এই মন্তব্যটি আপনি আগেই পোস্ট করেছেন।") };

  // Replies are two levels deep: a reply to a reply attaches to the root.
  let parentId: string | null = null;
  let parentAuthor: string | null = null;
  if (input.parentId) {
    const [parent] = await sql`
      select id, parent_id, user_id from comments
      where id = ${input.parentId} and post_id = ${post.id} and status = 'visible'
    `;
    if (!parent) return { ok: false, error: await msg("That comment no longer exists.", "মন্তব্যটি আর নেই।") };
    parentId = parent.parent_id ?? parent.id;
    parentAuthor = parent.user_id;
  }

  const [row] = await sql`
    insert into comments (post_id, user_id, parent_id, content, status)
    values (${post.id}, ${user.id}, ${parentId}, ${content.data}, 'visible')
    returning id, parent_id, content, created_at, edited_at, user_id
  `;

  const link = `/blog/${post.slug}#comment-${row.id}`;
  const name = user.fullName || "Someone";
  if (parentAuthor && parentAuthor !== user.id) {
    await notify(parentAuthor, "reply", `${name} replied to your comment`, content.data, link);
  } else if (!parentAuthor && post.author_id && post.author_id !== user.id) {
    await notify(post.author_id, "comment", `${name} commented on “${post.title}”`, content.data, link);
  }

  return {
    ok: true,
    comment: {
      ...(row as unknown as Pick<CommentNode, "id" | "parent_id" | "content" | "created_at" | "edited_at" | "user_id">),
      full_name: user.fullName,
      avatar_url: user.avatarUrl,
      role: user.role,
      reaction_count: 0,
      top_reactions: [],
      my_reaction: null,
    },
  };
}

const isUuid = (v: unknown) => z.guid().safeParse(v).success;

export async function editComment(commentId: string, raw: string): Promise<Result<{ content: string; edited_at: string }>> {
  const auth = await activeUser();
  if ("error" in auth) return { ok: false, error: auth.error! };
  if (!isUuid(commentId)) return { ok: false, error: await msg("Comment not found.", "মন্তব্যটি পাওয়া যায়নি।") };
  const content = ContentSchema.safeParse(raw);
  if (!content.success) return { ok: false, error: content.error.issues[0].message };

  const [row] = await sql`
    update comments set content = ${content.data}, edited_at = now(), updated_at = now()
    where id = ${commentId} and user_id = ${auth.user.id} and status = 'visible'
    returning content, edited_at
  `;
  if (!row) return { ok: false, error: await msg("You can only edit your own comments.", "শুধু নিজের মন্তব্য সম্পাদনা করতে পারবেন।") };
  return { ok: true, content: row.content, edited_at: String(row.edited_at) };
}

export async function deleteComment(commentId: string): Promise<Result> {
  if (!isUuid(commentId)) return { ok: false, error: await msg("Comment not found.", "মন্তব্যটি পাওয়া যায়নি।") };
  const user = await getSessionUser();
  if (!user) return { ok: false, error: await msg("Please sign in.", "লগইন করুন।") };

  const [comment] = await sql`
    select c.id, c.user_id, c.content, p.title from comments c join posts p on p.id = c.post_id where c.id = ${commentId}
  `;
  if (!comment) return { ok: true };
  const isAdmin = user.role === "ADMIN";
  if (comment.user_id !== user.id && !isAdmin) return { ok: false, error: await msg("You can't delete this comment.", "এই মন্তব্যটি আপনি মুছতে পারবেন না।") };

  try {
    await moveToTrash("comment", commentId, user.id);
  } catch (error) {
    console.error("deleteComment failed", error);
    return { ok: false, error: await msg("Couldn't delete the comment. Please try again.", "মন্তব্যটি মোছা যায়নি। আবার চেষ্টা করুন।") };
  }
  if (isAdmin && comment.user_id !== user.id) {
    await logActivity(user.id, {
      action: "comment.delete",
      entity: "comment",
      entityId: commentId,
      summary: `Deleted a comment on “${comment.title}”`,
    });
  }
  return { ok: true };
}

export async function hideComment(commentId: string): Promise<Result> {
  if (!isUuid(commentId)) return { ok: false, error: await msg("Comment not found.", "মন্তব্যটি পাওয়া যায়নি।") };
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") return { ok: false, error: await msg("Not allowed.", "অনুমতি নেই।") };
  const [row] = await sql`
    update comments c set status = 'hidden', updated_at = now() from posts p
    where c.id = ${commentId} and p.id = c.post_id returning p.title
  `;
  if (row) await logActivity(user.id, { action: "comment.hide", entity: "comment", entityId: commentId, summary: `Hid a comment on “${row.title}”` });
  return { ok: true };
}

// Idempotent: sets the viewer's reaction to exactly `type` (or removes it),
// so repeated/rapid clicks can never double count. Returns the true totals.
export async function setCommentReaction(
  commentId: string,
  type: ReactionType | null,
): Promise<Result<{ count: number; top: ReactionType[]; mine: ReactionType | null }>> {
  const auth = await activeUser();
  if ("error" in auth) return { ok: false, error: auth.error! };
  if (!isUuid(commentId)) return { ok: false, error: await msg("Comment not found.", "মন্তব্যটি পাওয়া যায়নি।") };
  if (type && !REACTIONS.includes(type)) return { ok: false, error: await msg("Unknown reaction.", "অজানা রিঅ্যাকশন।") };

  if (type) {
    const [row] = await sql`
      insert into comment_likes (comment_id, user_id, reaction_type)
      select id, ${auth.user.id}, ${type} from comments where id = ${commentId} and status = 'visible'
      on conflict (comment_id, user_id) do update set reaction_type = excluded.reaction_type
      returning (xmax = 0) as inserted
    `;
    if (row?.inserted) {
      const [c] = await sql`select c.user_id, p.slug from comments c join posts p on p.id = c.post_id where c.id = ${commentId}`;
      if (c) {
        await notifyReaction(c.user_id, auth.user, `${auth.user.fullName || "Someone"} reacted to your comment`, `/blog/${c.slug}#comment-${commentId}`);
      }
    }
  } else {
    await sql`delete from comment_likes where comment_id = ${commentId} and user_id = ${auth.user.id}`;
  }
  return { ok: true, ...(await getCommentReactionSummary(commentId, auth.user.id)) };
}

export async function reportComment(commentId: string, reason: string): Promise<Result> {
  if (!isUuid(commentId)) return { ok: false, error: await msg("Comment not found.", "মন্তব্যটি পাওয়া যায়নি।") };
  const auth = await activeUser();
  if ("error" in auth) return { ok: false, error: auth.error! };
  const text = reason.trim().slice(0, 300) || "Inappropriate";
  await sql`
    insert into comment_reports (comment_id, reporter_id, reason)
    select id, ${auth.user.id}, ${text} from comments where id = ${commentId}
    on conflict (comment_id, reporter_id) do update set reason = excluded.reason, created_at = now(), resolved_at = null
  `;
  return { ok: true };
}

export async function setPostReaction(postId: string, type: ReactionType | null): Promise<Result> {
  const auth = await activeUser();
  if ("error" in auth) return { ok: false, error: auth.error! };
  if (!isUuid(postId)) return { ok: false, error: await msg("Post not found.", "লেখাটি পাওয়া যায়নি।") };
  if (type && !REACTIONS.includes(type)) return { ok: false, error: await msg("Unknown reaction.", "অজানা রিঅ্যাকশন।") };

  if (type) {
    const [row] = await sql`
      insert into post_reactions (post_id, user_id, reaction_type)
      select id, ${auth.user.id}, ${type} from posts where id = ${postId} and status = 'published'
      on conflict (post_id, user_id) do update set reaction_type = excluded.reaction_type, created_at = now()
      returning (xmax = 0) as inserted
    `;
    if (row?.inserted) {
      const [p] = await sql`select author_id, slug, title from posts where id = ${postId}`;
      if (p) await notifyReaction(p.author_id, auth.user, `${auth.user.fullName || "Someone"} reacted to “${p.title}”`, `/blog/${p.slug}`);
    }
  } else {
    await sql`delete from post_reactions where post_id = ${postId} and user_id = ${auth.user.id}`;
  }
  return { ok: true };
}

export type Reactor = { user_id: string; name: string; avatar_url: string | null; reaction_type: ReactionType; is_staff: boolean };

/** People who reacted to a published post or a visible comment (names and avatars only). */
export async function getReactors(target: "post" | "comment", id: string): Promise<Result<{ reactors: Reactor[] }>> {
  if (!z.guid().safeParse(id).success) return { ok: false, error: await msg("Not found.", "পাওয়া যায়নি।") };
  const fallback = await msg("Member", "সদস্য");
  const rows =
    target === "post"
      ? await sql`
          select r.user_id, coalesce(nullif(p.full_name, ''), ${fallback}) as name, p.avatar_url, r.reaction_type,
                 (p.role = 'ADMIN') as is_staff
          from post_reactions r
          join posts po on po.id = r.post_id and po.status = 'published'
          join profiles p on p.id = r.user_id
          where r.post_id = ${id}
          order by r.created_at desc
          limit 500
        `
      : await sql`
          select l.user_id, coalesce(nullif(p.full_name, ''), ${fallback}) as name, p.avatar_url, l.reaction_type,
                 (p.role = 'ADMIN') as is_staff
          from comment_likes l
          join comments c on c.id = l.comment_id and c.status = 'visible'
          join profiles p on p.id = l.user_id
          where l.comment_id = ${id}
          order by l.created_at desc
          limit 500
        `;
  return { ok: true, reactors: rows as unknown as Reactor[] };
}
