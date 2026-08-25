import { sql } from "@/lib/db";
import { deletePost } from "./actions";

export default async function AdminPostsPage() {
  const posts = await sql`
    select id, title, slug, status, views_count, published_at
    from posts
    order by created_at desc
  `;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Posts</h1>
        <a href="/admin/posts/new" className="rounded bg-black px-4 py-2 text-sm text-white">
          + New Post
        </a>
      </div>

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b text-neutral-500">
            <th className="py-2">Title</th>
            <th>Status</th>
            <th>Views</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {posts.map((p) => (
            <tr key={p.id} className="border-b">
              <td className="py-2">{p.title}</td>
              <td>{p.status}</td>
              <td>{p.views_count}</td>
              <td className="space-x-3 text-right">
                <a href={`/admin/posts/${p.id}/edit`} className="text-blue-600 hover:underline">
                  Edit
                </a>
                <form
                  action={async () => {
                    "use server";
                    await deletePost(p.id);
                  }}
                  className="inline"
                >
                  <button type="submit" className="text-red-600 hover:underline">
                    Delete
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
