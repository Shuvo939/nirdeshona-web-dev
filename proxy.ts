import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALE_HEADER, isLocale, isUnlocalizedPath, type Locale } from "@/lib/i18n/config";
import { REMEMBER_COOKIE, isPersistent, withRemember } from "@/lib/supabase/remember";

// Retired: views are now counted without cookies (lib/posts/views.ts).
// Remove it from browsers that still carry it.
const OLD_VISITOR_COOKIE = "nirdeshona_visitor_id";

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const first = pathname.split("/")[1];
  const preferred = request.cookies.get(LOCALE_COOKIE)?.value;

  // Public pages live under /bn (default) or /en. A path without a prefix is
  // redirected to the visitor's last language (or Bangla).
  if (!isLocale(first) && !isUnlocalizedPath(pathname)) {
    const locale: Locale = isLocale(preferred) ? preferred : DEFAULT_LOCALE;
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url, 307);
  }

  // /bn/about is served by app/about; the locale travels in a request header.
  // Admin stays English; APIs and other unprefixed routes follow the visitor's language.
  const locale: Locale = isLocale(first) ? first : pathname.startsWith("/admin") ? "en" : isLocale(preferred) ? preferred : DEFAULT_LOCALE;
  const internalPath = isLocale(first) ? pathname.slice(first.length + 1) || "/" : pathname;
  // Rebuilt after Supabase refreshes cookies so pages see the fresh session.
  const makeResponse = () => {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(LOCALE_HEADER, locale);
    return isLocale(first)
      ? NextResponse.rewrite(new URL(`${internalPath}${search}`, request.url), { request: { headers: requestHeaders } })
      : NextResponse.next({ request: { headers: requestHeaders } });
  };

  let response = makeResponse();

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

          response = makeResponse();

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

  if (request.cookies.has(OLD_VISITOR_COOKIE)) {
    response.cookies.set(OLD_VISITOR_COOKIE, "", { path: "/", maxAge: 0 });
  }

  if (isLocale(first) && preferred !== first) {
    response.cookies.set(LOCALE_COOKIE, first, { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/search-index|sitemap.xml|robots.txt|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)",
  ],
};