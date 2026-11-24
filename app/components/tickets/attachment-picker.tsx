"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, ImageIcon, Loader2, Paperclip, X } from "lucide-react";

import { compressImage, isCompressibleImage } from "@/lib/image-compress";
import { useSmoothProgress } from "@/lib/use-smooth-progress";
import {
  ATTACHMENT_ACCEPT,
  ATTACHMENT_TYPES,
  MAX_ATTACHMENT_SIZE,
  MAX_ATTACHMENTS_PER_MESSAGE,
  formatBytes,
  type UploadedAttachment,
} from "@/lib/tickets/attachments";

type Item = {
  id: string;
  file?: File;
  name: string;
  size: number;
  type: string;
  progress: number;
  phase: "optimizing" | "ready" | "uploading" | "uploaded";
  key?: string;
  error?: string;
};

/**
 * Lets people pick files for a ticket message. Photos are compressed in the
 * browser right away (WhatsApp-style), but nothing is uploaded until the form
 * is actually sent: on submit the files go straight to R2 with presigned URLs,
 * then the form continues with their keys. If the server rejects the message,
 * it deletes those uploads, and the next attempt uploads again.
 */
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
  const rootRef = useRef<HTMLDivElement>(null);
  const hiddenRef = useRef<HTMLInputElement>(null);
  const itemsRef = useRef<Item[]>([]);
  itemsRef.current = items;
  const sending = useRef(false);

  function patch(id: string, update: Partial<Item>) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...update } : it)));
  }

  async function prepare(original: File, id: string) {
    try {
      const file = isCompressibleImage(original)
        ? await compressImage(original, { onProgress: (p) => patch(id, { progress: p }) })
        : original;
      if (file.size > MAX_ATTACHMENT_SIZE) throw new Error("File is larger than 10 MB.");
      patch(id, { file, name: file.name, size: file.size, type: file.type, phase: "ready", progress: 0 });
    } catch (e) {
      patch(id, { error: e instanceof Error ? e.message : "Couldn't process this file." });
    }
  }

  async function uploadOne(item: Item): Promise<UploadedAttachment> {
    const file = item.file!;
    patch(item.id, { phase: "uploading", progress: 0 });
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
      xhr.upload.onprogress = (e) => e.lengthComputable && patch(item.id, { progress: Math.round((e.loaded / e.total) * 100) });
      xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error("Upload failed.")));
      xhr.onerror = () => reject(new Error("Upload failed. Check your connection."));
      xhr.send(file);
    });
    patch(item.id, { phase: "uploaded", progress: 100, key: json.key });
    return { key: json.key, name: file.name, size: file.size, type: file.type };
  }

  // Upload when the surrounding form is submitted, then let it continue.
  useEffect(() => {
    const form = rootRef.current?.closest("form");
    if (!form) return;
    const onSubmit = async (event: SubmitEvent) => {
      const pending = itemsRef.current.filter((it) => !it.error);
      if (sending.current || pending.length === 0) {
        sending.current = false;
        return;
      }
      if (pending.some((it) => it.phase === "optimizing")) {
        event.preventDefault();
        setError("Please wait — still preparing your files.");
        return;
      }
      event.preventDefault();
      setError(null);
      onBusyChange?.(true);
      try {
        const uploaded = await Promise.all(pending.map((it) => uploadOne(it)));
        if (hiddenRef.current) hiddenRef.current.value = JSON.stringify(uploaded);
        sending.current = true;
        form.requestSubmit(event.submitter instanceof HTMLElement ? (event.submitter as HTMLButtonElement) : undefined);
        // The keys were just sent. If this attempt fails the server deletes the
        // uploads, so a retry must upload again.
        if (hiddenRef.current) hiddenRef.current.value = "[]";
        setItems((prev) => prev.map((it) => (it.error ? it : { ...it, phase: "ready", key: undefined, progress: 0 })));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed.");
        setItems((prev) => prev.map((it) => (it.phase === "uploading" ? { ...it, phase: "ready", progress: 0 } : it)));
      } finally {
        onBusyChange?.(false);
      }
    };
    form.addEventListener("submit", onSubmit);
    return () => form.removeEventListener("submit", onSubmit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId]);

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
      setItems((prev) => [...prev, { id, name: file.name, size: file.size, type: file.type, progress: 0, phase: "optimizing" }]);
      void prepare(file, id);
    }
  }

  return (
    <div ref={rootRef} className="flex flex-col gap-2">
      <input ref={hiddenRef} type="hidden" name="attachments" defaultValue="[]" />
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
              <ItemStatus item={it} />
              <button
                type="button"
                aria-label={`Remove ${it.name}`}
                disabled={it.phase === "uploading"}
                onClick={() => setItems((prev) => prev.filter((x) => x.id !== it.id))}
                className="shrink-0 rounded-full p-0.5 hover:bg-neutral-200"
              >
                <X className="h-3 w-3" />
              </button>
              {(it.phase === "optimizing" || it.phase === "uploading") && !it.error && <ProgressLine value={it.progress} />}
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

function ItemStatus({ item }: { item: Item }) {
  const shown = useSmoothProgress(item.phase === "optimizing" || item.phase === "uploading" ? item.progress : null);
  if (item.error) return <span className="shrink-0">{item.error}</span>;
  if (item.phase === "optimizing")
    return (
      <span className="flex shrink-0 items-center gap-1 text-neutral-400">
        <Loader2 className="h-3 w-3 animate-spin" /> Optimizing {shown}%
      </span>
    );
  if (item.phase === "uploading")
    return (
      <span className="flex shrink-0 items-center gap-1 text-neutral-500">
        <Loader2 className="h-3 w-3 animate-spin" /> Uploading {shown}%
      </span>
    );
  return <span className="shrink-0 text-neutral-400">{formatBytes(item.size)}</span>;
}

function ProgressLine({ value }: { value: number }) {
  const shown = useSmoothProgress(value);
  return <span className="absolute bottom-0 left-0 h-0.5 bg-neutral-950" style={{ width: `${shown}%` }} />;
}
