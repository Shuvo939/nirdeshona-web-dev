"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { logActivity } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/require-admin";
import { sql } from "@/lib/db";

const Role = z.enum(["ADMIN", "CLIENT", "USER"]);

async function nameOf(userId: string) {
  const [row] = await sql`select coalesce(p.full_name, u.email) as name from profiles p left join auth.users u on u.id = p.id where p.id = ${userId}`;
  return row?.name ?? "a user";
}

export async function setUserRole(userId: string, formData: FormData) {
  const { userId: me } = await requireAdmin();
  if (userId === me) return; // never change your own role from the UI
  const role = Role.safeParse(formData.get("role"));
  if (!role.success) return;

  if (role.data !== "ADMIN") {
    const [{ admins }] = await sql`select count(*)::int as admins from profiles where role = 'ADMIN' and id <> ${userId}`;
    if (admins === 0) return; // keep at least one admin
  }

  await sql`update profiles set role = ${role.data} where id = ${userId}`;
  await logActivity(me, { action: "user.role", entity: "user", entityId: userId, summary: `Changed ${await nameOf(userId)}'s role to ${role.data.toLowerCase()}` });
  revalidatePath("/admin/users");
}

export async function setUserBanned(userId: string, banned: boolean) {
  const { userId: me } = await requireAdmin();
  if (userId === me) return;
  await sql`update profiles set is_banned = ${banned} where id = ${userId} and role <> 'ADMIN'`;
  await logActivity(me, {
    action: banned ? "user.suspend" : "user.unsuspend",
    entity: "user",
    entityId: userId,
    summary: `${banned ? "Suspended" : "Reinstated"} ${await nameOf(userId)}`,
  });
  revalidatePath("/admin/users");
}
