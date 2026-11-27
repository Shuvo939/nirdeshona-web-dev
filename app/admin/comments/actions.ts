"use server";

import { refreshPublicContent } from "@/lib/public-cache";
import { revalidatePath } from "next/cache";

import { logActivity } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/require-admin";
import { sql } from "@/lib/db";
import { moveToTrash } from "@/lib/trash";

async function postTitle(commentId: string) {
  const [row] = await sql`select p.title from comments c join posts p on p.id = c.post_id where c.id = ${commentId}`;
  return row?.title ?? "a post";
}

export async function setCommentStatus(commentId: string, status: "visible" | "hidden") {
  const { userId } = await requireAdmin();
  await sql`update comments set status = ${status}, updated_at = now() where id = ${commentId}`;
  if (status === "visible") await sql`update comment_reports set resolved_at = now() where comment_id = ${commentId} and resolved_at is null`;
  await logActivity(userId, {
    action: status === "hidden" ? "comment.hide" : "comment.restore",
    entity: "comment",
    entityId: commentId,
    summary: `${status === "hidden" ? "Hid" : "Restored"} a comment on “${await postTitle(commentId)}”`,
  });
  revalidatePath("/admin/comments");
  refreshPublicContent();
}

export async function deleteCommentAdmin(commentId: string) {
  const { userId } = await requireAdmin();
  const title = await postTitle(commentId);
  await moveToTrash("comment", commentId, userId);
  await logActivity(userId, { action: "comment.delete", entity: "comment", entityId: commentId, summary: `Moved a comment on “${title}” to the bin` });
  revalidatePath("/admin/comments");
  refreshPublicContent();
}

export async function dismissReports(commentId: string) {
  const { userId } = await requireAdmin();
  await sql`update comment_reports set resolved_at = now() where comment_id = ${commentId} and resolved_at is null`;
  await logActivity(userId, { action: "comment.dismiss_reports", entity: "comment", entityId: commentId, summary: `Dismissed reports on a comment on “${await postTitle(commentId)}”` });
  revalidatePath("/admin/comments");
  refreshPublicContent();
}
