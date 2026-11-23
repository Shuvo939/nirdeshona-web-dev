import { NextResponse } from "next/server";
import { z } from "zod";

import { logActivity } from "@/lib/audit";
import { getSessionUser } from "@/lib/auth/session";
import { sql } from "@/lib/db";
import { MEDIA_TYPES, maxSizeFor } from "@/lib/media";
import { headPublicObject, publicUrlFor } from "@/lib/r2";

export const runtime = "nodejs";

const Schema = z.object({
  key: z.string().regex(/^media\/\d{4}\/[0-9a-f-]{36}\.[a-z0-9]{2,4}$/),
  fileName: z.string().trim().min(1).max(200),
});

// Step 2: verify the object really landed in R2 (HEAD) and record it.
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (user?.role !== "ADMIN") return NextResponse.json({ error: "Not allowed." }, { status: 403 });

  const parsed = Schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid upload." }, { status: 400 });

  const head = await headPublicObject(parsed.data.key);
  if (!head || !(head.contentType in MEDIA_TYPES) || head.size > maxSizeFor(head.contentType)) {
    return NextResponse.json({ error: "Upload didn't complete. Please try again." }, { status: 400 });
  }

  const [file] = await sql`
    insert into files (owner_id, file_url, file_key, file_name, file_size, mime_type)
    values (${user.id}, ${publicUrlFor(parsed.data.key)}, ${parsed.data.key}, ${parsed.data.fileName}, ${head.size}, ${head.contentType})
    returning id, file_url, file_name, file_size, mime_type, created_at
  `;
  await logActivity(user.id, { action: "media.upload", entity: "media", entityId: file.id, summary: `Uploaded ${parsed.data.fileName}` });
  return NextResponse.json({ file });
}
