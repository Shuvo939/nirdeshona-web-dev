import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  Eye,
  Heart,
  MessageCircle,
  Send,
  ThumbsUp,
  User,
} from "lucide-react";

import { sql } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { trackPostView } from "@/lib/posts/views";

type PageProps = { params: Promise<{ slug: string }> };

type Post = {
  id: string;
  author_id: string | null;
  category_id: string | null;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  status: "draft" | "published" | "archived";
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  views_count: number;
  author_name: string | null;
  author_avatar: string | null;
  category_name: string | null;
  category_slug: string | null;
};

type Tag = { id: string; name: string; slug: string };

type Comment = {
  id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
};

type ReactionCount = {
  reaction_type: "like" | "love" | "helpful";
  count: number;
};

type CurrentUser = {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
} | null;

function formatDate(date: string | null) {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function formatRelativeDate(date: string) {
  const diff = Math.max(0, Date.now() - new Date(date).getTime());
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

function initials(name: string | null) {
  if (!name) return "U";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function safeUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.href
      : null;
  } catch {
    return null;
  }
}

function renderMarkdown(markdown: string) {
  let html = escapeHtml(markdown);

  html = html.replace(
    /```(?:([a-zA-Z0-9_-]+)\n)?([\s\S]*?)```/g,
    (_, language, code) =>
      `<pre class="my-7 overflow-x-auto rounded-2xl bg-neutral-950 p-5 text-sm leading-7 text-neutral-100"><code>${language ? `<span class="mb-3 block text-[10px] font-semibold uppercase tracking-widest text-neutral-500">${language}</span>` : ""}${code.trim()}</code></pre>`
  );

  html = html.replace(
    /^### (.+)$/gm,
    '<h3 class="mt-9 mb-3 text-xl font-bold tracking-tight text-neutral-950">$1</h3>'
  );
  html = html.replace(
    /^## (.+)$/gm,
    '<h2 class="mt-11 mb-4 text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">$1</h2>'
  );
  html = html.replace(
    /^# (.+)$/gm,
    '<h1 class="mt-11 mb-5 text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">$1</h1>'
  );
  html = html.replace(
    /^> (.+)$/gm,
    '<blockquote class="my-7 border-l-4 border-neutral-300 pl-5 text-[15px] italic leading-8 text-neutral-600">$1</blockquote>'
  );
  html = html.replace(
    /^---$/gm,
    '<hr class="my-10 border-neutral-200" />'
  );
  html = html.replace(
    /^[-*] (.+)$/gm,
    '<li class="ml-6 list-disc leading-8 text-neutral-700">$1</li>'
  );
  html = html.replace(
    /^\d+\. (.+)$/gm,
    '<li class="ml-6 list-decimal leading-8 text-neutral-700">$1</li>'
  );

  html = html.replace(
    /!\[([^\]]*)\]\((https?:\/\/[^)\s]+)(?:\s+"([^"]*)")?\)/g,
    (_, alt, url, title) => {
      const safe = safeUrl(url);
      if (!safe) return "";
      return `<img src="${safe}" alt="${alt}"${title ? ` title="${title}"` : ""} class="my-8 w-full rounded-2xl border border-neutral-200 object-cover" loading="lazy" />`;
    }
  );

  html = html.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
    (_, text, url) => {
      const safe = safeUrl(url);
      if (!safe) return text;
      return `<a href="${safe}" target="_blank" rel="noopener noreferrer" class="font-medium text-neutral-950 underline decoration-neutral-300 underline-offset-4 transition hover:decoration-neutral-800">${text}</a>`;
    }
  );

  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__(.+?)__/g, "<strong>$1</strong>");
  html = html.replace(
    /(?<!\*)\*([^*\n]+?)\*(?!\*)/g,
    "<em>$1</em>"
  );
  html = html.replace(
    /(?<!_)_([^_\n]+?)_(?!_)/g,
    "<em>$1</em>"
  );
  html = html.replace(
    /`([^`\n]+)`/g,
    '<code class="rounded-md bg-neutral-100 px-1.5 py-0.5 font-mono text-[0.9em] text-neutral-800">$1</code>'
  );

  return html
    .split(/\n{2,}/)
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";

      if (
        trimmed.startsWith("<h1") ||
        trimmed.startsWith("<h2") ||
        trimmed.startsWith("<h3") ||
        trimmed.startsWith("<pre") ||
        trimmed.startsWith("<blockquote") ||
        trimmed.startsWith("<li") ||
        trimmed.startsWith("<hr") ||
        trimmed.startsWith("<img")
      )
        return trimmed;

      return `<p class="mb-5 leading-8 text-neutral-700">${trimmed.replace(/\n/g, "<br />")}</p>`;
    })
    .join("\n");
}

async function getCurrentUser(): Promise<CurrentUser> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

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
  return post?.slug ?? null;
}

async function addComment(formData: FormData) {
  "use server";

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const postId = String(formData.get("postId") ?? "");
  const content = String(formData.get("content") ?? "").trim();
  const parentId = String(formData.get("parentId") ?? "").trim();

  if (!postId || !content || content.length > 5000) return;

  if (parentId) {
    const [parent] = await sql`
      select id
      from public.comments
      where id = ${parentId}
        and post_id = ${postId}
        and status = 'visible'
      limit 1
    `;
    if (!parent) return;
  }

  await sql`
    insert into public.comments (
      post_id, user_id, parent_id, content, status
    )
    values (
      ${postId}, ${user.id}, ${parentId || null}, ${content}, 'visible'
    )
  `;

  const slug = await getPostSlug(postId);
  if (slug) revalidatePath(`/blog/${slug}`);
}

async function reactToPost(formData: FormData) {
  "use server";

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const postId = String(formData.get("postId") ?? "");
  const reactionType = String(formData.get("reactionType") ?? "");

  if (
    !postId ||
    !["like", "love", "helpful"].includes(reactionType)
  )
    return;

  await sql`
    insert into public.post_reactions (
      post_id, user_id, reaction_type
    )
    values (
      ${postId}, ${user.id}, ${reactionType}
    )
    on conflict (post_id, user_id)
    do update set
      reaction_type = excluded.reaction_type,
      created_at = now()
  `;

  const slug = await getPostSlug(postId);
  if (slug) revalidatePath(`/blog/${slug}`);
}

async function removeReaction(formData: FormData) {
  "use server";

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const postId = String(formData.get("postId") ?? "");
  if (!postId) return;

  await sql`
    delete from public.post_reactions
    where post_id = ${postId}
      and user_id = ${user.id}
  `;

  const slug = await getPostSlug(postId);
  if (slug) revalidatePath(`/blog/${slug}`);
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const [post] = await sql`
    select
      title,
      excerpt,
      seo_title,
      seo_description,
      cover_image_url
    from public.posts
    where slug = ${slug}
      and status = 'published'
    limit 1
  `;

  if (!post) return { title: "Post Not Found | Nirdeshona" };

  const title = post.seo_title || post.title;
  const description =
    post.seo_description ||
    post.excerpt ||
    `Read ${post.title} on Nirdeshona.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      ...(post.cover_image_url
        ? {
            images: [{ url: post.cover_image_url, alt: post.title }],
          }
        : {}),
    },
    twitter: {
      card: post.cover_image_url ? "summary_large_image" : "summary",
      title,
      description,
      ...(post.cover_image_url
        ? { images: [post.cover_image_url] }
        : {}),
    },
  };
}

export default async function SinglePostPage({ params }: PageProps) {
  const { slug } = await params;

  const [post] = (await sql`
    select
      p.*,
      pr.full_name as author_name,
      pr.avatar_url as author_avatar,
      pc.name as category_name,
      pc.slug as category_slug
    from public.posts p
    left join public.profiles pr on pr.id = p.author_id
    left join public.post_categories pc on pc.id = p.category_id
    where p.slug = ${slug}
      and p.status = 'published'
    limit 1
  `) as Post[];

  if (!post) notFound();

  // IMPORTANT:
  // Count this visitor only once per post every 12 hours.
  // Do NOT call increment_post_views() here.
  await trackPostView(post.id);

  // Read the current value after tracking.
  const [freshPost] = await sql`
    select views_count
    from public.posts
    where id = ${post.id}
    limit 1
  `;

  if (freshPost) post.views_count = Number(freshPost.views_count);

  const [tags, comments, reactionCounts] = await Promise.all([
    (await sql`
      select t.id, t.name, t.slug
      from public.tags t
      inner join public.post_tags pt on pt.tag_id = t.id
      where pt.post_id = ${post.id}
      order by t.name asc
    `) as Tag[],

    (await sql`
      select
        c.id,
        c.parent_id,
        c.content,
        c.created_at,
        c.user_id,
        p.full_name,
        p.avatar_url
      from public.comments c
      left join public.profiles p on p.id = c.user_id
      where c.post_id = ${post.id}
        and c.status = 'visible'
      order by c.created_at asc
    `) as Comment[],

    (await sql`
      select reaction_type, count(*)::int as count
      from public.post_reactions
      where post_id = ${post.id}
      group by reaction_type
    `) as ReactionCount[],
  ]);

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
    )
      currentReaction = reaction.reaction_type;
  }

  const reactionMap = Object.fromEntries(
    reactionCounts.map((reaction) => [
      reaction.reaction_type,
      Number(reaction.count),
    ])
  );

  const topLevelComments = comments.filter(
    (comment) => !comment.parent_id
  );

  const replies = (commentId: string) =>
    comments.filter(
      (comment) => comment.parent_id === commentId
    );

  return (
    <main className="min-h-screen bg-white">
      <section className="relative overflow-hidden border-b border-neutral-200 bg-neutral-50">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <div className="absolute left-1/2 top-[-260px] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-neutral-200/60 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.25]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #d4d4d4 1px, transparent 1px), linear-gradient(to bottom, #d4d4d4 1px, transparent 1px)",
              backgroundSize: "64px 64px",
              maskImage:
                "linear-gradient(to bottom, black, transparent 80%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, black, transparent 80%)",
            }}
          />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-14 pt-10 sm:px-8 lg:px-10 lg:pb-20 lg:pt-14">
          <Link
            href="/blog"
            className="group inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition hover:text-neutral-950"
          >
            <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" />
            Back to blog
          </Link>

          <div className="mx-auto mt-12 max-w-4xl text-center">
            {post.category_name && post.category_slug && (
              <Link
                href={`/blog/category/${post.category_slug}`}
                className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500 shadow-sm transition hover:border-neutral-300 hover:text-neutral-900"
              >
                <BookOpen className="h-3.5 w-3.5" />
                {post.category_name}
              </Link>
            )}

            <h1 className="mt-6 text-4xl font-bold tracking-[-0.045em] text-neutral-950 sm:text-5xl lg:text-6xl lg:leading-[1.05]">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-neutral-500 sm:text-lg">
                {post.excerpt}
              </p>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-xs text-neutral-500">
              <div className="flex items-center gap-2">
                {post.author_avatar ? (
                  <img
                    src={post.author_avatar}
                    alt={post.author_name || "Author"}
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-semibold text-white">
                    {initials(post.author_name)}
                  </div>
                )}
                <span className="font-medium text-neutral-700">
                  {post.author_name || "Nirdeshona"}
                </span>
              </div>

              <span className="hidden h-1 w-1 rounded-full bg-neutral-300 sm:block" />

              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                {formatDate(post.published_at || post.created_at)}
              </span>

              <span className="hidden h-1 w-1 rounded-full bg-neutral-300 sm:block" />

              <span className="inline-flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                {Number(post.views_count).toLocaleString()} views
              </span>

              <span className="hidden h-1 w-1 rounded-full bg-neutral-300 sm:block" />

              <span className="inline-flex items-center gap-1.5">
                <MessageCircle className="h-3.5 w-3.5" />
                {comments.length} comments
              </span>
            </div>
          </div>
        </div>
      </section>

      {post.cover_image_url && (
        <section className="mx-auto w-full max-w-6xl px-6 pt-8 sm:px-8 lg:px-10 lg:pt-10">
          <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100 shadow-sm">
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="aspect-[16/8] w-full object-cover"
            />
          </div>
        </section>
      )}

      <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-12 sm:px-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:px-10 lg:py-16">
        <article className="min-w-0">
          <div
            className="text-[15px] sm:text-base"
            dangerouslySetInnerHTML={{
              __html: renderMarkdown(post.content),
            }}
          />

          {tags.length > 0 && (
            <div className="mt-12 border-t border-neutral-200 pt-7">
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
                  Tags
                </span>
                {tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/blog/tag/${tag.slug}`}
                    className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-medium text-neutral-600 transition hover:border-neutral-300 hover:bg-white hover:text-neutral-950"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <section className="mt-10 rounded-3xl border border-neutral-200 bg-neutral-50 p-5 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-neutral-950">
                  Was this article helpful?
                </h2>
                <p className="mt-1 text-xs text-neutral-500">
                  Share your reaction with the author.
                </p>
              </div>

              {currentReaction && (
                <form action={removeReaction}>
                  <input type="hidden" name="postId" value={post.id} />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-950"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Remove reaction
                  </button>
                </form>
              )}
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              {[
                { type: "like", label: "Like", icon: ThumbsUp },
                { type: "love", label: "Love", icon: Heart },
                { type: "helpful", label: "Helpful", icon: Check },
              ].map(({ type, label, icon: Icon }) => (
                <form action={reactToPost} key={type}>
                  <input type="hidden" name="postId" value={post.id} />
                  <input
                    type="hidden"
                    name="reactionType"
                    value={type}
                  />
                  <button
                    type="submit"
                    className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm transition ${
                      currentReaction === type
                        ? "border-neutral-950 bg-neutral-950 text-white"
                        : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {label}
                    </span>
                    <span className="text-xs opacity-60">
                      {reactionMap[type] || 0}
                    </span>
                  </button>
                </form>
              ))}
            </div>
          </section>

          <section id="comments" className="mt-14">
            <div className="flex items-end justify-between gap-4 border-b border-neutral-200 pb-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                  Discussion
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-neutral-950">
                  Comments
                </h2>
              </div>
              <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-500">
                {comments.length}
              </span>
            </div>

            {user ? (
              <form
                action={addComment}
                className="mt-6 rounded-3xl border border-neutral-200 bg-neutral-50 p-5 sm:p-6"
              >
                <input type="hidden" name="postId" value={post.id} />
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white">
                    {initials(
                      typeof user.user_metadata?.full_name === "string"
                        ? user.user_metadata.full_name
                        : user.email?.split("@")[0] || null
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <textarea
                      name="content"
                      required
                      maxLength={5000}
                      rows={4}
                      placeholder="Write a comment..."
                      className="w-full resize-none rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm leading-6 text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-4 focus:ring-neutral-950/[0.04]"
                    />

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="text-xs text-neutral-400">
                        Be respectful and constructive.
                      </p>
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-xl bg-neutral-950 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-neutral-800"
                      >
                        Comment
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="mt-6 rounded-3xl border border-dashed border-neutral-200 bg-neutral-50 px-6 py-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-neutral-400 shadow-sm">
                  <User className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-neutral-900">
                  Join the discussion
                </h3>
                <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-neutral-500">
                  Sign in to leave a comment or reply to other readers.
                </p>
                <Link
                  href="/login"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-neutral-950 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-neutral-800"
                >
                  Sign in
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}

            <div className="mt-8 space-y-7">
              {topLevelComments.length > 0 ? (
                topLevelComments.map((comment) => (
                  <div key={comment.id}>
                    <CommentItem
                      comment={comment}
                      postId={post.id}
                      user={user}
                    />

                    {replies(comment.id).length > 0 && (
                      <div className="ml-6 mt-5 space-y-5 border-l border-neutral-200 pl-5 sm:ml-12">
                        {replies(comment.id).map((reply) => (
                          <CommentItem
                            key={reply.id}
                            comment={reply}
                            postId={post.id}
                            user={user}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-12 text-center">
                  <MessageCircle className="mx-auto h-6 w-6 text-neutral-300" />
                  <p className="mt-3 text-sm font-medium text-neutral-500">
                    No comments yet.
                  </p>
                  <p className="mt-1 text-xs text-neutral-400">
                    Be the first to start the discussion.
                  </p>
                </div>
              )}
            </div>
          </section>
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-5">
            <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                Article
              </p>

              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-neutral-500">Published</span>
                  <span className="text-xs font-medium text-neutral-800">
                    {formatDate(post.published_at || post.created_at)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-neutral-500">Views</span>
                  <span className="text-xs font-medium text-neutral-800">
                    {Number(post.views_count).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-neutral-500">Comments</span>
                  <span className="text-xs font-medium text-neutral-800">
                    {comments.length}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                Written by
              </p>

              <div className="mt-4 flex items-center gap-3">
                {post.author_avatar ? (
                  <img
                    src={post.author_avatar}
                    alt={post.author_name || "Author"}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-950 text-xs font-semibold text-white">
                    {initials(post.author_name)}
                  </div>
                )}

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-neutral-900">
                    {post.author_name || "Nirdeshona"}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    Author
                  </p>
                </div>
              </div>
            </div>

            {tags.length > 0 && (
              <div className="rounded-3xl border border-neutral-200 bg-white p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                  Topics
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Link
                      key={tag.id}
                      href={`/blog/tag/${tag.slug}`}
                      className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs text-neutral-600 transition hover:bg-neutral-950 hover:text-white"
                    >
                      {tag.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <Link
              href="#comments"
              className="group flex items-center justify-between rounded-3xl border border-neutral-200 bg-neutral-950 p-5 text-white transition hover:bg-neutral-800"
            >
              <div>
                <p className="text-sm font-semibold">
                  Join the discussion
                </p>
                <p className="mt-1 text-xs text-neutral-400">
                  {comments.length} comments
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-neutral-500 transition group-hover:translate-x-0.5 group-hover:text-white" />
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}

function CommentItem({
  comment,
  postId,
  user,
}: {
  comment: Comment;
  postId: string;
  user: CurrentUser;
}) {
  const displayName = comment.full_name || "User";

  return (
    <div className="group">
      <div className="flex gap-3">
        {comment.avatar_url ? (
          <img
            src={comment.avatar_url}
            alt={displayName}
            className="h-9 w-9 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-semibold text-neutral-600">
            {initials(displayName)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm font-semibold text-neutral-900">
              {displayName}
            </span>
            <span className="text-[11px] text-neutral-400">
              {formatRelativeDate(comment.created_at)}
            </span>
          </div>

          <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-neutral-600">
            {comment.content}
          </p>

          {user && (
            <details className="mt-3">
              <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 text-xs font-medium text-neutral-400 transition hover:text-neutral-900">
                Reply
              </summary>

              <form
                action={addComment}
                className="mt-3 max-w-xl rounded-2xl border border-neutral-200 bg-neutral-50 p-3"
              >
                <input type="hidden" name="postId" value={postId} />
                <input
                  type="hidden"
                  name="parentId"
                  value={comment.id}
                />

                <textarea
                  name="content"
                  required
                  maxLength={5000}
                  rows={3}
                  placeholder={`Reply to ${displayName}...`}
                  className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm leading-6 outline-none transition focus:border-neutral-400"
                />

                <div className="mt-2 flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-950 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-neutral-800"
                  >
                    Reply
                    <Send className="h-3 w-3" />
                  </button>
                </div>
              </form>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}