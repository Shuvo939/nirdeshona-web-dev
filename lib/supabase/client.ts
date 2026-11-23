import { createBrowserClient } from "@supabase/ssr";
import { parse, serialize } from "cookie";

import { REMEMBER_COOKIE, isPersistent, withRemember } from "./remember";

// Use this in Client Components. Cookies are written by hand so that
// "Remember me" can turn auth cookies into session cookies.
export function createClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        const all = parse(document.cookie);
        return Object.entries(all).map(([name, value]) => ({ name, value: value ?? "" }));
      },
      setAll(cookiesToSet) {
        const persistent = isPersistent(parse(document.cookie)[REMEMBER_COOKIE]);
        for (const { name, value, options } of cookiesToSet) {
          document.cookie = serialize(name, value, withRemember(options, persistent) as Parameters<typeof serialize>[2]);
        }
      },
    },
  });
}
