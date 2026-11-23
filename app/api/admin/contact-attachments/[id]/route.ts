import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth/session";
import { sql } from "@/lib/db";
import { hasR2, presignPrivateGet } from "@/lib/r2";

export const runtime = "nodejs";

// Admin-only: open a contact-form attachment through a 5-minute signed URL.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (user?.role !== "ADMIN") return new NextResponse("Not found", { status: 404 });

  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id) || !hasR2()) return new NextResponse("Not found", { status: 404 });

  const [row] = await sql`select attachment_url from contact_requests where id = ${id}`;
  const value: string | undefined = row?.attachment_url;
  if (!value) return new NextResponse("Not found", { status: 404 });

  // Older requests stored a public URL — just send the admin there.
  if (!value.startsWith("private:")) return NextResponse.redirect(value);

  const key = value.slice("private:".length);
  const fileName = key.split("/").pop()?.replace(/^[0-9a-f-]{36}-/, "") || "attachment";
  const inline = /\.(png|jpe?g|webp|gif|pdf)$/i.test(fileName);
  return NextResponse.redirect(await presignPrivateGet(key, fileName, inline), { headers: { "Cache-Control": "private, no-store" } });
}
