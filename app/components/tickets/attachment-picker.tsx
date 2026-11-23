"use client";

import { useRef, useState } from "react";
import { FileText, ImageIcon, Loader2, Paperclip, X } from "lucide-react";

import { compressImage, isCompressibleImage } from "@/lib/image-compress";
import {
  ATTACHMENT_ACCEPT,
  ATTACHMENT_TYPES,
  MAX_ATTACHMENT_SIZE,
  MAX_ATTACHMENTS_PER_MESSAGE,
  formatBytes,
  type UploadedAttachment,
} from "@/lib/tickets/attachments";

type Item = { id: string; name: string; size: number; type: string; progress: number; key?: string; error?: string };

// Uploads files straight to R2 with presigned URLs and exposes the
// resulting keys through a hidden "attachments" input for the form.
export default function AttachmentPicker({
  ticketId,
  onBusyChange,
}: {
  ticketId?: string;
  onBusyChange?: (busy: boolean) => void;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const busyCount = useRef(0);

  function patch(id: string, update: Partial<Item>) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...update } : it)));
  }

  function setBusy(delta: number) {
    busyCount.current += delta;
    onBusyChange?.(busyCount.current > 0);
  }

  async function uploadOne(original: File, id: string) {
    setBusy(1);
    try {
      // Photos of any size are compressed (WhatsApp-style) to ≤ 5 MB first.
      const file = isCompressibleImage(original) ? await compressImage(original) : original;
      if (file.size > MAX_ATTACHMENT_SIZE) throw new Error("File is larger than 10 MB.");
      patch(id, { name: file.name, size: file.size, type: file.type });
      const res = await fetch("/api/attachments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, fileName: file.name, contentType: file.type, size: file.size }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Upload failed.");

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", json.uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.upload.onprogress = (e) => e.lengthComputable && patch(id, { progress: Math.round((e.loaded / e.total) * 100) });
        xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error("Upload failed.")));
        xhr.onerror = () => reject(new Error("Upload failed. Check your connection."));
        xhr.send(file);
      });
      patch(id, { key: json.key, progress: 100 });
    } catch (e) {
      patch(id, { error: e instanceof Error ? e.message : "Upload failed." });
    } finally {
      setBusy(-1);
    }
  }

  function addFiles(list: FileList | null) {
    setError(null);
    if (!list) return;
    const files = Array.from(list);
    if (items.length + files.length > MAX_ATTACHMENTS_PER_MESSAGE) {
      setError(`You can attach up to ${MAX_ATTACHMENTS_PER_MESSAGE} files.`);
      return;
    }
    for (const file of files) {
      if (!(file.type in ATTACHMENT_TYPES)) {
        setError(`“${file.name}” isn't a supported file type.`);
        continue;
      }
      if (file.size > MAX_ATTACHMENT_SIZE && !isCompressibleImage(file)) {
        setError(`“${file.name}” is larger than 10 MB.`);
        continue;
      }
      const id = crypto.randomUUID();
      setItems((prev) => [...prev, { id, name: file.name, size: file.size, type: file.type, progress: 0 }]);
      void uploadOne(file, id);
    }
  }

  const uploaded: UploadedAttachment[] = items
    .filter((it) => it.key && !it.error)
    .map((it) => ({ key: it.key!, name: it.name, size: it.size, type: it.type }));

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name="attachments" value={JSON.stringify(uploaded)} />
      {items.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {items.map((it) => (
            <li
              key={it.id}
              className={`relative flex max-w-full items-center gap-2 overflow-hidden rounded-xl border px-3 py-2 text-xs ${
                it.error ? "border-red-200 bg-red-50 text-red-700" : "border-neutral-200 bg-neutral-50 text-neutral-700"
              }`}
            >
              {it.type.startsWith("image/") ? <ImageIcon className="h-3.5 w-3.5 shrink-0" /> : <FileText className="h-3.5 w-3.5 shrink-0" />}
              <span className="max-w-[160px] truncate font-medium">{it.name}</span>
              <span className="shrink-0 text-neutral-400">{it.error ?? (it.key ? formatBytes(it.size) : `${it.progress}%`)}</span>
              {!it.key && !it.error && <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />}
              <button
                type="button"
                aria-label={`Remove ${it.name}`}
                onClick={() => setItems((prev) => prev.filter((x) => x.id !== it.id))}
                className="shrink-0 rounded-full p-0.5 hover:bg-neutral-200"
              >
                <X className="h-3 w-3" />
              </button>
              {!it.key && !it.error && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-neutral-950 transition-all" style={{ width: `${it.progress}%` }} />
              )}
            </li>
          ))}
        </ul>
      )}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={items.length >= MAX_ATTACHMENTS_PER_MESSAGE}
          className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-950 disabled:opacity-50"
        >
          <Paperclip className="h-3.5 w-3.5" /> Attach files
        </button>
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ATTACHMENT_ACCEPT}
        className="hidden"
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
