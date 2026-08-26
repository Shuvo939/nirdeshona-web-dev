import { sql } from "@/lib/db";
import PostForm from "../post-form";
import { createPost } from "../actions";

export default async function NewPostPage() {
  const [categories, tags] = await Promise.all([
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
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">New Post</h1>

      <PostForm
        action={createPost}
        categories={categories.map((c) => ({
          id: String(c.id),
          name: String(c.name),
        }))}
        tags={tags.map((t) => ({
          id: String(t.id),
          name: String(t.name),
          slug: String(t.slug),
        }))}
      />
    </div>
  );
}