"use server";

import { logActivity } from "@/lib/audit";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import type { FormState } from "@/app/(account)/client/actions";
import { requireAdmin } from "@/lib/auth/require-admin";
import { sql } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { site } from "@/lib/site";

const ClientSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120, "Name is too long"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens"),
  contact_email: z.union([z.string().trim().email("Invalid email"), z.literal("")]),
  contact_phone: z.string().trim().max(30, "Too long"),
  logo_url: z.union([z.string().trim().url("Must be a full URL (https://…)"), z.literal("")]),
  notes: z.string().trim().max(2000, "Notes are too long"),
});

function parse(formData: FormData) {
  return ClientSchema.safeParse({
    name: formData.get("name") ?? "",
    slug: formData.get("slug") ?? "",
    contact_email: formData.get("contact_email") ?? "",
    contact_phone: formData.get("contact_phone") ?? "",
    logo_url: formData.get("logo_url") ?? "",
    notes: formData.get("notes") ?? "",
  });
}

function errorsOf(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) out[String(issue.path[0])] ??= issue.message;
  return out;
}

export async function saveClient(clientId: string | null, _prev: FormState, formData: FormData): Promise<FormState> {
  const { userId: actorId } = await requireAdmin();
  const parsed = parse(formData);
  if (!parsed.success) return { fieldErrors: errorsOf(parsed.error) };
  const v = parsed.data;

  const [dupe] = await sql`
    select 1 from clients where slug = ${v.slug} and (${clientId}::uuid is null or id <> ${clientId}::uuid)
  `;
  if (dupe) return { fieldErrors: { slug: "Another client already uses this slug" } };

  let id = clientId;
  if (clientId) {
    await sql`
      update clients set name = ${v.name}, slug = ${v.slug}, contact_email = ${v.contact_email || null},
        contact_phone = ${v.contact_phone || null}, logo_url = ${v.logo_url || null}, notes = ${v.notes || null},
        updated_at = now()
      where id = ${clientId}
    `;
  } else {
    const [row] = await sql`
      insert into clients (name, slug, contact_email, contact_phone, logo_url, notes)
      values (${v.name}, ${v.slug}, ${v.contact_email || null}, ${v.contact_phone || null}, ${v.logo_url || null}, ${v.notes || null})
      returning id
    `;
    id = row.id;
  }

  await logActivity(actorId, { action: "client.save", entity: "client", summary: `Saved client “${String(formData.get("name") ?? "").trim()}”` });
  revalidatePath("/admin/clients");
  revalidatePath("/clients");
  if (!clientId) redirect(`/admin/clients/${id}`);
  return { ok: true };
}

export async function deleteClient(clientId: string) {
  const { userId: actorId } = await requireAdmin();
  await sql`delete from clients where id = ${clientId}`;
  await logActivity(actorId, { action: "client.delete", entity: "client", summary: `Deleted a client` });
  revalidatePath("/admin/clients");
  revalidatePath("/clients");
  redirect("/admin/clients");
}

export async function addClientMember(clientId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const { userId: actorId } = await requireAdmin();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { fieldErrors: { email: "Enter a valid email" } };

  const [user] = await sql`
    select p.id, p.role, p.full_name from auth.users u join profiles p on p.id = u.id
    where lower(u.email) = ${email} limit 1
  `;
  if (!user) {
    return { error: "No account with that email yet. Ask them to register first, then add them here." };
  }

  const [client] = await sql`select name from clients where id = ${clientId}`;
  if (!client) return { error: "Client not found." };

  await sql`
    insert into client_members (client_id, user_id) values (${clientId}, ${user.id})
    on conflict do nothing
  `;
  if (user.role === "USER") {
    await sql`update profiles set role = 'CLIENT' where id = ${user.id}`;
  }
  await sql`
    insert into notifications (user_id, type, title, message, link)
    values (${user.id}, 'access', ${`You now have access to ${client.name}`},
            'Your client portal is ready — see project progress and open support tickets.', '/client')
  `;
  await sendEmail({
    to: email,
    subject: `Your ${site.name} client portal is ready`,
    heading: `Welcome${user.full_name ? `, ${user.full_name}` : ""}!`,
    body: `Your account is now linked to ${client.name}. In the client portal you can follow project progress, open support tickets and talk to our team.`,
    cta: { label: "Open client portal", url: `${site.url}/client` },
  });

  await logActivity(actorId, { action: "client.member_add", entity: "client", summary: `Gave ${email} access to a client portal` });
  revalidatePath(`/admin/clients/${clientId}`);
  return { ok: true };
}

export async function removeClientMember(clientId: string, userId: string) {
  const { userId: actorId } = await requireAdmin();
  await sql`delete from client_members where client_id = ${clientId} and user_id = ${userId}`;
  // Downgrade to USER if they no longer belong to any client (never touch admins).
  await sql`
    update profiles set role = 'USER'
    where id = ${userId} and role = 'CLIENT'
      and not exists (select 1 from client_members where user_id = ${userId})
  `;
  await logActivity(actorId, { action: "client.member_remove", entity: "client", summary: `Removed a user from a client portal` });
  revalidatePath(`/admin/clients/${clientId}`);
}
