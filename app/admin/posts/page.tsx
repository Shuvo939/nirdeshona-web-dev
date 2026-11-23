import { sql } from "@/lib/db";
import PostsTable from "./posts-table";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";

type PostRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  views_count: number;
  published_at: string | null;
};

export default async function AdminPostsPage() {
  await requireAdmin();

  const posts = (await sql`
    select
      id,
      title,
      slug,
      status,
      views_count,
      published_at
    from public.posts
    order by created_at desc
  `) as PostRow[];

  const totalPosts = posts.length;

  const publishedPosts = posts.filter(
    (post) => post.status.toLowerCase() === "published"
  ).length;

  const draftPosts = posts.filter(
    (post) => post.status.toLowerCase() === "draft"
  ).length;

  const totalViews = posts.reduce(
    (total, post) => total + Number(post.views_count || 0),
    0
  );

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
            <span>Content</span>
            <span className="text-neutral-300">/</span>
            <span>Posts</span>
          </div>

          <h1 className="text-3xl font-bold tracking-[-0.035em] text-neutral-950 sm:text-4xl">
            Posts
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
            Create, manage and monitor your website content from one place.
          </p>
        </div>

        <Link
          href="/admin/posts/new"
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-neutral-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2"
        >
          <span className="text-base leading-none">+</span>
          New post
        </Link>
      </header>

      {/* =====================================================
          STATISTICS
      ====================================================== */}

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total posts"
          value={totalPosts}
          description="All content"
        />

        <StatCard
          label="Published"
          value={publishedPosts}
          description="Live on website"
        />

        <StatCard
          label="Drafts"
          value={draftPosts}
          description="Not published"
        />

        <StatCard
          label="Total views"
          value={totalViews.toLocaleString()}
          description="Across all posts"
        />
      </section>

      {/* =====================================================
          POSTS
      ====================================================== */}

      <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-200 px-5 py-5 sm:px-6">
          <div>
            <h2 className="text-base font-semibold text-neutral-950">
              All posts
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              Manage your published and draft content.
            </p>
          </div>
        </div>

        <PostsTable posts={posts} />
      </section>
    </div>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number | string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-neutral-500">{label}</p>

        <span className="h-2 w-2 rounded-full bg-neutral-300" />
      </div>

      <p className="mt-3 text-3xl font-bold tracking-tight text-neutral-950">
        {value}
      </p>

      <p className="mt-1 text-xs text-neutral-400">{description}</p>
    </div>
  );
}