import { Eye, MessageCircle } from "lucide-react";
import BlueprintBackdrop from "@/app/components/blueprint-backdrop";

import Breadcrumbs from "@/app/components/breadcrumbs";
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
 * Post header in the same style as the other page heroes (soft grid, one
 * border underneath), with an editorial, left-aligned layout: breadcrumb,
 * title, standfirst, then the byline and a compact stats/share row.
 */
export default async function PostHero({ post, commentCount }: { post: Post; commentCount: number }) {
  const { L, stat, date, num, digits } = await getI18n();
  const published = post.published_at || post.created_at;
  const minutes = Math.max(1, Math.round(post.content.trim().split(/\s+/).length / 220));
  const author = post.author_name || L("Nirdeshona Web", "নির্দেশনা ওয়েব");
  const crumbs = [
    { label: L("Blog", "ব্লগ"), href: "/blog" },
    ...(post.category_name && post.category_slug ? [{ label: post.category_name, href: `/blog/category/${post.category_slug}` }] : []),
  ];

  return (
    <section className="relative overflow-hidden border-b border-neutral-200">
      <BlueprintBackdrop focus="header" />

      <div className="relative mx-auto grid w-full max-w-6xl grid-cols-1 gap-12 px-5 pb-5 pt-6 sm:px-8 sm:pb-6 sm:pt-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:px-10 lg:pb-7 lg:pt-12">
        <div className="min-w-0">
          <Breadcrumbs items={crumbs} />

          <h1 className="mt-5 text-[1.875rem] font-bold leading-[1.2] tracking-tight text-neutral-950 sm:text-4xl sm:leading-[1.15] lg:text-[2.75rem]">
            {post.title}
          </h1>

          {post.excerpt && <p className="mt-4 text-[17px] leading-7 text-neutral-600 sm:text-lg sm:leading-8">{post.excerpt}</p>}

          <div className="mt-7 flex min-w-0 items-center gap-3">
            {post.author_avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.author_avatar} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-white" />
            ) : (
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white ring-2 ring-white">
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

          <div className="-mx-2 mt-5 flex items-center justify-between gap-2 text-sm text-neutral-500">
            <div className="flex items-center">
              <span className="inline-flex h-9 items-center gap-1.5 px-2" title={L("Views", "পঠিত")}>
                <Eye className="h-[18px] w-[18px]" aria-hidden />
                <span className="sr-only">{L("Views", "পঠিত")}:</span>
                {stat(Number(post.views_count))}
              </span>
            </div>
            <div className="flex items-center">
              <a
                href="#comments"
                className="inline-flex h-9 items-center gap-1.5 rounded-full px-2 transition hover:bg-black/[0.04] hover:text-neutral-950"
                title={L("Comments", "মন্তব্য")}
              >
                <MessageCircle className="h-[18px] w-[18px]" aria-hidden />
                <span className="sr-only">{L("Comments", "মন্তব্য")}:</span>
                {stat(commentCount)}
              </a>
              <PostShareButton title={post.title} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
