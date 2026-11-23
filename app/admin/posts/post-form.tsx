"use client";

import { uploadMedia } from "@/lib/media-upload";
import { useState } from "react";
import Image from "next/image";

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

  const [coverUrl, setCoverUrl] = useState(v.cover_image_url ?? "");
  const [coverKey, setCoverKey] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [removeCover, setRemoveCover] = useState(false);

  async function handleCoverUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    setUploadError(null);
    try {
      const uploaded = await uploadMedia(file);
      setCoverUrl(uploaded.file_url);
      setCoverKey(uploaded.key);
      setRemoveCover(false);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Failed to upload cover image.");
    } finally {
      setUploading(false);
    }
  }

  function removeCoverImage() {
    setCoverUrl("");
    setCoverKey("");
    setRemoveCover(true);
  }

  return (
    <form action={action} className="max-w-4xl space-y-6">
      <input type="hidden" name="cover_image_url" value={coverUrl} />
      <input type="hidden" name="cover_image_key" value={coverKey} />
      <input
        type="hidden"
        name="existing_cover_image_url"
        value={v.cover_image_url ?? ""}
      />
      <input
        type="hidden"
        name="remove_cover"
        value={removeCover ? "true" : "false"}
      />

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
      <div>
        <label className="block text-sm font-medium">Cover Image</label>

        {coverUrl ? (
          <div className="mt-2 overflow-hidden rounded-xl border border-neutral-200">
            <div className="relative aspect-[16/9] w-full bg-neutral-100">
              <Image
                src={coverUrl}
                alt="Post cover"
                fill
                unoptimized
                className="object-cover"
              />
            </div>

            <div className="flex items-center justify-between border-t border-neutral-200 bg-white p-3">
              <span className="truncate text-xs text-neutral-500">
                Cover image uploaded
              </span>

              <button
                type="button"
                onClick={removeCoverImage}
                className="text-xs font-medium text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-12 text-center transition hover:border-neutral-400 hover:bg-neutral-100">
            <span className="text-sm font-medium text-neutral-700">
              {uploading ? "Uploading..." : "Upload cover image"}
            </span>

            <span className="mt-1 text-xs text-neutral-500">
              JPG, PNG, WEBP, GIF or AVIF · large photos are compressed automatically
            </span>

            {uploadError && <span className="mt-2 text-xs font-medium text-red-600">{uploadError}</span>}

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              onChange={handleCoverUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        )}
      </div>

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
        <label className="block text-sm font-medium">Content</label>

        <textarea
          name="content"
          defaultValue={v.content ?? ""}
          required
          rows={24}
          className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 font-mono text-sm leading-6 outline-none focus:border-neutral-400"
        />

        <p className="mt-1 text-xs text-neutral-500">
          Markdown content.
        </p>
      </div>

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

      <button
        type="submit"
        disabled={uploading}
        className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "Save Post"}
      </button>
    </form>
  );
}