import Link from "@/app/components/locale-link";

import { ChevronRight, Eye, MessageCircle } from "lucide-react";

import { getI18n } from "@/lib/i18n/server";

import PostShareButton from "./post-share-button";
import type { Post } from "./types";

function initials(name: string | null) {
  if (!name) return "N";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

/**
 * Editorial post header: breadcrumb, title, standfirst, byline, a thin action
 * bar, then the cover. Left-aligned in the same column as the article body.
 */
export default async function PostHero({ post, commentCount }: { post: Post; commentCount: number }) {
  const { L, num, date } = await getI18n();
  const published = post.published_at || post.created_at;
  const minutes = Math.max(1, Math.round(post.content.trim().split(/\s+/).length / 220));
  const author = post.author_name || L("Nirdeshona Web", "নির্দেশনা ওয়েব");

  return (
    <header className="bg-white">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-12 px-5 pt-6 sm:px-8 sm:pt-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:px-10 lg:pt-14">
        <div className="min-w-0">
          <nav aria-label={L("Breadcrumb", "ব্রেডক্রাম্ব")} className="flex min-w-0 items-center gap-1 text-sm">
            <Link href="/blog" className="shrink-0 text-neutral-500 transition hover:text-neutral-950">
              {L("Blog", "ব্লগ")}
            </Link>
            {post.category_name && post.category_slug && (
              <>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-neutral-300" aria-hidden />
                <Link
                  href={`/blog/category/${post.category_slug}`}
                  className="truncate font-medium text-emerald-700 transition hover:text-emerald-800"
                >
                  {post.category_name}
                </Link>
              </>
            )}
          </nav>

          <h1 className="mt-4 text-[1.875rem] font-bold leading-[1.2] tracking-tight text-neutral-950 sm:text-4xl sm:leading-[1.15] lg:text-[2.75rem]">
            {post.title}
          </h1>

          {post.excerpt && <p className="mt-4 text-[17px] leading-7 text-neutral-600 sm:text-lg sm:leading-8">{post.excerpt}</p>}

          <div className="mt-7 flex items-center gap-3">
            {post.author_avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.author_avatar} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover" />
            ) : (
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white">
                {initials(post.author_name)}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold text-neutral-950">{author}</p>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-sm text-neutral-500">
                <time dateTime={new Date(published).toISOString()}>{date(published, { day: "numeric", month: "short", year: "numeric" })}</time>
                <span aria-hidden>·</span>
                <span>{L(`${minutes} min read`, `${num(minutes)} মিনিটে পড়া`)}</span>
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-1 border-y border-neutral-200 py-1.5 text-sm text-neutral-500">
            <span className="inline-flex h-9 items-center gap-1.5 px-2" title={L("Views", "পঠিত")}>
              <Eye className="h-[18px] w-[18px]" aria-hidden />
              <span className="sr-only">{L("Views", "পঠিত")}:</span>
              {num(Number(post.views_count))}
            </span>
            <a
              href="#comments"
              className="inline-flex h-9 items-center gap-1.5 rounded-full px-2 transition hover:bg-neutral-100 hover:text-neutral-950"
              title={L("Comments", "মন্তব্য")}
            >
              <MessageCircle className="h-[18px] w-[18px]" aria-hidden />
              <span className="sr-only">{L("Comments", "মন্তব্য")}:</span>
              {num(commentCount)}
            </a>
            <span className="ml-auto">
              <PostShareButton title={post.title} />
            </span>
          </div>

          {post.cover_image_url && (
            <figure className="mt-8 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.cover_image_url} alt={post.title} className="aspect-[16/9] w-full object-cover" fetchPriority="high" />
            </figure>
          )}
        </div>
      </div>
    </header>
  );
}
