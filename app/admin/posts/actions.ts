"use server";

import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const PostSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().optional(),
  content: z.string().min(1),
  status: z.enum(["draft", "published", "archived"]),
});

function parseForm(formData: FormData) {
  return PostSchema.parse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt") || undefined,
    content: formData.get("content"),
    status: formData.get("status"),
  });
}

export async function createPost(formData: FormData) {
  const { userId } = await requireAdmin();
  const data = parseForm(formData);

  await sql`
    insert into posts (author_id, title, slug, excerpt, content, status, published_at)
    values (
      ${userId}, ${data.title}, ${data.slug}, ${data.excerpt ?? null}, ${data.content}, ${data.status},
      ${data.status === "published" ? sql`now()` : null}
    )
  `;

  revalidatePath("/admin/posts");
  redirect("/admin/posts");
}

export async function updatePost(id: string, formData: FormData) {
  await requireAdmin();
  const data = parseForm(formData);

  await sql`
    update posts set
      title = ${data.title},
      slug = ${data.slug},
      excerpt = ${data.excerpt ?? null},
      content = ${data.content},
      status = ${data.status},
      published_at = case when ${data.status} = 'published' and published_at is null then now() else published_at end,
      updated_at = now()
    where id = ${id}
  `;

  revalidatePath("/admin/posts");
  redirect("/admin/posts");
}

export async function deletePost(id: string) {
  await requireAdmin();
  await sql`delete from posts where id = ${id}`;
  revalidatePath("/admin/posts");
}
