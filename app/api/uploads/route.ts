import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { uploadToR2 } from "@/lib/r2";
import { sql } from "@/lib/db";
import crypto from "crypto";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "application/pdf",
]);

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "application/pdf": "pdf",
};

export async function POST(request: Request) {
  try {
    const { userId } = await requireAdmin();

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No file provided." },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: "File is empty." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size cannot exceed 10 MB." },
        { status: 413 }
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "File type is not allowed." },
        { status: 415 }
      );
    }

    const extension = EXTENSIONS[file.type];
    const id = crypto.randomUUID();
    const key = `uploads/${new Date().getFullYear()}/${id}.${extension}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploaded = await uploadToR2({
      key,
      body: buffer,
      contentType: file.type,
    });

    const [savedFile] = await sql`
      insert into files (
        owner_id,
        file_url,
        file_key,
        file_name,
        file_size,
        mime_type
      )
      values (
        ${userId},
        ${uploaded.url},
        ${uploaded.key},
        ${file.name},
        ${file.size},
        ${file.type}
      )
      returning
        id,
        file_url,
        file_key,
        file_name,
        file_size,
        mime_type,
        created_at
    `;

    return NextResponse.json({
      success: true,
      file: savedFile,
    });
  } catch (error) {
    console.error("Upload error:", error);

    return NextResponse.json(
      { error: "Failed to upload file." },
      { status: 500 }
    );
  }
}