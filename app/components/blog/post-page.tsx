import { getSessionUser } from "@/lib/auth/session";
import { getPostComments, getPostReactionSummary } from "@/lib/comments";
import { sql } from "@/lib/db";

import CommentsSection from "./comments-section";
import PostContent from "./post-content";
import PostHero from "./post-hero";
import PostReactions from "./post-reactions";
import PostSidebar from "./post-sidebar";
import RelatedPosts from "./related-posts";
import type { Post, Tag } from "./types";

export default async function PostPage({ post, tags }: { post: Post; tags: Tag[] }) {
  const user = await getSessionUser();
  const [comments, reactions, related] = await Promise.all([
    getPostComments(post.id, user?.id ?? null),
    getPostReactionSummary(post.id, user?.id ?? null),
    sql`
      select p.slug, p.title, p.excerpt, p.cover_image_url, p.published_at
      from posts p
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
      <PostHero post={post} commentCount={comments.length} />

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-12 px-5 py-12 sm:px-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:px-10 lg:py-16">
        <div className="min-w-0">
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
