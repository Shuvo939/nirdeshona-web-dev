import PostForm from "../post-form";
import { createPost } from "../actions";

export default function NewPostPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">New Post</h1>
      <PostForm action={createPost} />
    </div>
  );
}
