import "server-only";

import { sql } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { site } from "@/lib/site";

/*
 * Client portal access by matching contact details.
 *
 * - Email: a user whose *verified* account email equals a client's contact
 *   email is linked automatically (both when the client is saved and when the
 *   user signs in / opens their account).
 * - Phone: phone numbers on profiles aren't verified, so a matching phone is
 *   only suggested to the admin, who grants access with one click.
 * - If an admin removes someone, that is remembered (client_member_blocks)
 *   so they aren't linked again automatically.
 */

/** Last 10 digits of a phone number (so +8801712…, 8801712… and 01712… match). */
export function phoneKey(phone: string | null | undefined) {
  const digits = (phone ?? "").replace(/\D/g, "");
  return digits.length >= 10 ? digits.slice(-10) : null;
}

async function afterLinked(rows: { client_id: string; user_id: string }[], notifyByEmail: boolean) {
  for (const row of rows) {
    await sql`update profiles set role = 'CLIENT' where id = ${row.user_id} and role = 'USER'`;
    const [info] = await sql`
      select c.name as client_name, u.email, p.full_name
      from clients c, auth.users u join profiles p on p.id = u.id
      where c.id = ${row.client_id} and u.id = ${row.user_id}
    `;
    if (!info) continue;
    await sql`
      insert into notifications (user_id, type, title, message, link)
      values (${row.user_id}, 'access', ${`You now have access to ${info.client_name}`},
              'Your client portal is ready — see project progress and open support tickets.', '/client')
    `;
    if (notifyByEmail && info.email) {
      await sendEmail({
        to: info.email,
        subject: `Your ${site.name} client portal is ready`,
        heading: `Welcome${info.full_name ? `, ${info.full_name}` : ""}!`,
        body: `Your account is now linked to ${info.client_name}. In the client portal you can follow project progress, open support tickets and talk to our team.`,
        cta: { label: "Open client portal", url: `${site.url}/client` },
      });
    }
  }
}

/** Links one user to every client whose contact email matches their verified email. */
export async function syncClientAccessForUser(userId: string) {
  try {
    const rows = (await sql`
      insert into client_members (client_id, user_id)
      select c.id, u.id
      from auth.users u
      join clients c on c.contact_email is not null and lower(c.contact_email) = lower(u.email)
      where u.id = ${userId}
        and u.email_confirmed_at is not null
        and not exists (select 1 from client_member_blocks b where b.client_id = c.id and b.user_id = u.id)
      on conflict do nothing
      returning client_id, user_id
    `) as unknown as { client_id: string; user_id: string }[];
    if (rows.length) await afterLinked(rows, false);
    return rows.length;
  } catch (error) {
    console.error("syncClientAccessForUser failed", error);
    return 0;
  }
}

/** Links every verified user whose email matches this client's contact email. */
export async function syncClientAccessForClient(clientId: string) {
  const rows = (await sql`
    insert into client_members (client_id, user_id)
    select c.id, u.id
    from clients c
    join auth.users u on lower(u.email) = lower(c.contact_email)
    join profiles p on p.id = u.id
    where c.id = ${clientId}
      and c.contact_email is not null
      and u.email_confirmed_at is not null
      and not p.is_banned
      and not exists (select 1 from client_member_blocks b where b.client_id = c.id and b.user_id = u.id)
    on conflict do nothing
    returning client_id, user_id
  `) as unknown as { client_id: string; user_id: string }[];
  if (rows.length) await afterLinked(rows, true);
  return rows.length;
}

/** Users who aren't members yet but whose profile phone matches the client's phone. */
export async function phoneMatchesForClient(clientId: string) {
  const [client] = await sql`select contact_phone from clients where id = ${clientId}`;
  const key = phoneKey(client?.contact_phone);
  if (!key) return [];
  return (await sql`
    select p.id, p.full_name, u.email, p.phone
    from profiles p join auth.users u on u.id = p.id
    where p.phone is not null
      and right(regexp_replace(p.phone, '\\D', '', 'g'), 10) = ${key}
      and not exists (select 1 from client_members m where m.client_id = ${clientId} and m.user_id = p.id)
    order by p.full_name nulls last
    limit 10
  `) as unknown as { id: string; full_name: string | null; email: string; phone: string }[];
}
