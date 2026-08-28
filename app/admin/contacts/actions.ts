"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/require-admin";
import { sql } from "@/lib/db";

const VALID_STATUSES = new Set(["new", "contacted", "closed"]);

export async function updateContactStatus(
  id: string,
  status: string
) {
  await requireAdmin();

  if (!VALID_STATUSES.has(status)) {
    throw new Error("Invalid status.");
  }

  await sql`
    update public.contact_requests
    set status = ${status}
    where id = ${id}
  `;

  revalidatePath("/admin/contacts");
  revalidatePath(`/admin/contacts/${id}`);
}

export async function deleteContact(id: string) {
  await requireAdmin();

  await sql`
    delete from public.contact_requests
    where id = ${id}
  `;

  revalidatePath("/admin/contacts");
  redirect("/admin/contacts");
}