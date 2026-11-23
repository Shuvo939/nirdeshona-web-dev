import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getSessionUser } from "@/lib/auth/session";
import { MEDIA_MAX_SIZE, MEDIA_TYPES } from "@/lib/media";
import { hasR2, presignPublicPut } from "@/lib/r2";

export const runtime = "nodejs";

const Schema = z.object({
  contentType: z.string().refine((t) => t in MEDIA_TYPES, "This file type isn't allowed."),
  size: z.number().int().positive().max(MEDIA_MAX_SIZE, "Files must be 25 MB or smaller."),
});

// Step 1: admin asks for a presigned PUT URL; the browser uploads straight to R2.
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (user?.role !== "ADMIN") return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  if (!hasR2()) return NextResponse.json({ error: "R2 isn't configured." }, { status: 503 });

  const parsed = Schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid file." }, { status: 400 });

  const { contentType, size } = parsed.data;
  const key = `media/${new Date().getFullYear()}/${crypto.randomUUID()}.${MEDIA_TYPES[contentType]}`;
  return NextResponse.json({ key, uploadUrl: await presignPublicPut(key, contentType, size) });
}
