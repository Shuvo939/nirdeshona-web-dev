"use server";

import { revalidatePath } from "next/cache";

import { logActivity } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/require-admin";
import { purgeExpiredTrash, purgeTrashItem, restoreFromTrash, TRASH_LABELS } from "@/lib/trash";

export type BinResult = { ok: boolean; message?: string };

const PUBLIC_PATHS: Record<string, string[]> = {
  post: ["/blog", "/"],
  project: ["/projects", "/"],
  client: ["/admin/clients", "/clients"],
  file: ["/admin/media"],
  contact: ["/admin/contacts"],
  comment: ["/admin/comments", "/blog"],
};

export async function restoreItem(id: string): Promise<BinResult> {
  const { userId } = await requireAdmin();
  try {
    const result = await restoreFromTrash(id);
    if (!result.ok) return { ok: false, message: "That item is no longer in the bin." };
    await logActivity(userId, { action: "bin.restore", entity: result.entity ?? "bin", summary: `Restored a ${TRASH_LABELS[result.entity!].toLowerCase()} from the bin` });
    for (const path of PUBLIC_PATHS[result.entity!] ?? []) revalidatePath(path);
    revalidatePath("/admin/bin");
    revalidatePath("/admin", "layout");
    return { ok: true, message: result.note ?? "Restored." };
  } catch (error) {
    console.error("restore failed", error);
    const code = (error as { code?: string })?.code;
    return {
      ok: false,
      message:
        code === "23503"
          ? "This belongs to something that's also deleted (for example, a comment on a deleted post). Restore that first."
          : "Couldn't restore this item. Please try again.",
    };
  }
}

export async function deleteForever(id: string): Promise<BinResult> {
  const { userId } = await requireAdmin();
  const item = await purgeTrashItem(id);
  if (item) await logActivity(userId, { action: "bin.purge", entity: item.entity, summary: `Permanently deleted “${item.label}”` });
  revalidatePath("/admin/bin");
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Deleted forever." };
}

export async function emptyBin(): Promise<BinResult> {
  const { userId } = await requireAdmin();
  const count = await purgeExpiredTrash(true);
  await logActivity(userId, { action: "bin.empty", entity: "bin", summary: `Emptied the bin (${count} item${count === 1 ? "" : "s"})` });
  revalidatePath("/admin/bin");
  revalidatePath("/admin", "layout");
  return { ok: true, message: `${count} item${count === 1 ? "" : "s"} deleted forever.` };
}
