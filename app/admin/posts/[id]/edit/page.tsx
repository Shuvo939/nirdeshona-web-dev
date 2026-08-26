import { sql } from "@/lib/db";
import { notFound } from "next/navigation";
import PostForm from "../../post-form";
import { updatePost } from "../../actions";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [[post], categories, tags, postTags] = await Promise.all([
    sql`
      select *
      from posts
      where id = ${id}
      limit 1
    `,
    sql`
      select id, name
      from post_categories
      order by name asc
    `,
    sql`
      select id, name, slug
      from tags
      order by name asc
    `,
    sql`
      select tag_id
      from post_tags
      where post_id = ${id}
    `,
  ]);

  if (!post) notFound();

  const updateWithId = updatePost.bind(null, id);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Edit Post</h1>

      <PostForm
        action={updateWithId}
        categories={categories.map((c) => ({
          id: String(c.id),
          name: String(c.name),
        }))}
        tags={tags.map((t) => ({
          id: String(t.id),
          name: String(t.name),
          slug: String(t.slug),
        }))}
        defaultValues={{
          title: String(post.title ?? ""),
          slug: String(post.slug ?? ""),
          excerpt: post.excerpt ? String(post.excerpt) : "",
          content: String(post.content ?? ""),
          category_id: post.category_id
            ? String(post.category_id)
            : "",
          status: String(post.status ?? "draft"),
          seo_title: post.seo_title
            ? String(post.seo_title)
            : "",
          seo_description: post.seo_description
            ? String(post.seo_description)
            : "",
          cover_image_url: post.cover_image_url
            ? String(post.cover_image_url)
            : "",
          tag_ids: postTags.map((t) => String(t.tag_id)),
        }}
      />
    </div>
  );
}