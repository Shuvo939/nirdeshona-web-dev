import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/safe-url";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  // Prevent open redirects (rejects //host and /\host too).
  const next = safeNextPath(searchParams.get("next"), "/account");

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback`);
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Auth callback error:", error);

    return NextResponse.redirect(
      `${origin}/login?error=auth_callback`
    );
  }

  return NextResponse.redirect(`${origin}${next}`);
}