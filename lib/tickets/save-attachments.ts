import type { TransactionSql } from "postgres";

import { headPrivateObject, hasR2 } from "@/lib/r2";

import { ATTACHMENT_TYPES, MAX_ATTACHMENT_SIZE, allowedAttachmentKey, type UploadedAttachment } from "./attachments";

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
