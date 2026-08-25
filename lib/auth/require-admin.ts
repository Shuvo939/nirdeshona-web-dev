import { redirect } from "next/navigation";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { sql } from "@/lib/db";

// Call at the top of any admin Server Component / Server Action.
// Redirects to /login if not logged in, or / if logged in but not an admin.
export async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [profile] = await sql`
    select role, full_name from profiles where id = ${user.id}
  `;

  if (!profile || profile.role !== "ADMIN") {
    redirect("/");
  }

  return { userId: user.id, fullName: profile.full_name as string | null };
}
