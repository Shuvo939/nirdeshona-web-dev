import { NextResponse } from "next/server";

import { isAllowedOrigin } from "@/lib/same-origin";
import { z } from "zod";

import { hasR2, presignPrivatePut } from "@/lib/r2";

export const runtime = "nodejs";

/* ============================================================
   CONFIGURATION
============================================================ */

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_FILE_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
]);

const UploadSchema = z.object({
  fileName: z.string().trim().min(1).max(255),

  contentType: z.string().trim().min(1).max(150),

  size: z.number().int().positive().max(MAX_FILE_SIZE),
});


/* ============================================================
   ORIGIN
============================================================ */


/* ============================================================
   FILE NAME
============================================================ */

function getSafeFileName(fileName: string) {
  const extension = fileName.includes(".")
    ? fileName.split(".").pop()?.toLowerCase() || ""
    : "";

  const baseName = fileName
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

  return extension ? `${baseName || "attachment"}.${extension}` : baseName || "attachment";
}

/* ============================================================
   STORAGE KEY
============================================================ */

function createStorageKey(fileName: string) {
  const date = new Date();

  const year = date.getUTCFullYear();

  const month = String(date.getUTCMonth() + 1).padStart(2, "0");

  const randomId = crypto.randomUUID();

  return [
    "contact-attachments",
    year,
    month,
    `${randomId}-${getSafeFileName(fileName)}`,
  ].join("/");
}

/* ============================================================
   POST
============================================================ */

export async function POST(request: Request) {
  try {
    /* --------------------------------------------------------
       ORIGIN
    -------------------------------------------------------- */

    if (!isAllowedOrigin(request)) {
      return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
    }

    /* --------------------------------------------------------
       CONFIGURATION
    -------------------------------------------------------- */

    if (!hasR2()) {
      console.error("R2 storage is not configured.");

      return NextResponse.json(
        { error: "File upload is temporarily unavailable." },
        { status: 500 }
      );
    }

    /* --------------------------------------------------------
       BODY
    -------------------------------------------------------- */

    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json({ error: "Invalid attachment." }, { status: 400 });
    }

    const parsed = UploadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid attachment." }, { status: 400 });
    }

    const { fileName, contentType, size } = parsed.data;

    /* --------------------------------------------------------
       FILE TYPE
    -------------------------------------------------------- */

    if (!ALLOWED_FILE_TYPES.has(contentType)) {
      return NextResponse.json({ error: "Unsupported attachment type." }, { status: 400 });
    }

    /* --------------------------------------------------------
       STORAGE KEY
    -------------------------------------------------------- */

    const key = createStorageKey(fileName);

    /* --------------------------------------------------------
       PRESIGNED URL
       Private bucket (attachments may contain personal documents) and
       the size is part of the signature, so the browser can't upload a
       bigger file than it declared.
    -------------------------------------------------------- */

    const uploadUrl = await presignPrivatePut(key, contentType, size);

    return NextResponse.json(
      {
        ok: true,
        key,
        uploadUrl,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("R2 upload URL error:", error);

    return NextResponse.json(
      { error: "Could not prepare the file upload." },
      { status: 500 }
    );
  }
}