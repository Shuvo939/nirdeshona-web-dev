import type { MetadataRoute } from "next";

import { site } from "@/lib/site";

// Private areas are reachable with and without the /bn or /en prefix.
const PRIVATE = ["/admin", "/client", "/account", "/profile", "/settings", "/notifications", "/login", "/register", "/forgot-password", "/update-password", "/search"];

export default function robots(): MetadataRoute.Robots {
  const base = site.url.replace(/\/$/, "");
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/og"],
      disallow: [
        ...PRIVATE,
        ...PRIVATE.filter((p) => p !== "/admin").flatMap((p) => [`/bn${p}`, `/en${p}`]),
        "/api/",
        "/auth/",
      ],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
