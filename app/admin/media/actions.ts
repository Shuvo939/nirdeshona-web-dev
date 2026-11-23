"use server";

import { revalidatePath } from "next/cache";

import { logActivity } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/require-admin";
import { sql } from "@/lib/db";
import { deleteFromR2, hasR2 } from "@/lib/r2";

export async function deleteMedia(fileId: string) {
  const { userId } = await requireAdmin();
  const [file] = await sql`select file_key, file_name from files where id = ${fileId}`;
  if (!file) return;
  if (hasR2()) await deleteFromR2(file.file_key).catch((e) => console.error("R2 delete failed", e));
  await sql`delete from files where id = ${fileId}`;
  await logActivity(userId, { action: "media.delete", entity: "media", entityId: fileId, summary: `Deleted ${file.file_name}` });
  revalidatePath("/admin/media");
}
