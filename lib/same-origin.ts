import { site } from "@/lib/site";

/**
 * CSRF guard for browser POSTs: the Origin header must match the host the
 * request was sent to (works on the live domain, www, and Vercel previews),
 * or one of the known site URLs. Requests without an Origin header (same-origin
 * GETs, some older browsers) are allowed; cookies are SameSite=Lax anyway.
 */
export function isAllowedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  let originHost: string;
  try {
    originHost = new URL(origin).host.toLowerCase();
  } catch {
    return false;
  }

  const requestHost = (request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "")
    .split(",")[0]
    .trim()
    .toLowerCase();
  if (requestHost && originHost === requestHost) return true;

  const known = [process.env.NEXT_PUBLIC_SITE_URL, site.url, "https://web.nirdeshona.com", "http://localhost:3000", "http://127.0.0.1:3000"]
    .filter(Boolean)
    .map((value) => {
      try {
        return new URL(value!).host.toLowerCase();
      } catch {
        return null;
      }
    });
  return known.includes(originHost);
}
