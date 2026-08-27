import Link from "next/link";

import type { Post, Tag } from "./types";
import { renderMarkdown } from "./markdown";

export default function PostContent({
  post,
  tags,
}: {
  post: Post;
  tags: Tag[];
}) {
  return (
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
    </article>
  );
}