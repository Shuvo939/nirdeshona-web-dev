import { S3Client } from "@aws-sdk/client-s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { z } from "zod";

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
   R2
============================================================ */

const r2 =
  process.env.R2_ACCOUNT_ID &&
  process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_SECRET_ACCESS_KEY
    ? new S3Client({
        region: "auto",
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID,
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
        },
      })
    : null;

/* ============================================================
   ORIGIN
============================================================ */

function isAllowedOrigin(request: Request) {
  const origin = request.headers.get("origin");

  if (!origin) {
    return true;
  }

  const allowedOrigins = new Set(
    [
      process.env.NEXT_PUBLIC_SITE_URL,

      "https://nirdeshona.com",
      "https://www.nirdeshona.com",

      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ]
      .filter(Boolean)
      .map((value) => value!.replace(/\/+$/, ""))
  );

  return allowedOrigins.has(origin.replace(/\/+$/, ""));
}

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

    if (!r2 || !process.env.R2_BUCKET_NAME) {
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
    -------------------------------------------------------- */

    // Note: ContentLength is intentionally NOT included in the signed
    // command. R2 doesn't require it to be part of the signature, and
    // pinning it here makes the signed URL brittle — if the actual
    // upload's byte count ever drifts even slightly from `size`
    // (browser quirks, retries, etc.) the PUT gets rejected for no
    // good reason. `size` is still validated above against
    // MAX_FILE_SIZE before we ever issue a URL.
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
      Metadata: {
        source: "contact-form",
      },
    });

    const uploadUrl = await getSignedUrl(r2, command, {
      expiresIn: 600,
    });

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