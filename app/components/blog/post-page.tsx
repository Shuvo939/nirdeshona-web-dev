import { getSessionUser } from "@/lib/auth/session";
import { getPostComments, getPostReactionSummary } from "@/lib/comments";
import { sql } from "@/lib/db";
import { getLocale } from "@/lib/i18n/server";
import { tcol } from "@/lib/i18n/sql";

import CommentsSection from "./comments-section";
import PostContent from "./post-content";
import PostHero from "./post-hero";
import PostReactions from "./post-reactions";
import PostSidebar from "./post-sidebar";
import RelatedPosts from "./related-posts";
import { postCardStats } from "./post-card-footer";
import type { Post, Tag } from "./types";

export default async function PostPage({ post, tags }: { post: Post; tags: Tag[] }) {
  const user = await getSessionUser();
  const locale = await getLocale();
  const [comments, reactions, related] = await Promise.all([
    getPostComments(post.id, user?.id ?? null),
    getPostReactionSummary(post.id, user?.id ?? null),
    sql`
      select p.slug, ${tcol(locale, "p.title")} as title, ${tcol(locale, "p.excerpt")} as excerpt, p.cover_image_url, p.published_at,
             ${postCardStats()}
      from posts p
      left join profiles pr on pr.id = p.author_id
      where p.status = 'published' and p.id <> ${post.id}
      order by (p.category_id is not distinct from ${post.category_id}::uuid) desc,
               (select count(*) from post_tags a join post_tags b on a.tag_id = b.tag_id
                 where a.post_id = p.id and b.post_id = ${post.id}) desc,
               p.published_at desc nulls last
      limit 3
    `,
  ]);

  const viewer = user ? { id: user.id, name: user.fullName, avatarUrl: user.avatarUrl, isAdmin: user.role === "ADMIN" } : null;

  return (
    <main className="min-h-screen bg-white">
      <PostHero post={post} commentCount={comments.length} reactionCount={Object.values(reactions.counts).reduce((a, b) => a + (b ?? 0), 0)} />

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-12 px-5 pb-12 pt-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:px-10 lg:pb-16 lg:pt-10">
        <div className="min-w-0">
          {post.cover_image_url && (
            <figure className="mb-10 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.cover_image_url} alt={post.title} className="aspect-[16/9] w-full object-cover" fetchPriority="high" />
            </figure>
          )}
          <PostContent post={post} />

          <PostReactions
            postId={post.id}
            initialCounts={reactions.counts}
            initialMine={reactions.mine}
            signedIn={Boolean(user)}
            commentCount={comments.length}
          />

          <CommentsSection postId={post.id} postAuthorId={post.author_id} initialComments={comments} viewer={viewer} />

          <RelatedPosts posts={related as never} />
        </div>

        <PostSidebar post={post} tags={tags} commentCount={comments.length} />
      </div>
    </main>
  );
}
