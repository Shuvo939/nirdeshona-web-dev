"use client";

import ImageUploadField from "@/app/admin/image-upload-field";
import MarkdownEditor from "@/app/admin/markdown-editor";
import SubmitButton from "@/app/components/submit-button";

type Category = {
  id: string;
  name: string;
};

type Tag = {
  id: string;
  name: string;
  slug: string;
};

type PostFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  categories: Category[];
  tags: Tag[];
  defaultValues?: {
    title?: string;
    slug?: string;
    excerpt?: string | null;
    content?: string;
    category_id?: string | null;
    status?: string;
    seo_title?: string | null;
    seo_description?: string | null;
    title_bn?: string | null;
    excerpt_bn?: string | null;
    content_bn?: string | null;
    seo_title_bn?: string | null;
    seo_description_bn?: string | null;
    cover_image_url?: string | null;
    tag_ids?: string[];
  };
};

export default function PostForm({
  action,
  categories,
  tags,
  defaultValues,
}: PostFormProps) {
  const v = defaultValues ?? {};

  return (
    <form action={action} className="max-w-4xl space-y-6">
      <input type="hidden" name="existing_cover_image_url" value={v.cover_image_url ?? ""} />

      <div>
        <label className="block text-sm font-medium">Title</label>
        <input
          name="title"
          defaultValue={v.title ?? ""}
          required
          className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 outline-none focus:border-neutral-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Slug</label>
        <input
          name="slug"
          defaultValue={v.slug ?? ""}
          required
          className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 font-mono text-sm outline-none focus:border-neutral-400"
        />
        <p className="mt-1 text-xs text-neutral-500">
          Public URL: /blog/your-slug
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium">Excerpt</label>
        <textarea
          name="excerpt"
          defaultValue={v.excerpt ?? ""}
          rows={3}
          className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 outline-none focus:border-neutral-400"
        />
      </div>

      {/* Cover image */}
      <ImageUploadField
        name="cover_image_url"
        label="Cover image"
        initial={v.cover_image_url}
        variant="cover"
        hint="Shown on the blog list and at the top of the article. Compressed automatically and uploaded only when you save."
      />

      <div>
        <label className="block text-sm font-medium">Category</label>

        <select
          name="category_id"
          defaultValue={v.category_id ?? ""}
          className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 outline-none focus:border-neutral-400"
        >
          <option value="">No category</option>

          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium">Tags</label>

        <div className="mt-2 grid gap-2 rounded-xl border border-neutral-200 bg-neutral-50 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {tags.length > 0 ? (
            tags.map((tag) => (
              <label
                key={tag.id}
                className="flex cursor-pointer items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm hover:bg-neutral-100"
              >
                <input
                  type="checkbox"
                  name="tag_ids"
                  value={tag.id}
                  defaultChecked={v.tag_ids?.includes(tag.id)}
                  className="h-4 w-4 rounded border-neutral-300"
                />

                <span>{tag.name}</span>
              </label>
            ))
          ) : (
            <p className="text-xs text-neutral-500">
              No tags created yet.
            </p>
          )}
        </div>

        <div className="mt-3">
          <label className="text-xs font-medium text-neutral-600">
            Create new tags
          </label>

          <input
            name="new_tags"
            placeholder="nextjs, web development, technology"
            className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
          />

          <p className="mt-1 text-xs text-neutral-500">
            Separate multiple tags with commas.
          </p>
        </div>
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium">Content</label>
        <MarkdownEditor name="content" defaultValue={v.content ?? ""} required rows={22} placeholder="Write your article…" />
      </div>


      <fieldset lang="bn" className="space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 sm:p-5">
        <legend className="px-2 text-sm font-semibold text-emerald-900">Bangla version (বাংলা)</legend>
        <p className="text-xs text-neutral-500">
          Shown on /bn pages. Any field left empty falls back to the English text above (and English pages fall back to Bangla).
        </p>
        <div>
          <label className="block text-sm font-medium">Title (Bangla)</label>
          <input name="title_bn" defaultValue={v.title_bn ?? ""} className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 outline-none focus:border-neutral-400" />
        </div>
        <div>
          <label className="block text-sm font-medium">Excerpt (Bangla)</label>
          <textarea name="excerpt_bn" defaultValue={v.excerpt_bn ?? ""} rows={3} className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 outline-none focus:border-neutral-400" />
        </div>
        <div>
          <label className="block text-sm font-medium">Content (Bangla)</label>
          <MarkdownEditor name="content_bn" defaultValue={v.content_bn ?? ""} rows={18} placeholder="বাংলায় লেখাটি লিখুন…" />
        </div>
        <div>
          <label className="block text-sm font-medium">SEO title (Bangla)</label>
          <input name="seo_title_bn" defaultValue={v.seo_title_bn ?? ""} className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 outline-none focus:border-neutral-400" />
        </div>
        <div>
          <label className="block text-sm font-medium">SEO description (Bangla)</label>
          <textarea name="seo_description_bn" defaultValue={v.seo_description_bn ?? ""} rows={2} className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 outline-none focus:border-neutral-400" />
        </div>
      </fieldset>

      <div>
        <label className="block text-sm font-medium">Status</label>

        <select
          name="status"
          defaultValue={v.status ?? "draft"}
          className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 outline-none focus:border-neutral-400"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="border-t border-neutral-200 pt-6">
        <h2 className="text-base font-semibold">SEO</h2>

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium">
              SEO Title
            </label>

            <input
              name="seo_title"
              defaultValue={v.seo_title ?? ""}
              className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 outline-none focus:border-neutral-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              SEO Description
            </label>

            <textarea
              name="seo_description"
              defaultValue={v.seo_description ?? ""}
              rows={3}
              className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 outline-none focus:border-neutral-400"
            />
          </div>
        </div>
      </div>

      <SubmitButton
        pendingText="Saving…"
        className="inline-flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Save post
      </SubmitButton>
    </form>
  );
}