"use server";

import { revalidatePath } from "next/cache";

import { logActivity } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/require-admin";
import { sql } from "@/lib/db";
import { moveToTrash } from "@/lib/trash";

export async function deleteMedia(fileId: string) {
  const { userId } = await requireAdmin();
  const [file] = await sql`select file_key, file_name from files where id = ${fileId}`;
  if (!file) return;
  await moveToTrash("file", fileId, userId);
  await logActivity(userId, { action: "media.delete", entity: "media", entityId: fileId, summary: `Moved ${file.file_name} to the bin` });
  revalidatePath("/admin/media");
}
