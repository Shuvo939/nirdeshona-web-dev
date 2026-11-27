import Link from "@/app/components/locale-link";

import { ArrowLeft, BookOpen, Eye, MessageCircle } from "lucide-react";

import { getI18n } from "@/lib/i18n/server";

import type { Post } from "./types";

function initials(name: string | null) {
  if (!name) return "U";

  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(
      (part) => part[0]?.toUpperCase()
    )
    .join("");
}

export default async function PostHero({
  post,
  commentCount,
}: {
  post: Post;
  commentCount: number;
}) {
  const { L, num, date } = await getI18n();
  const formatDate = (value: string | null) => date(value, { day: "numeric", month: "long", year: "numeric" });
  const minutes = Math.max(1, Math.round(post.content.trim().split(/\s+/).length / 220));
  return (
    <>
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

        <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-10 pt-8 sm:px-8 lg:px-10 lg:pb-20 lg:pt-14">
          <Link
            href="/blog"
            className="group inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition hover:text-neutral-950"
          >
            <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" />
            {L("Back to blog", "ব্লগে ফিরে যান")}
          </Link>

          <div className="mx-auto mt-8 max-w-4xl text-center sm:mt-12">
            {post.category_name &&
              post.category_slug && (
                <Link
                  href={`/blog/category/${post.category_slug}`}
                  className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500 shadow-sm transition hover:border-neutral-300 hover:text-neutral-900"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  {post.category_name}
                </Link>
              )}

            <h1 className="mt-6 text-[2rem] font-bold leading-[1.15] tracking-[-0.045em] text-neutral-950 sm:text-5xl sm:leading-[1.1] lg:text-6xl lg:leading-[1.05]">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-neutral-500 sm:mt-6 sm:text-lg sm:leading-8">
                {post.excerpt}
              </p>
            )}

            <div className="mx-auto mt-8 flex w-full max-w-xl items-center gap-3 rounded-2xl border border-neutral-200 bg-white/90 p-3 text-left shadow-sm backdrop-blur sm:p-3.5">
              {post.author_avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.author_avatar} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-white" />
              ) : (
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white">
                  {initials(post.author_name)}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-neutral-950">{post.author_name || L("Nirdeshona Web", "নির্দেশনা ওয়েব")}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-neutral-500">
                  <time dateTime={new Date(post.published_at || post.created_at).toISOString()}>{formatDate(post.published_at || post.created_at)}</time>
                  <span aria-hidden>·</span>
                  <span>{L(`${minutes} min read`, `${num(minutes)} মিনিটে পড়া`)}</span>
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1 border-l border-neutral-200 pl-2.5 text-xs font-medium text-neutral-600 sm:gap-2 sm:pl-3.5">
                <span className="inline-flex items-center gap-1 rounded-full px-1.5 py-1" title={L("Views", "পঠিত")}>
                  <Eye className="h-4 w-4 text-neutral-400" />
                  {num(Number(post.views_count))}
                </span>
                <a href="#comments" className="inline-flex items-center gap-1 rounded-full px-1.5 py-1 hover:bg-neutral-100" title={L("Comments", "মন্তব্য")}>
                  <MessageCircle className="h-4 w-4 text-neutral-400" />
                  {num(commentCount)}
                </a>
              </div>
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
    </>
  );
}