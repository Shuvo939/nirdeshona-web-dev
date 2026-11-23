import Link from "next/link";
import { ChevronLeft, ChevronRight, Clock, Eye, Flame, Heart, MessageCircle, Newspaper, Rss, Sparkles, TrendingUp } from "lucide-react";

import { formatDate } from "@/app/components/marketing";
import { sql } from "@/lib/db";

const PAGE_SIZE = 9;

export type BlogSort = "latest" | "popular" | "discussed";

export function parseSort(v: string | undefined): BlogSort {
  return v === "popular" || v === "discussed" ? v : "latest";
}

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
  author_avatar: string | null;
  category_name: string | null;
  category_slug: string | null;
  comment_count: number;
  reaction_count: number;
};

function readingTime(content: string) {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}

export async function getBlogSidebarData() {
  const [categories, tags, popular, [stats]] = await Promise.all([
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
    sql`
      select slug, title, views_count::int as views_count, published_at
      from posts where status = 'published'
      order by views_count desc, published_at desc nulls last
      limit 5
    `,
    sql`
      select
        (select count(*)::int from posts where status = 'published') as articles,
        (select coalesce(sum(views_count), 0)::int from posts where status = 'published') as views,
        (select count(*)::int from comments c join posts p on p.id = c.post_id
          where c.status = 'visible' and p.status = 'published') as comments
    `,
  ]);
  return { categories, tags, popular, stats };
}

export default async function PostListing({
  basePath,
  page,
  categorySlug = null,
  tagSlug = null,
  q = null,
  sort = "latest",
}: {
  basePath: string;
  page: number;
  categorySlug?: string | null;
  tagSlug?: string | null;
  q?: string | null;
  sort?: BlogSort;
}) {
  const offset = (page - 1) * PAGE_SIZE;
  const pattern = q ? `%${q}%` : null;

  const [posts, [{ total }], sidebar] = await Promise.all([
    sql`
      select p.id, p.slug, p.title, p.excerpt, p.content, p.cover_image_url, p.published_at,
             p.views_count::int as views_count,
             pr.full_name as author_name, pr.avatar_url as author_avatar, pc.name as category_name, pc.slug as category_slug,
             (select count(*)::int from comments c where c.post_id = p.id and c.status = 'visible') as comment_count,
             (select count(*)::int from post_reactions r where r.post_id = p.id) as reaction_count
      from posts p
      left join profiles pr on pr.id = p.author_id
      left join post_categories pc on pc.id = p.category_id
      where p.status = 'published'
        and (${categorySlug}::text is null or pc.slug = ${categorySlug})
        and (${tagSlug}::text is null or exists (
          select 1 from post_tags pt join tags t on t.id = pt.tag_id
          where pt.post_id = p.id and t.slug = ${tagSlug}))
        and (${pattern}::text is null or p.title ilike ${pattern} or p.excerpt ilike ${pattern})
      order by
        case when ${sort}::text = 'popular' then p.views_count else 0 end desc,
        case when ${sort}::text = 'discussed' then (select count(*) from comments c where c.post_id = p.id and c.status = 'visible') else 0 end desc,
        p.published_at desc nulls last, p.created_at desc
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
  const showFeatured = page === 1 && !q && sort === "latest" && posts.length > 0;
  const featured = showFeatured ? posts[0] : null;
  const rest = showFeatured ? posts.slice(1) : posts;

  function pageHref(n: number) {
    const params = new URLSearchParams();
    if (n > 1) params.set("page", String(n));
    if (q) params.set("q", q);
    if (sort !== "latest") params.set("sort", sort);
    const s = params.toString();
    return s ? `${basePath}?${s}` : basePath;
  }

  function sortHref(next: BlogSort) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (next !== "latest") params.set("sort", next);
    const s = params.toString();
    return s ? `${basePath}?${s}` : basePath;
  }

  const pageNumbers = paginationRange(page, totalPages);
  const allActive = !categorySlug && !tagSlug;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_300px]">
        <div className="flex min-w-0 flex-col gap-8">
          <div className="flex flex-col gap-4">
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 [scrollbar-width:none]">
              <Link href="/blog" className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${allActive ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"}`}>
                All <span className="ml-1 opacity-60">{sidebar.stats?.articles ?? 0}</span>
              </Link>
              {sidebar.categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/blog/category/${c.slug}`}
                  className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${categorySlug === c.slug ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"}`}
                >
                  {c.name} <span className="ml-1 opacity-60">{c.total}</span>
                </Link>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-neutral-500">
                {q ? (
                  <>
                    {total} result{total === 1 ? "" : "s"} for <span className="font-semibold text-neutral-950">“{q}”</span>{" "}
                    <Link href={basePath} className="ml-1 underline">clear</Link>
                  </>
                ) : (
                  <>
                    {total} article{total === 1 ? "" : "s"}
                  </>
                )}
              </p>
              <div className="inline-flex rounded-full border border-neutral-200 bg-white p-1" role="tablist" aria-label="Sort articles">
                {([
                  ["latest", "Latest", Sparkles],
                  ["popular", "Popular", TrendingUp],
                  ["discussed", "Discussed", MessageCircle],
                ] as const).map(([key, label, Icon]) => (
                  <Link
                    key={key}
                    href={sortHref(key)}
                    role="tab"
                    aria-selected={sort === key}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${sort === key ? "bg-neutral-950 text-white" : "text-neutral-600 hover:text-neutral-950"}`}
                  >
                    <Icon className="h-3.5 w-3.5" /> {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

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
                  <ChevronLeft className="h-4 w-4" /> <span className="hidden sm:inline">Newer</span>
                </Link>
              ) : (
                <span />
              )}
              <div className="flex items-center gap-1">
                {pageNumbers.map((n, i) =>
                  n === null ? (
                    <span key={`gap-${i}`} className="px-1 text-sm text-neutral-400">…</span>
                  ) : (
                    <Link
                      key={n}
                      href={pageHref(n)}
                      aria-current={n === page ? "page" : undefined}
                      className={`flex h-9 min-w-9 items-center justify-center rounded-full px-2 text-sm font-medium transition ${n === page ? "bg-neutral-950 text-white" : "text-neutral-600 hover:bg-neutral-100"}`}
                    >
                      {n}
                    </Link>
                  ),
                )}
              </div>
              {page < totalPages ? (
                <Link href={pageHref(page + 1)} className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium hover:bg-neutral-50">
                  <span className="hidden sm:inline">Older</span> <ChevronRight className="h-4 w-4" />
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}
        </div>

        <aside className="flex flex-col gap-5">
          {basePath !== "/blog" && (
          <form action={basePath} className="rounded-3xl border border-neutral-200 bg-white p-5">
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
          )}

          {sidebar.popular.length > 0 && (
            <div className="rounded-3xl border border-neutral-200 bg-white p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-950">
                <Flame className="h-4 w-4 text-orange-500" /> Most read
              </h3>
              <ol className="mt-3 flex flex-col gap-1">
                {sidebar.popular.map((p, i) => (
                  <li key={p.slug}>
                    <Link href={`/blog/${p.slug}`} className="group flex gap-3 rounded-xl px-2 py-2 transition hover:bg-neutral-50">
                      <span className="text-lg font-bold leading-none text-neutral-300 group-hover:text-neutral-950">{String(i + 1).padStart(2, "0")}</span>
                      <span className="min-w-0">
                        <span className="line-clamp-2 text-sm font-medium leading-snug text-neutral-800">{p.title}</span>
                        <span className="mt-1 flex items-center gap-1 text-xs text-neutral-400">
                          <Eye className="h-3 w-3" /> {p.views_count.toLocaleString("en-US")} views
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 rounded-3xl border border-neutral-200 bg-white p-3 text-center">
            {[
              { label: "Articles", value: sidebar.stats?.articles ?? 0 },
              { label: "Reads", value: sidebar.stats?.views ?? 0 },
              { label: "Comments", value: sidebar.stats?.comments ?? 0 },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-neutral-50 px-2 py-3">
                <p className="text-lg font-bold text-neutral-950">{compact(s.value)}</p>
                <p className="text-[11px] text-neutral-500">{s.label}</p>
              </div>
            ))}
          </div>

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

          <a href="/blog/rss.xml" className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition hover:border-neutral-300">
            <Rss className="h-4 w-4 text-orange-500" /> Subscribe via RSS
          </a>
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
      {post.reaction_count > 0 && (
        <span className="inline-flex items-center gap-1">
          <Heart className="h-3 w-3" /> {post.reaction_count}
        </span>
      )}
    </div>
  );
}

function Author({ post }: { post: ListedPost }) {
  const name = post.author_name || "Nirdeshona Web";
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-950 text-[10px] font-bold text-white">
        {post.author_avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.author_avatar} alt="" className="h-full w-full object-cover" />
        ) : (
          name
            .split(" ")
            .map((p) => p[0])
            .slice(0, 2)
            .join("")
            .toUpperCase()
        )}
      </span>
      <span className="text-xs font-medium text-neutral-700">{name}</span>
    </div>
  );
}

function compact(n: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

function paginationRange(current: number, total: number): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out: (number | null)[] = [];
  sorted.forEach((n, i) => {
    if (i > 0 && n - sorted[i - 1] > 1) out.push(null);
    out.push(n);
  });
  return out;
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
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex w-fit items-center gap-1 rounded-full bg-neutral-950 px-3 py-1 text-xs font-semibold text-white">
            <Sparkles className="h-3 w-3" /> Latest
          </span>
          {post.category_name && (
            <span className="w-fit rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">{post.category_name}</span>
          )}
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-[-0.03em] text-neutral-950 group-hover:underline sm:text-3xl">{post.title}</h2>
        {post.excerpt && <p className="mt-3 line-clamp-3 text-sm leading-6 text-neutral-600">{post.excerpt}</p>}
        <div className="mt-5 flex flex-col gap-3">
          <Author post={post} />
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
        <div className="mt-4 flex flex-col gap-3 border-t border-neutral-100 pt-4">
          <Author post={post} />
          <Meta post={post} />
        </div>
      </div>
    </Link>
  );
}
