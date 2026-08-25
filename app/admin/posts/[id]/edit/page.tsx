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
  const [post] = await sql`select * from posts where id = ${id}`;

  if (!post) notFound();

  const updateWithId = updatePost.bind(null, id);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Edit Post</h1>
      <PostForm action={updateWithId} defaultValues={post} />
    </div>
  );
}
