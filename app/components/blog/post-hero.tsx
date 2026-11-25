import Link from "@/app/components/locale-link";

import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Eye,
  MessageCircle,
} from "lucide-react";

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

        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-14 pt-10 sm:px-8 lg:px-10 lg:pb-20 lg:pt-14">
          <Link
            href="/blog"
            className="group inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition hover:text-neutral-950"
          >
            <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" />
            {L("Back to blog", "ব্লগে ফিরে যান")}
          </Link>

          <div className="mx-auto mt-12 max-w-4xl text-center">
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
                    alt={
                      post.author_name ||
                      L("Author", "লেখক")
                    }
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-semibold text-white">
                    {initials(
                      post.author_name
                    )}
                  </div>
                )}

                <span className="font-medium text-neutral-700">
                  {post.author_name ||
                    L("Nirdeshona", "নির্দেশনা")}
                </span>
              </div>

              <span className="hidden h-1 w-1 rounded-full bg-neutral-300 sm:block" />

              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                {formatDate(
                  post.published_at ||
                    post.created_at
                )}
              </span>

              <span className="hidden h-1 w-1 rounded-full bg-neutral-300 sm:block" />

              <span className="inline-flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                {L(`${Number(post.views_count).toLocaleString("en-US")} views`, `${num(Number(post.views_count))} বার পঠিত`)}
              </span>

              <span className="hidden h-1 w-1 rounded-full bg-neutral-300 sm:block" />

              <span className="inline-flex items-center gap-1.5">
                <MessageCircle className="h-3.5 w-3.5" />
                {L(`${commentCount} comments`, `${num(commentCount)}টি কমেন্ট`)}
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
    </>
  );
}