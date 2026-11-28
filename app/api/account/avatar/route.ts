import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { toAvatar } from "@/lib/image-process";

import { getSessionUser } from "@/lib/auth/session";
import { sql } from "@/lib/db";
import { deleteFromR2, hasR2, uploadToR2 } from "@/lib/r2";

export const runtime = "nodejs";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);

function keyFromUrl(url: string | null) {
  if (!url || !process.env.R2_PUBLIC_URL) return null;
  const base = process.env.R2_PUBLIC_URL.replace(/\/$/, "") + "/";
  return url.startsWith(base) ? url.slice(base.length) : null;
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  if (!hasR2()) return NextResponse.json({ error: "File storage is not configured yet." }, { status: 503 });

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  if (!ALLOWED.has(file.type)) return NextResponse.json({ error: "Please upload a JPG, PNG, WebP or GIF image." }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "Image must be smaller than 5 MB." }, { status: 400 });

  let body: Buffer;
  try {
    // Square-crop, resize and re-encode: strips metadata and keeps avatars small.
    body = await toAvatar(Buffer.from(await file.arrayBuffer()));
  } catch {
    return NextResponse.json({ error: "That image couldn't be processed." }, { status: 400 });
  }

  const key = `avatars/${user.id}/${crypto.randomUUID()}.webp`;
  let url: string;
  try {
    ({ url } = await uploadToR2({ key, body, contentType: "image/webp" }));
  } catch (error) {
    console.error("avatar upload failed", error);
    return NextResponse.json({ error: "Couldn't save the photo. Please try again." }, { status: 502 });
  }

  const oldKey = keyFromUrl(user.avatarUrl);
  await sql`update profiles set avatar_url = ${url} where id = ${user.id}`;
  if (oldKey?.startsWith(`avatars/${user.id}/`)) {
    await deleteFromR2(oldKey).catch(() => undefined);
  }

  return NextResponse.json({ url });
}

export async function DELETE() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const oldKey = keyFromUrl(user.avatarUrl);
  await sql`update profiles set avatar_url = null where id = ${user.id}`;
  if (oldKey?.startsWith(`avatars/${user.id}/`) && hasR2()) {
    await deleteFromR2(oldKey).catch(() => undefined);
  }
  return NextResponse.json({ ok: true });
}
