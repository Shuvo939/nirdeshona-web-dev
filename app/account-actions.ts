"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import type { FormState } from "@/app/client/actions";
import { getSessionUser } from "@/lib/auth/session";
import { sql } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

const ProfileSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(100, "Name is too long"),
  phone: z
    .string()
    .trim()
    .max(30, "Phone number is too long")
    .regex(/^[+\d\s()-]*$/, "Use digits, spaces and + only"),
  company: z.string().trim().max(120, "Organisation name is too long"),
  bio: z.string().trim().max(500, "Keep your bio under 500 characters"),
});

export async function updateProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getSessionUser();
  if (!user) return { error: "Please sign in again." };

  const parsed = ProfileSchema.safeParse({
    fullName: formData.get("fullName") ?? "",
    phone: formData.get("phone") ?? "",
    company: formData.get("company") ?? "",
    bio: formData.get("bio") ?? "",
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      fieldErrors[key] ??= issue.message;
    }
    return { fieldErrors };
  }

  const { fullName, phone, company, bio } = parsed.data;
  await sql`
    update profiles
    set full_name = ${fullName}, phone = ${phone || null}, company = ${company || null}, bio = ${bio || null}
    where id = ${user.id}
  `;

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function signOutEverywhere() {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "global" });
  redirect("/login");
}
