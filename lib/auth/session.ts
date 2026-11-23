import { redirect } from "next/navigation";

import { sql } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export type SessionUser = {
  id: string;
  email: string;
  fullName: string | null;
  role: "ADMIN" | "CLIENT" | "USER";
  avatarUrl: string | null;
  phone: string | null;
  company: string | null;
  isBanned: boolean;
  createdAt: string;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [profile] = await sql`
    select full_name, role, avatar_url, phone, company, is_banned, created_at
    from profiles
    where id = ${user.id}
    limit 1
  `;

  return {
    id: user.id,
    email: user.email ?? "",
    fullName: profile?.full_name ?? null,
    role: (profile?.role ?? "USER") as SessionUser["role"],
    avatarUrl: profile?.avatar_url ?? null,
    phone: profile?.phone ?? null,
    company: profile?.company ?? null,
    isBanned: Boolean(profile?.is_banned),
    createdAt: String(profile?.created_at ?? user.created_at),
  };
}

export async function requireUser(next = "/client") {
  const user = await getSessionUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}

export async function getClientMemberships(userId: string) {
  return (await sql`
    select c.id, c.name, c.slug, c.logo_url
    from clients c
    join client_members cm on cm.client_id = c.id
    where cm.user_id = ${userId}
    order by c.name asc
  `) as unknown as { id: string; name: string; slug: string; logo_url: string | null }[];
}
