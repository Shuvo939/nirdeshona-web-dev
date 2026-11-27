"use server";

import { refreshPublicContent } from "@/lib/public-cache";
import { logActivity } from "@/lib/audit";

import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";
import { moveToTrash } from "@/lib/trash";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { isHttpUrl } from "@/lib/safe-url";
import {
  checkImageFile,
  discardStoredImage,
  pickImageFile,
  storeFormImage,
  type StoredImage,
} from "@/lib/media-server";

const PostSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  slug: z.string().trim().min(1, "Slug is required."),
  excerpt: z.string().trim().optional(),
  content: z.string().min(1, "Content is required."),
  category_id: z.guid().optional().or(z.literal("")),
  status: z.enum(["draft", "published", "archived"]),
  seo_title: z.string().trim().optional(),
  seo_description: z.string().trim().optional(),
  title_bn: z.string().trim().optional(),
  excerpt_bn: z.string().trim().optional(),
  content_bn: z.string().optional(),
  seo_title_bn: z.string().trim().optional(),
  seo_description_bn: z.string().trim().optional(),
  cover_image_url: z
    .string()
    .url()
    .refine(isHttpUrl, "Must be an http(s) URL")
    .optional()
    .or(z.literal("")),
  cover_image_key: z.string().trim().optional(),
  existing_cover_image_url: z.string().url().optional().or(z.literal("")),
  remove_cover: z.enum(["true", "false"]).default("false"),
});

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseForm(formData: FormData) {
  return PostSchema.parse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt") || undefined,
    content: formData.get("content"),
    category_id: formData.get("category_id") || "",
    status: formData.get("status"),
    seo_title: formData.get("seo_title") || undefined,
    seo_description: formData.get("seo_description") || undefined,
    title_bn: formData.get("title_bn") || undefined,
    excerpt_bn: formData.get("excerpt_bn") || undefined,
    content_bn: formData.get("content_bn") || undefined,
    seo_title_bn: formData.get("seo_title_bn") || undefined,
    seo_description_bn: formData.get("seo_description_bn") || undefined,
    cover_image_url: formData.get("cover_image_url") || "",
    cover_image_key: formData.get("cover_image_key") || "",
    existing_cover_image_url: formData.get("existing_cover_image_url") || "",
    remove_cover: formData.get("remove_cover") || "false",
  });
}

async function syncTags(postId: string, formData: FormData) {
  const selectedIds = formData.getAll("tag_ids").map(String).filter(Boolean);

  const newTags = String(formData.get("new_tags") || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  const tagIds = new Set(selectedIds);

  for (const name of newTags) {
    const slug = slugify(name);
    if (!slug) continue;

    const [tag] = await sql`
      insert into tags (name, slug)
      values (${name}, ${slug})
      on conflict (slug)
      do update set name = excluded.name
      returning id
    `;

    if (tag) tagIds.add(String(tag.id));
  }

  await sql`delete from post_tags where post_id = ${postId}`;

  for (const tagId of tagIds) {
    await sql`
      insert into post_tags (post_id, tag_id)
      values (${postId}, ${tagId})
      on conflict do nothing
    `;
  }
}

/** A replaced cover goes to the bin (restorable for 30 days) instead of being deleted. */
async function removeOldCover(url: string, actorId: string) {
  if (!url) return;
  const [file] = await sql`select id from files where file_url = ${url} limit 1`;
  if (file?.id) await moveToTrash("file", String(file.id), actorId);
}

/** Validates the optional new cover, then stores it (call after parseForm succeeded). */
async function takeCover(
  formData: FormData,
  ownerId: string,
  slug: string,
): Promise<StoredImage | null> {
  const file = pickImageFile(formData, "cover_image_url_file");
  if (!file) return null;
  const problem = checkImageFile(file);
  if (problem) throw new Error(problem);
  return storeFormImage(file, ownerId, `${slug}-cover`);
}

export async function createPost(formData: FormData) {
  const { userId } = await requireAdmin();
  const data = parseForm(formData);
  const [taken] =
    await sql`select 1 from posts where slug = ${data.slug} limit 1`;
  if (taken) throw new Error("Another post already uses this slug.");

  const stored = await takeCover(formData, userId, data.slug);
  if (stored) data.cover_image_url = stored.url;

  let post;
  try {
    [post] = await sql`
    insert into posts (
      author_id,
      category_id,
      title,
      slug,
      excerpt,
      content,
      cover_image_url,
      status,
      seo_title,
      seo_description,
      title_bn,
      excerpt_bn,
      content_bn,
      seo_title_bn,
      seo_description_bn,
      published_at
    )
    values (
      ${userId},
      ${data.category_id || null},
      ${data.title},
      ${data.slug},
      ${data.excerpt || null},
      ${data.content},
      ${data.cover_image_url || null},
      ${data.status},
      ${data.seo_title || null},
      ${data.seo_description || null},
      ${data.title_bn || null},
      ${data.excerpt_bn || null},
      ${data.content_bn?.trim() ? data.content_bn : null},
      ${data.seo_title_bn || null},
      ${data.seo_description_bn || null},
      ${data.status === "published" ? sql`now()` : null}
    )
    returning id
  `;
  } catch (error) {
    await discardStoredImage(stored);
    throw error;
  }

  await syncTags(String(post.id), formData);

  await logActivity(userId, {
    action: "post.create",
    entity: "post",
    summary: `Created post “${String(formData.get("title") ?? "").trim()}”`,
  });
  revalidatePath("/admin/posts");
  refreshPublicContent();
  revalidatePath("/blog");
  redirect("/admin/posts");
}

export async function updatePost(id: string, formData: FormData) {
  const { userId: actorId } = await requireAdmin();

  const data = parseForm(formData);

  const [oldPost] = await sql`
    select cover_image_url
    from posts
    where id = ${id}
  `;

  const oldCover = oldPost?.cover_image_url
    ? String(oldPost.cover_image_url)
    : "";

  const [taken] = await sql`select 1 from posts where slug = ${data.slug} and id <> ${id} limit 1`;
  if (taken) throw new Error("Another post already uses this slug.");

  const stored = await takeCover(formData, actorId, data.slug);
  const coverUrl = stored?.url ?? (data.cover_image_url || "");

  try {
    await sql`
    update posts
    set
      category_id = ${data.category_id || null},
      title = ${data.title},
      slug = ${data.slug},
      excerpt = ${data.excerpt || null},
      content = ${data.content},
      cover_image_url = ${coverUrl || null},
      status = ${data.status},
      seo_title = ${data.seo_title || null},
      seo_description = ${data.seo_description || null},
      title_bn = ${data.title_bn || null},
      excerpt_bn = ${data.excerpt_bn || null},
      content_bn = ${data.content_bn?.trim() ? data.content_bn : null},
      seo_title_bn = ${data.seo_title_bn || null},
      seo_description_bn = ${data.seo_description_bn || null},
      published_at = case
        when ${data.status} = 'published'
          and published_at is null
        then now()
        when ${data.status} != 'published'
        then null
        else published_at
      end,
      updated_at = now()
    where id = ${id}
  `;
  } catch (error) {
    await discardStoredImage(stored);
    throw error;
  }

  await syncTags(id, formData);

  if (oldCover && oldCover !== coverUrl) {
    await removeOldCover(oldCover, actorId);
  }

  await logActivity(actorId, {
    action: "post.update",
    entity: "post",
    summary: `Updated post “${String(formData.get("title") ?? "").trim()}”`,
  });
  revalidatePath("/admin/posts");
  refreshPublicContent();
  revalidatePath("/blog");
  redirect("/admin/posts");
}

export async function deletePost(id: string) {
  const { userId: actorId } = await requireAdmin();

  // The post (with its comments, reactions and tags) goes to the bin; its
  // cover stays in the media library.
  await moveToTrash("post", id, actorId);

  await logActivity(actorId, {
    action: "post.delete",
    entity: "post",
    summary: `Moved a post to the bin`,
  });
  revalidatePath("/admin/posts");
  refreshPublicContent();
  revalidatePath("/blog");
}
