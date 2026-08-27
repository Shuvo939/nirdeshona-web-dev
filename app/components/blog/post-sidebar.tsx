import Link from "next/link";
import { ChevronRight } from "lucide-react";

import type {
  Post,
  Tag,
} from "./types";

function formatDate(date: string | null) {
  if (!date) return "";

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

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

export default function PostSidebar({
  post,
  tags,
  commentCount,
}: {
  post: Post;
  tags: Tag[];
  commentCount: number;
}) {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24 space-y-5">
        <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
            Article
          </p>

          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-neutral-500">
                Published
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
                Views
              </span>

              <span className="text-xs font-medium text-neutral-800">
                {Number(
                  post.views_count
                ).toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-neutral-500">
                Comments
              </span>

              <span className="text-xs font-medium text-neutral-800">
                {commentCount}
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
                alt={
                  post.author_name ||
                  "Author"
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
                  "Nirdeshona"}
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
              {commentCount} comments
            </p>
          </div>

          <ChevronRight className="h-4 w-4 text-neutral-500 transition group-hover:translate-x-0.5 group-hover:text-white" />
        </Link>
      </div>
    </aside>
  );
}