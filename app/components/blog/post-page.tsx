import {
  createClient,
} from "@/lib/supabase/server";

import PostHero from "./post-hero";
import PostContent from "./post-content";
import PostReactions from "./post-reactions";
import PostComments from "./post-comments";
import PostSidebar from "./post-sidebar";

import {
  sql,
} from "@/lib/db";

import type {
  Comment,
  CurrentUser,
  Post,
  ReactionCount,
  Tag,
} from "./types";

async function getCurrentUser(): Promise<CurrentUser> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    user_metadata: user.user_metadata,
  };
}

export default async function PostPage({
  post,
  tags,
  comments,
  reactionCounts,
}: {
  post: Post;
  tags: Tag[];
  comments: Comment[];
  reactionCounts: ReactionCount[];
}) {
  const user = await getCurrentUser();

  let currentReaction:
    | "like"
    | "love"
    | "helpful"
    | null = null;

  if (user) {
    const [reaction] = await sql`
      select reaction_type
      from public.post_reactions
      where post_id = ${post.id}
        and user_id = ${user.id}
      limit 1
    `;

    if (
      reaction?.reaction_type === "like" ||
      reaction?.reaction_type === "love" ||
      reaction?.reaction_type === "helpful"
    ) {
      currentReaction =
        reaction.reaction_type;
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <PostHero
        post={post}
        commentCount={comments.length}
      />

      <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-12 sm:px-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:px-10 lg:py-16">
        <div className="min-w-0">
          <PostContent
            post={post}
            tags={tags}
          />

          <PostReactions
            postId={post.id}
            reactionCounts={reactionCounts}
            currentReaction={currentReaction}
          />

          <PostComments
            postId={post.id}
            comments={comments}
            user={user}
          />
        </div>

        <PostSidebar
          post={post}
          tags={tags}
          commentCount={comments.length}
        />
      </div>
    </main>
  );
}