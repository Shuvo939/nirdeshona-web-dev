import Link from "@/app/components/locale-link";
import { getI18n } from "@/lib/i18n/server";
import { ChevronRight } from "lucide-react";

import type {
  Post,
  Tag,
} from "./types";

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

export default async function PostSidebar({
  post,
  tags,
  commentCount,
}: {
  post: Post;
  tags: Tag[];
  commentCount: number;
}) {
  const { L, num, date } = await getI18n();
  const formatDate = (value: string | null) => date(value, { day: "numeric", month: "long", year: "numeric" });
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24 space-y-5">
        <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
            {L("Article", "লেখা")}
          </p>

          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-neutral-500">
                {L("Published", "প্রকাশিত")}
              </span>

              <span className="text-xs font-medium text-neutral-800">
                {formatDate(
                  post.published_at ||
                    post.created_at
                )}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-neutral-500">
                {L("Views", "পঠিত")}
              </span>

              <span className="text-xs font-medium text-neutral-800">
                {num(Number(post.views_count))}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-neutral-500">
                {L("Comments", "মন্তব্য")}
              </span>

              <span className="text-xs font-medium text-neutral-800">
                {num(commentCount)}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-neutral-200 bg-white p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
            {L("Written by", "লিখেছেন")}
          </p>

          <div className="mt-4 flex items-center gap-3">
            {post.author_avatar ? (
              <img
                src={post.author_avatar}
                alt={
                  post.author_name ||
                  L("Author", "লেখক")
                }
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-950 text-xs font-semibold text-white">
                {initials(
                  post.author_name
                )}
              </div>
            )}

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-neutral-900">
                {post.author_name ||
                  L("Nirdeshona", "নির্দেশনা")}
              </p>

              <p className="mt-0.5 text-xs text-neutral-500">
                {L("Author", "লেখক")}
              </p>
            </div>
          </div>
        </div>

        {tags.length > 0 && (
          <div className="rounded-3xl border border-neutral-200 bg-white p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
              {L("Topics", "বিষয়")}
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
          className="theme-fixed group flex items-center justify-between rounded-3xl border border-neutral-200 bg-neutral-950 p-5 text-white transition hover:bg-neutral-800"
        >
          <div>
            <p className="text-sm font-semibold">
              {L("Join the discussion", "আলোচনায় যোগ দিন")}
            </p>

            <p className="mt-1 text-xs text-neutral-400">
              {L(`${commentCount} comments`, `${num(commentCount)}টি মন্তব্য`)}
            </p>
          </div>

          <ChevronRight className="h-4 w-4 text-neutral-500 transition group-hover:translate-x-0.5 group-hover:text-white" />
        </Link>
      </div>
    </aside>
  );
}