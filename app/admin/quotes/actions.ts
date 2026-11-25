"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { logActivity } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/require-admin";
import { sql } from "@/lib/db";
import { moveToTrash } from "@/lib/trash";

import { QUOTE_STATUSES } from "./shared";

export async function updateQuote(id: string, formData: FormData) {
  const { userId } = await requireAdmin();
  const status = String(formData.get("status") ?? "");
  const note = String(formData.get("admin_note") ?? "").trim().slice(0, 4000);
  if (!QUOTE_STATUSES.some((s) => s.value === status)) throw new Error("Invalid status.");

  await sql`update quote_requests set status = ${status}, admin_note = ${note || null}, updated_at = now() where id = ${id}`;
  await logActivity(userId, { action: "quote.update", entity: "quote", summary: `Updated a quote request (${status})` });
  revalidatePath("/admin/quotes");
  revalidatePath(`/admin/quotes/${id}`);
}

export async function deleteQuote(id: string) {
  const { userId } = await requireAdmin();
  await moveToTrash("quote", id, userId);
  await logActivity(userId, { action: "quote.delete", entity: "quote", summary: "Moved a quote request to the bin" });
  revalidatePath("/admin/quotes");
  redirect("/admin/quotes");
}
