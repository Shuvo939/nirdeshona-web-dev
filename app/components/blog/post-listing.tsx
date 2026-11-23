import Link from "next/link";
import { ChevronLeft, ChevronRight, Clock, Eye, MessageCircle, Newspaper } from "lucide-react";

import { formatDate } from "@/app/components/marketing";
import { sql } from "@/lib/db";

const PAGE_SIZE = 9;

type ListedPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  published_at: string | null;
  views_count: number;
  author_name: string | null;
  category_name: string | null;
  category_slug: string | null;
  comment_count: number;
};

function readingTime(content: string) {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}

export async function getBlogSidebarData() {
  const [categories, tags] = await Promise.all([
    sql`
      select pc.name, pc.slug, count(p.id)::int as total
      from post_categories pc
      join posts p on p.category_id = pc.id and p.status = 'published'
      group by pc.id
      order by total desc, pc.name asc
    `,
    sql`
      select t.name, t.slug, count(p.id)::int as total
      from tags t
      join post_tags pt on pt.tag_id = t.id
      join posts p on p.id = pt.post_id and p.status = 'published'
      group by t.id
      order by total desc, t.name asc
      limit 20
    `,
  ]);
  return { categories, tags };
}

export default async function PostListing({
  basePath,
  page,
  categorySlug = null,
  tagSlug = null,
  q = null,
}: {
  basePath: string;
  page: number;
  categorySlug?: string | null;
  tagSlug?: string | null;
  q?: string | null;
}) {
  const offset = (page - 1) * PAGE_SIZE;
  const pattern = q ? `%${q}%` : null;

  const [posts, [{ total }], sidebar] = await Promise.all([
    sql`
      select p.id, p.slug, p.title, p.excerpt, p.content, p.cover_image_url, p.published_at,
             p.views_count::int as views_count,
             pr.full_name as author_name, pc.name as category_name, pc.slug as category_slug,
             (select count(*)::int from comments c where c.post_id = p.id and c.status = 'visible') as comment_count
      from posts p
      left join profiles pr on pr.id = p.author_id
      left join post_categories pc on pc.id = p.category_id
      where p.status = 'published'
        and (${categorySlug}::text is null or pc.slug = ${categorySlug})
        and (${tagSlug}::text is null or exists (
          select 1 from post_tags pt join tags t on t.id = pt.tag_id
          where pt.post_id = p.id and t.slug = ${tagSlug}))
        and (${pattern}::text is null or p.title ilike ${pattern} or p.excerpt ilike ${pattern})
      order by p.published_at desc nulls last, p.created_at desc
      limit ${PAGE_SIZE} offset ${offset}
    ` as unknown as Promise<ListedPost[]>,
    sql`
      select count(*)::int as total
      from posts p
      left join post_categories pc on pc.id = p.category_id
      where p.status = 'published'
        and (${categorySlug}::text is null or pc.slug = ${categorySlug})
        and (${tagSlug}::text is null or exists (
          select 1 from post_tags pt join tags t on t.id = pt.tag_id
          where pt.post_id = p.id and t.slug = ${tagSlug}))
        and (${pattern}::text is null or p.title ilike ${pattern} or p.excerpt ilike ${pattern})
    `,
    getBlogSidebarData(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const showFeatured = page === 1 && !q && posts.length > 0;
  const featured = showFeatured ? posts[0] : null;
  const rest = showFeatured ? posts.slice(1) : posts;

  function pageHref(n: number) {
    const params = new URLSearchParams();
    if (n > 1) params.set("page", String(n));
    if (q) params.set("q", q);
    const s = params.toString();
    return s ? `${basePath}?${s}` : basePath;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_300px]">
        <div className="flex min-w-0 flex-col gap-8">
          {posts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-neutral-300 bg-white px-6 py-20 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100">
                <Newspaper className="h-5 w-5 text-neutral-500" />
              </div>
              <h2 className="mt-5 text-lg font-semibold">No articles yet</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">
                {q ? "Nothing matched your search." : "New articles are on the way — check back soon."}
              </p>
            </div>
          ) : (
            <>
              {featured && <FeaturedPost post={featured} />}
              {rest.length > 0 && (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {rest.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </>
          )}

          {totalPages > 1 && (
            <nav aria-label="Pagination" className="flex items-center justify-between gap-3">
              {page > 1 ? (
                <Link href={pageHref(page - 1)} className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium hover:bg-neutral-50">
                  <ChevronLeft className="h-4 w-4" /> Newer
                </Link>
              ) : (
                <span />
              )}
              <span className="text-xs text-neutral-500">
                Page {page} of {totalPages}
              </span>
              {page < totalPages ? (
                <Link href={pageHref(page + 1)} className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium hover:bg-neutral-50">
                  Older <ChevronRight className="h-4 w-4" />
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}
        </div>

        <aside className="flex flex-col gap-5">
          <form action="/blog" className="rounded-3xl border border-neutral-200 bg-white p-5">
            <label htmlFor="blog-q" className="text-sm font-semibold text-neutral-950">
              Search articles
            </label>
            <input
              id="blog-q"
              type="search"
              name="q"
              defaultValue={q ?? ""}
              placeholder="e.g. Next.js, SEO…"
              className="mt-3 h-10 w-full rounded-xl border border-neutral-200 px-3.5 text-sm outline-none focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10"
            />
          </form>

          {sidebar.categories.length > 0 && (
            <div className="rounded-3xl border border-neutral-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-neutral-950">Categories</h3>
              <ul className="mt-3 flex flex-col gap-1">
                <li>
                  <Link href="/blog" className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm transition ${!categorySlug && !tagSlug ? "bg-neutral-950 text-white" : "text-neutral-600 hover:bg-neutral-100"}`}>
                    All articles
                  </Link>
                </li>
                {sidebar.categories.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/blog/category/${c.slug}`}
                      className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm transition ${categorySlug === c.slug ? "bg-neutral-950 text-white" : "text-neutral-600 hover:bg-neutral-100"}`}
                    >
                      {c.name}
                      <span className="text-xs opacity-60">{c.total}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {sidebar.tags.length > 0 && (
            <div className="rounded-3xl border border-neutral-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-neutral-950">Tags</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {sidebar.tags.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/blog/tag/${t.slug}`}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${tagSlug === t.slug ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-200 text-neutral-600 hover:border-neutral-300"}`}
                  >
                    #{t.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-3xl bg-neutral-950 p-6 text-white">
            <h3 className="text-base font-semibold">Have a project in mind?</h3>
            <p className="mt-2 text-sm leading-6 text-neutral-400">We build fast, modern websites and web apps.</p>
            <Link href="/contact" className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-neutral-200">
              Start a project
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}

function Meta({ post }: { post: ListedPost }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
      {post.published_at && <span>{formatDate(post.published_at)}</span>}
      <span className="inline-flex items-center gap-1">
        <Clock className="h-3 w-3" /> {readingTime(post.content)} min read
      </span>
      <span className="inline-flex items-center gap-1">
        <Eye className="h-3 w-3" /> {post.views_count}
      </span>
      <span className="inline-flex items-center gap-1">
        <MessageCircle className="h-3 w-3" /> {post.comment_count}
      </span>
    </div>
  );
}

function Cover({ post, className }: { post: ListedPost; className: string }) {
  return post.cover_image_url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={post.cover_image_url} alt="" loading="lazy" className={`${className} object-cover transition duration-700 group-hover:scale-105`} />
  ) : (
    <div className={`${className} flex items-center justify-center bg-[radial-gradient(circle_at_30%_20%,#fafafa,#e5e5e5)]`}>
      <Newspaper className="h-10 w-10 text-neutral-300" />
    </div>
  );
}

function FeaturedPost({ post }: { post: ListedPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group grid grid-cols-1 overflow-hidden rounded-3xl border border-neutral-200 bg-white transition hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] md:grid-cols-2">
      <div className="overflow-hidden">
        <Cover post={post} className="aspect-[16/10] h-full w-full" />
      </div>
      <div className="flex flex-col justify-center p-6 sm:p-8">
        {post.category_name && (
          <span className="w-fit rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">{post.category_name}</span>
        )}
        <h2 className="mt-4 text-2xl font-bold tracking-[-0.03em] text-neutral-950 group-hover:underline sm:text-3xl">{post.title}</h2>
        {post.excerpt && <p className="mt-3 line-clamp-3 text-sm leading-6 text-neutral-600">{post.excerpt}</p>}
        <div className="mt-5">
          <Meta post={post} />
        </div>
      </div>
    </Link>
  );
}

function PostCard({ post }: { post: ListedPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group flex flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white transition hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]">
      <div className="overflow-hidden">
        <Cover post={post} className="aspect-[16/9] w-full" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        {post.category_name && <span className="text-xs font-medium text-neutral-500">{post.category_name}</span>}
        <h3 className="mt-2 text-base font-semibold leading-snug text-neutral-950 group-hover:underline">{post.title}</h3>
        {post.excerpt && <p className="mt-2 line-clamp-2 flex-1 text-sm leading-6 text-neutral-600">{post.excerpt}</p>}
        <div className="mt-4">
          <Meta post={post} />
        </div>
      </div>
    </Link>
  );
}
