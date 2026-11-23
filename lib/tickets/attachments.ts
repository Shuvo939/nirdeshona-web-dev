export const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;
export const MAX_ATTACHMENTS_PER_MESSAGE = 5;

export const ATTACHMENT_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "application/pdf": "pdf",
  "text/plain": "txt",
  "application/zip": "zip",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
};

export const ATTACHMENT_ACCEPT = Object.keys(ATTACHMENT_TYPES).join(",");

export type UploadedAttachment = { key: string; name: string; size: number; type: string };

export function formatBytes(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.ceil(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

const KEY_PATTERN = /^(tickets|uploads)\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.[a-z]{2,4}$/;

export function parseAttachmentField(raw: FormDataEntryValue | null): UploadedAttachment[] | { error: string } {
  if (!raw || typeof raw !== "string" || raw === "[]") return [];
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return { error: "Attachments couldn't be read. Please re-attach the files." };
  }
  if (!Array.isArray(value)) return { error: "Invalid attachments." };
  if (value.length > MAX_ATTACHMENTS_PER_MESSAGE) return { error: `Attach at most ${MAX_ATTACHMENTS_PER_MESSAGE} files.` };
  const out: UploadedAttachment[] = [];
  for (const item of value) {
    if (
      !item ||
      typeof item.key !== "string" ||
      !KEY_PATTERN.test(item.key) ||
      typeof item.name !== "string" ||
      item.name.length === 0 ||
      item.name.length > 200
    ) {
      return { error: "Invalid attachment." };
    }
    out.push({ key: item.key, name: item.name, size: Number(item.size) || 0, type: String(item.type) });
  }
  return out;
}

// Keys a given user may attach to a given ticket.
export function allowedAttachmentKey(key: string, ticketId: string, userId: string) {
  return key.startsWith(`tickets/${ticketId}/`) || key.startsWith(`uploads/${userId}/`);
}
