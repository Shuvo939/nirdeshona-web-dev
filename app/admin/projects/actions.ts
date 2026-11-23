"use server";

import { logActivity } from "@/lib/audit";

import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";
import { PROJECT_CATEGORIES } from "@/lib/projects/categories";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const ProjectSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required."),

  slug: z
    .string()
    .trim()
    .min(1, "Slug is required.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug can only contain lowercase letters, numbers, and hyphens."
    ),

  short_description: z
    .string()
    .trim()
    .optional(),

  description: z
    .string()
    .trim()
    .optional(),

  category: z
    .enum(PROJECT_CATEGORIES)
    .optional(),

  client_id: z
    .string()
    .uuid()
    .optional(),

  status: z.enum([
    "PLANNED",
    "IN_PROGRESS",
    "REVIEW",
    "COMPLETED",
    "ON_HOLD",
  ]),

  progress_percent: z.coerce
    .number()
    .int()
    .min(0)
    .max(100),

  featured: z.coerce.boolean(),

  cover_image_url: z
    .string()
    .trim()
    .optional(),

  live_url: z
    .string()
    .trim()
    .optional(),

  repository_url: z
    .string()
    .trim()
    .optional(),

  started_at: z
    .string()
    .trim()
    .optional(),

  completed_at: z
    .string()
    .trim()
    .optional(),
});

function parseOptionalString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed || undefined;
}

function parseForm(formData: FormData) {
  return ProjectSchema.parse({
    title: formData.get("title"),

    slug: formData.get("slug"),

    short_description: parseOptionalString(
      formData.get("short_description")
    ),

    description: parseOptionalString(
      formData.get("description")
    ),

    category: parseOptionalString(
      formData.get("category")
    ),

    client_id: parseOptionalString(
      formData.get("client_id")
    ),

    status: formData.get("status"),

    progress_percent:
      formData.get("progress_percent") || 0,

    featured:
      formData.get("featured") === "on",

    cover_image_url: parseOptionalString(
      formData.get("cover_image_url")
    ),

    live_url: parseOptionalString(
      formData.get("live_url")
    ),

    repository_url: parseOptionalString(
      formData.get("repository_url")
    ),

    started_at: parseOptionalString(
      formData.get("started_at")
    ),

    completed_at: parseOptionalString(
      formData.get("completed_at")
    ),
  });
}

/* =========================================================
   CREATE PROJECT
========================================================= */

export async function createProject(formData: FormData) {
  const { userId: actorId } = await requireAdmin();

  const data = parseForm(formData);

  await sql`
    insert into projects (
      client_id,
      title,
      slug,
      short_description,
      description,
      category,
      status,
      progress_percent,
      featured,
      cover_image_url,
      live_url,
      repository_url,
      started_at,
      completed_at
    )
    values (
      ${data.client_id ?? null},
      ${data.title},
      ${data.slug},
      ${data.short_description ?? null},
      ${data.description ?? null},
      ${data.category ?? null},
      ${data.status},
      ${data.progress_percent},
      ${data.featured},
      ${data.cover_image_url ?? null},
      ${data.live_url ?? null},
      ${data.repository_url ?? null},
      ${data.started_at ?? null},
      ${data.completed_at ?? null}
    )
  `;

  await logActivity(actorId, { action: "project.create", entity: "project", summary: `Created project “${String(formData.get("title") ?? "").trim()}”` });
  revalidatePath("/admin/projects");
  revalidatePath("/projects");

  redirect("/admin/projects");
}

/* =========================================================
   UPDATE PROJECT
========================================================= */

export async function updateProject(
  id: string,
  formData: FormData
) {
  const { userId: actorId } = await requireAdmin();

  const data = parseForm(formData);

  await sql`
    update projects
    set
      client_id = ${data.client_id ?? null},
      title = ${data.title},
      slug = ${data.slug},
      short_description = ${data.short_description ?? null},
      description = ${data.description ?? null},
      category = ${data.category ?? null},
      status = ${data.status},
      progress_percent = ${data.progress_percent},
      featured = ${data.featured},
      cover_image_url = ${data.cover_image_url ?? null},
      live_url = ${data.live_url ?? null},
      repository_url = ${data.repository_url ?? null},
      started_at = ${data.started_at ?? null},
      completed_at = ${data.completed_at ?? null},
      updated_at = now()
    where id = ${id}
  `;

  await logActivity(actorId, { action: "project.update", entity: "project", summary: `Updated project “${String(formData.get("title") ?? "").trim()}”` });
  revalidatePath("/admin/projects");
  revalidatePath("/projects");

  redirect("/admin/projects");
}

/* =========================================================
   DELETE PROJECT
========================================================= */

export async function deleteProject(id: string) {
  const { userId: actorId } = await requireAdmin();

  await sql`
    delete from projects
    where id = ${id}
  `;

  await logActivity(actorId, { action: "project.delete", entity: "project", summary: `Deleted a project` });
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
}