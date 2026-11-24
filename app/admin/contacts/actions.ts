"use server";

import { logActivity } from "@/lib/audit";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/require-admin";
import { sql } from "@/lib/db";
import { moveToTrash } from "@/lib/trash";

const VALID_STATUSES = new Set(["new", "contacted", "closed"]);

export async function updateContactStatus(
  id: string,
  status: string
) {
  const { userId: actorId } = await requireAdmin();

  if (!VALID_STATUSES.has(status)) {
    throw new Error("Invalid status.");
  }

  await sql`
    update public.contact_requests
    set status = ${status}
    where id = ${id}
  `;

  await logActivity(actorId, { action: "contact.status", entity: "contact", summary: `Updated a contact request status` });
  revalidatePath("/admin/contacts");
  revalidatePath(`/admin/contacts/${id}`);
}

export async function deleteContact(id: string) {
  const { userId: actorId } = await requireAdmin();

  await moveToTrash("contact", id, actorId);

  await logActivity(actorId, { action: "contact.delete", entity: "contact", summary: `Moved a contact request to the bin` });
  revalidatePath("/admin/contacts");
  redirect("/admin/contacts");
}