import type { TransactionSql } from "postgres";

import { sql } from "@/lib/db";
import { deletePrivateObject, headPrivateObject, hasR2 } from "@/lib/r2";

import { ATTACHMENT_TYPES, MAX_ATTACHMENT_SIZE, allowedAttachmentKey, parseAttachmentField, type UploadedAttachment } from "./attachments";

// Verifies each uploaded object really exists in R2 (HEAD) and records it.
// Size and type come from R2, not from the browser.
export async function verifyAttachments(files: UploadedAttachment[], ticketId: string, userId: string) {
  if (files.length === 0) return { ok: true as const, files: [] };
  if (!hasR2()) return { ok: false as const, error: "File uploads aren't configured yet." };

  const verified: (UploadedAttachment & { size: number; type: string })[] = [];
  for (const file of files) {
    if (!allowedAttachmentKey(file.key, ticketId, userId)) return { ok: false as const, error: "Invalid attachment." };
    const head = await headPrivateObject(file.key);
    if (!head) return { ok: false as const, error: `“${file.name}” didn't finish uploading. Please try again.` };
    if (head.size > MAX_ATTACHMENT_SIZE || !(head.contentType in ATTACHMENT_TYPES)) {
      return { ok: false as const, error: `“${file.name}” isn't an allowed file.` };
    }
    verified.push({ ...file, size: head.size, type: head.contentType });
  }
  return { ok: true as const, files: verified };
}

export async function insertAttachments(
  tx: TransactionSql,
  messageId: string,
  files: { key: string; name: string; size: number; type: string }[],
) {
  for (const f of files) {
    const [row] = await tx`
      insert into ticket_attachments (ticket_message_id, file_url, file_key, file_name, file_size, mime_type)
      values (${messageId}, '', ${f.key}, ${f.name}, ${f.size}, ${f.type})
      returning id
    `;
    // file_url points at the access-checked download route, never at R2 directly.
    await tx`update ticket_attachments set file_url = ${`/api/attachments/${row.id}`} where id = ${row.id}`;
  }
}

/**
 * Deletes files uploaded for a message that was then rejected (validation,
 * rate limit, closed ticket…), so a failed send never leaves files in R2.
 * Only keys this user may use and that aren't attached anywhere are removed.
 */
export async function discardUnsentAttachments(raw: FormDataEntryValue | null, ticketId: string, userId: string) {
  const parsed = parseAttachmentField(raw);
  if ("error" in parsed || parsed.length === 0 || !hasR2()) return;
  for (const file of parsed) {
    if (!allowedAttachmentKey(file.key, ticketId, userId)) continue;
    const [used] = await sql`select 1 from ticket_attachments where file_key = ${file.key} limit 1`;
    if (used) continue;
    await deletePrivateObject(file.key).catch(() => {});
  }
}
