"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { sql } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

async function getCurrentUser() {
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

async function getPostSlug(postId: string) {
  const [post] = await sql`
    select slug
    from public.posts
    where id = ${postId}
    limit 1
  `;

  return post?.slug ? String(post.slug) : null;
}

export async function addComment(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const postId = String(
    formData.get("postId") ?? ""
  );

  const content = String(
    formData.get("content") ?? ""
  ).trim();

  const parentId = String(
    formData.get("parentId") ?? ""
  ).trim();

  if (
    !postId ||
    !content ||
    content.length > 5000
  ) {
    return;
  }

  if (parentId) {
    const [parent] = await sql`
      select id
      from public.comments
      where id = ${parentId}
        and post_id = ${postId}
        and status = 'visible'
      limit 1
    `;

    if (!parent) {
      return;
    }
  }

  await sql`
    insert into public.comments (
      post_id,
      user_id,
      parent_id,
      content,
      status
    )
    values (
      ${postId},
      ${user.id},
      ${parentId || null},
      ${content},
      'visible'
    )
  `;

  const slug = await getPostSlug(postId);

  if (slug) {
    revalidatePath(`/blog/${slug}`);
  }
}

export async function reactToPost(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const postId = String(
    formData.get("postId") ?? ""
  );

  const reactionType = String(
    formData.get("reactionType") ?? ""
  );

  if (
    !postId ||
    !["like", "love", "helpful"].includes(
      reactionType
    )
  ) {
    return;
  }

  await sql`
    insert into public.post_reactions (
      post_id,
      user_id,
      reaction_type
    )
    values (
      ${postId},
      ${user.id},
      ${reactionType}
    )
    on conflict (post_id, user_id)
    do update set
      reaction_type = excluded.reaction_type,
      created_at = now()
  `;

  const slug = await getPostSlug(postId);

  if (slug) {
    revalidatePath(`/blog/${slug}`);
  }
}

export async function removeReaction(
  formData: FormData
) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const postId = String(
    formData.get("postId") ?? ""
  );

  if (!postId) {
    return;
  }

  await sql`
    delete from public.post_reactions
    where post_id = ${postId}
      and user_id = ${user.id}
  `;

  const slug = await getPostSlug(postId);

  if (slug) {
    revalidatePath(`/blog/${slug}`);
  }
}

export async function getCurrentPostUser() {
  return getCurrentUser();
}