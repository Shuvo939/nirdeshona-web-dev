import type { Post, Tag } from "./types";
import { renderMarkdown } from "./markdown";

export default function PostContent({
  post,
}: {
  post: Post;
}) {
  return (
    <article className="min-w-0">
      <div
        className="text-[15px] sm:text-base"
        dangerouslySetInnerHTML={{
          __html: renderMarkdown(post.content),
        }}
      />
    </article>
  );
}