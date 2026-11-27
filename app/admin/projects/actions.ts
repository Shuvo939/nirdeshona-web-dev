"use server";

import { refreshPublicContent } from "@/lib/public-cache";
import { logActivity } from "@/lib/audit";

import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";
import { PROJECT_CATEGORIES } from "@/lib/projects/categories";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { TransactionSql } from "postgres";
import { z } from "zod";

import { checkImageFile, discardStoredImage, pickImageFile, storeFormImage, type StoredImage } from "@/lib/media-server";

import { isHttpUrl } from "@/lib/safe-url";
import { moveToTrash } from "@/lib/trash";

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

  title_bn: z.string().trim().max(200).optional(),
  short_description_bn: z.string().trim().max(300).optional(),
  description_bn: z.string().trim().optional(),

  category: z
    .enum(PROJECT_CATEGORIES)
    .optional(),

  client_id: z.guid().optional(),

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
    .optional()
    .refine((v) => !v || isHttpUrl(v), "Must be a full http(s) URL"),

  live_url: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || isHttpUrl(v), "Must be a full http(s) URL"),

  repository_url: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || isHttpUrl(v), "Must be a full http(s) URL"),

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
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

export type ProjectFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

function readForm(formData: FormData) {
  const noRepo = formData.get("no_repository") === "on";
  return ProjectSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    short_description: parseOptionalString(formData.get("short_description")),
    description: parseOptionalString(formData.get("description"))?.replace(/\r\n?/g, "\n"),
    title_bn: parseOptionalString(formData.get("title_bn")),
    short_description_bn: parseOptionalString(formData.get("short_description_bn")),
    description_bn: parseOptionalString(formData.get("description_bn"))?.replace(/\r\n?/g, "\n"),
    category: parseOptionalString(formData.get("category")),
    client_id: parseOptionalString(formData.get("client_id")),
    status: formData.get("status"),
    progress_percent: formData.get("progress_percent") || 0,
    featured: formData.get("featured") === "on",
    cover_image_url: parseOptionalString(formData.get("cover_image_url")),
    live_url: parseOptionalString(formData.get("live_url")),
    repository_url: noRepo ? undefined : parseOptionalString(formData.get("repository_url")),
    started_at: parseOptionalString(formData.get("started_at")),
    completed_at: parseOptionalString(formData.get("completed_at")),
  });
}

function readTechnologies(formData: FormData) {
  const names = formData
    .getAll("technologies")
    .map((v) => String(v).trim().replace(/\s+/g, " "))
    .filter((v) => v.length > 0 && v.length <= 40);
  return [...new Map(names.map((n) => [n.toLowerCase(), n])).values()].slice(0, 40);
}

async function saveTechnologies(tx: TransactionSql, projectId: string, names: string[]) {
  await tx`delete from project_technologies where project_id = ${projectId}`;
  if (names.length === 0) return;
  // Reuse an existing technology whatever its capitalisation; create the rest.
  for (const name of names) {
    const [existing] = await tx`select id from technologies where lower(name) = lower(${name}) limit 1`;
    const techId = existing?.id ?? (await tx`insert into technologies (name) values (${name}) returning id`)[0].id;
    await tx`insert into project_technologies (project_id, technology_id) values (${projectId}, ${techId}) on conflict do nothing`;
  }
}

/**
 * Validates everything first; only then uploads a new cover image, so a
 * failed save never leaves files behind. If the database write fails after
 * the upload, the image is removed again.
 */
async function saveProject(id: string | null, formData: FormData): Promise<ProjectFormState> {
  const { userId: actorId } = await requireAdmin();

  const parsed = readForm(formData);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return { error: "Please check the highlighted fields.", fieldErrors };
  }
  const data = parsed.data;

  if (data.started_at && data.completed_at && data.completed_at < data.started_at) {
    return { fieldErrors: { completed_at: "Completed date can't be before the start date." } };
  }

  const [taken] = await sql`select 1 from projects where slug = ${data.slug} and id is distinct from ${id}::uuid limit 1`;
  if (taken) return { fieldErrors: { slug: "Another project already uses this slug." } };

  const coverFile = pickImageFile(formData, "cover_image_url_file");
  if (coverFile) {
    const problem = checkImageFile(coverFile);
    if (problem) return { fieldErrors: { cover_image_url: problem } };
  }

  const technologies = readTechnologies(formData);

  let stored: StoredImage | null = null;
  try {
    if (coverFile) stored = await storeFormImage(coverFile, actorId, `${data.slug}-cover`);
    const cover = stored?.url ?? data.cover_image_url ?? null;

    await sql.begin(async (tx) => {
      let projectId = id;
      if (id) {
        await tx`
          update projects set
            client_id = ${data.client_id ?? null}, title = ${data.title}, slug = ${data.slug},
            short_description = ${data.short_description ?? null}, description = ${data.description ?? null},
            title_bn = ${data.title_bn ?? null}, short_description_bn = ${data.short_description_bn ?? null},
            description_bn = ${data.description_bn ?? null},
            category = ${data.category ?? null}, status = ${data.status}, progress_percent = ${data.progress_percent},
            featured = ${data.featured}, cover_image_url = ${cover}, live_url = ${data.live_url ?? null},
            repository_url = ${data.repository_url ?? null}, started_at = ${data.started_at ?? null},
            completed_at = ${data.completed_at ?? null}, updated_at = now()
          where id = ${id}
        `;
      } else {
        const [row] = await tx`
          insert into projects (client_id, title, slug, short_description, description, title_bn, short_description_bn, description_bn, category, status,
                                progress_percent, featured, cover_image_url, live_url, repository_url, started_at, completed_at)
          values (${data.client_id ?? null}, ${data.title}, ${data.slug}, ${data.short_description ?? null},
                  ${data.description ?? null}, ${data.title_bn ?? null}, ${data.short_description_bn ?? null},
                  ${data.description_bn ?? null}, ${data.category ?? null}, ${data.status}, ${data.progress_percent},
                  ${data.featured}, ${cover}, ${data.live_url ?? null}, ${data.repository_url ?? null},
                  ${data.started_at ?? null}, ${data.completed_at ?? null})
          returning id
        `;
        projectId = row.id;
      }
      await saveTechnologies(tx, projectId!, technologies);
    });
  } catch (error) {
    await discardStoredImage(stored);
    console.error("saveProject failed", error);
    return { error: error instanceof Error && stored === null && coverFile ? error.message : "Couldn't save the project. Please try again." };
  }

  await logActivity(actorId, {
    action: id ? "project.update" : "project.create",
    entity: "project",
    summary: `${id ? "Updated" : "Created"} project “${data.title}”`,
  });
  revalidatePath("/admin/projects");
  refreshPublicContent();
  revalidatePath("/projects");
  revalidatePath(`/projects/${data.slug}`);
  refreshPublicContent();
  revalidatePath("/");
  redirect("/admin/projects");
}

export async function createProject(prev: ProjectFormState, formData: FormData): Promise<ProjectFormState> {
  return saveProject(null, formData);
}

export async function updateProject(id: string, prev: ProjectFormState, formData: FormData): Promise<ProjectFormState> {
  return saveProject(id, formData);
}

/* =========================================================
   DELETE PROJECT
========================================================= */

export async function deleteProject(id: string) {
  const { userId: actorId } = await requireAdmin();

  await moveToTrash("project", id, actorId);

  await logActivity(actorId, { action: "project.delete", entity: "project", summary: `Moved a project to the bin` });
  revalidatePath("/admin/projects");
  refreshPublicContent();
  revalidatePath("/projects");
}