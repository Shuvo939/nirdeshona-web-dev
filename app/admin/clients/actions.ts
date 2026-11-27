"use server";

import { refreshPublicContent } from "@/lib/public-cache";
import { logActivity } from "@/lib/audit";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { isHttpUrl } from "@/lib/safe-url";

import type { FormState } from "@/app/(account)/client/actions";
import { requireAdmin } from "@/lib/auth/require-admin";
import { sql } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { checkImageFile, discardStoredImage, pickImageFile, storeFormImage, type StoredImage } from "@/lib/media-server";
import { site } from "@/lib/site";
import { phoneKey, syncClientAccessForClient } from "@/lib/clients/access";
import { moveToTrash } from "@/lib/trash";

const ClientSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120, "Name is too long"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens"),
  contact_email: z.union([z.string().trim().email("Invalid email"), z.literal("")]),
  contact_phone: z.string().trim().max(30, "Too long"),
  logo_url: z.union([z.string().trim().url("Must be a full URL (https://…)").refine(isHttpUrl, "Must start with http(s)://"), z.literal("")]),
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

export type ClientFormState = FormState & { logoUrl?: string | null; savedAt?: number; linked?: number };

export async function saveClient(clientId: string | null, _prev: ClientFormState, formData: FormData): Promise<ClientFormState> {
  const { userId: actorId } = await requireAdmin();
  const parsed = parse(formData);
  if (!parsed.success) return { fieldErrors: errorsOf(parsed.error) };
  const v = parsed.data;

  const [dupe] = await sql`
    select 1 from clients where slug = ${v.slug} and (${clientId}::uuid is null or id <> ${clientId}::uuid)
  `;
  if (dupe) return { fieldErrors: { slug: "Another client already uses this slug" } };

  const logoFile = pickImageFile(formData, "logo_url_file");
  if (logoFile) {
    const problem = checkImageFile(logoFile);
    if (problem) return { fieldErrors: { logo_url: problem } };
  }

  // Everything is valid — only now store the new logo (removed again if the save fails).
  let stored: StoredImage | null = null;
  let id = clientId;
  let logo: string | null = v.logo_url || null;
  try {
    if (logoFile) stored = await storeFormImage(logoFile, actorId, `${v.slug}-logo`);
    logo = stored?.url ?? logo;
    if (clientId) {
      await sql`
        update clients set name = ${v.name}, slug = ${v.slug}, contact_email = ${v.contact_email || null},
          contact_phone = ${v.contact_phone || null}, logo_url = ${logo}, notes = ${v.notes || null},
          updated_at = now()
        where id = ${clientId}
      `;
    } else {
      const [row] = await sql`
        insert into clients (name, slug, contact_email, contact_phone, logo_url, notes)
        values (${v.name}, ${v.slug}, ${v.contact_email || null}, ${v.contact_phone || null}, ${logo}, ${v.notes || null})
        returning id
      `;
      id = row.id;
    }
  } catch (error) {
    await discardStoredImage(stored);
    console.error("saveClient failed", error);
    return { error: error instanceof Error && logoFile && !stored ? error.message : "Couldn't save the client. Please try again." };
  }

  // Anyone already registered with this contact email gets portal access now.
  const linked = id ? await syncClientAccessForClient(id).catch(() => 0) : 0;

  await logActivity(actorId, { action: "client.save", entity: "client", summary: `Saved client “${String(formData.get("name") ?? "").trim()}”` });
  revalidatePath("/admin/clients");
  refreshPublicContent();
  revalidatePath("/clients");
  if (!clientId) redirect(`/admin/clients/${id}`);
  return { ok: true, logoUrl: logo, savedAt: Date.now(), linked };
}

export async function deleteClient(clientId: string) {
  const { userId: actorId } = await requireAdmin();
  await moveToTrash("client", clientId, actorId);
  await logActivity(actorId, { action: "client.delete", entity: "client", summary: `Moved a client to the bin` });
  revalidatePath("/admin/clients");
  refreshPublicContent();
  revalidatePath("/clients");
  redirect("/admin/clients");
}

export async function addClientMember(clientId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const { userId: actorId } = await requireAdmin();
  const input = String(formData.get("email") ?? "").trim().toLowerCase();
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
  const key = isEmail ? null : phoneKey(input);
  if (!isEmail && !key) return { fieldErrors: { email: "Enter an email address or a phone number" } };

  const matches = isEmail
    ? await sql`
        select p.id, p.role, p.full_name, u.email from auth.users u join profiles p on p.id = u.id
        where lower(u.email) = ${input} limit 1
      `
    : await sql`
        select p.id, p.role, p.full_name, u.email from profiles p join auth.users u on u.id = p.id
        where p.phone is not null and right(regexp_replace(p.phone, '\\D', '', 'g'), 10) = ${key}
        limit 2
      `;
  if (matches.length > 1) return { error: "More than one account uses that phone number — add them by email instead." };
  const [user] = matches;
  if (!user) {
    return { error: `No account with that ${isEmail ? "email" : "phone number"} yet. Ask them to register first, then add them here.` };
  }
  const email = String(user.email);

  const [client] = await sql`select name from clients where id = ${clientId}`;
  if (!client) return { error: "Client not found." };

  await sql`delete from client_member_blocks where client_id = ${clientId} and user_id = ${user.id}`;
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
  refreshPublicContent();
  return { ok: true };
}

export async function removeClientMember(clientId: string, userId: string) {
  const { userId: actorId } = await requireAdmin();
  await sql`delete from client_members where client_id = ${clientId} and user_id = ${userId}`;
  // Remember the removal so automatic email matching doesn't add them back.
  await sql`insert into client_member_blocks (client_id, user_id) values (${clientId}, ${userId}) on conflict do nothing`;
  // Downgrade to USER if they no longer belong to any client (never touch admins).
  await sql`
    update profiles set role = 'USER'
    where id = ${userId} and role = 'CLIENT'
      and not exists (select 1 from client_members where user_id = ${userId})
  `;
  await logActivity(actorId, { action: "client.member_remove", entity: "client", summary: `Removed a user from a client portal` });
  revalidatePath(`/admin/clients/${clientId}`);
  refreshPublicContent();
}

/** One-click access for a user suggested by a matching phone number. */
export async function grantClientAccess(clientId: string, userId: string) {
  const { userId: actorId } = await requireAdmin();
  const [client] = await sql`select name from clients where id = ${clientId}`;
  const [user] = await sql`select u.email, p.full_name, p.role from auth.users u join profiles p on p.id = u.id where u.id = ${userId}`;
  if (!client || !user) return;
  await sql`delete from client_member_blocks where client_id = ${clientId} and user_id = ${userId}`;
  await sql`insert into client_members (client_id, user_id) values (${clientId}, ${userId}) on conflict do nothing`;
  if (user.role === "USER") await sql`update profiles set role = 'CLIENT' where id = ${userId}`;
  await sql`
    insert into notifications (user_id, type, title, message, link)
    values (${userId}, 'access', ${`You now have access to ${client.name}`},
            'Your client portal is ready — see project progress and open support tickets.', '/client')
  `;
  await sendEmail({
    to: user.email,
    subject: `Your ${site.name} client portal is ready`,
    heading: `Welcome${user.full_name ? `, ${user.full_name}` : ""}!`,
    body: `Your account is now linked to ${client.name}. In the client portal you can follow project progress, open support tickets and talk to our team.`,
    cta: { label: "Open client portal", url: `${site.url}/client` },
  });
  await logActivity(actorId, { action: "client.member_add", entity: "client", summary: `Gave ${user.email} access to ${client.name} (phone match)` });
  revalidatePath(`/admin/clients/${clientId}`);
  refreshPublicContent();
}
