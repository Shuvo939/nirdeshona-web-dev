export default function PostForm({
  action,
  defaultValues,
}: {
  action: (formData: FormData) => void;
  defaultValues?: {
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    status?: string;
  };
}) {
  const v = defaultValues ?? {};

  return (
    <form action={action} className="max-w-xl space-y-4">
      <div>
        <label className="block text-sm font-medium">Title</label>
        <input name="title" defaultValue={v.title} required className="mt-1 w-full rounded border p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium">Slug (URL)</label>
        <input name="slug" defaultValue={v.slug} required className="mt-1 w-full rounded border p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium">Excerpt</label>
        <input name="excerpt" defaultValue={v.excerpt} className="mt-1 w-full rounded border p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium">Content (Markdown)</label>
        <textarea name="content" defaultValue={v.content} required rows={12} className="mt-1 w-full rounded border p-2 font-mono text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium">Status</label>
        <select name="status" defaultValue={v.status ?? "draft"} className="mt-1 w-full rounded border p-2">
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>
      <button type="submit" className="rounded bg-black px-4 py-2 text-white">
        Save
      </button>
    </form>
  );
}
