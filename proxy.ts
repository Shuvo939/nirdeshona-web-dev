import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { REMEMBER_COOKIE, isPersistent, withRemember } from "@/lib/supabase/remember";

const VISITOR_COOKIE = "nirdeshona_visitor_id";

function generateVisitorId() {
  return crypto.randomUUID();
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }

          response = NextResponse.next({
            request,
          });

          const persistent = isPersistent(request.cookies.get(REMEMBER_COOKIE)?.value);
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, withRemember(options, persistent));
          }
        },
      },
    }
  );

  // Refresh/validate Supabase auth session.
  await supabase.auth.getUser();

  // Create visitor ID if it doesn't exist.
  const existingVisitorId =
    request.cookies.get(VISITOR_COOKIE)?.value;

  if (!existingVisitorId) {
    response.cookies.set(VISITOR_COOKIE, generateVisitorId(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365 * 2, // 2 years
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/search-index|sitemap.xml|robots.txt|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)",
  ],
};