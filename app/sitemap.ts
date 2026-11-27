import type { MetadataRoute } from "next";

import { sql } from "@/lib/db";
import { LOCALES, localizePath } from "@/lib/i18n/config";
import { services, site } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = site.url.replace(/\/$/, "");
  const now = new Date();

  const PRIORITY: Record<string, number> = { "": 1, "/services": 0.9, "/pricing": 0.9, "/projects": 0.8, "/blog": 0.8, "/contact": 0.8 };
  const staticRoutes = ["", "/services", "/projects", "/blog", "/about", "/pricing", "/clients", "/faq", "/contact", "/privacy", "/terms"].map(
    (path) => ({
      url: `${base}${path}`,
      lastModified: now,
      changeFrequency: (path === "/privacy" || path === "/terms" ? "yearly" : "weekly") as "yearly" | "weekly",
      priority: PRIORITY[path] ?? 0.5,
    }),
  );

  const serviceRoutes = services.map((service) => ({
    url: `${base}/services/${service.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  let dynamicRoutes: MetadataRoute.Sitemap = [];
  try {
    const [projects, posts, categories] = await Promise.all([
      sql`select slug, updated_at, cover_image_url from projects order by updated_at desc`,
      sql`select slug, updated_at, cover_image_url from posts where status = 'published' order by published_at desc`,
      sql`select distinct pc.slug from post_categories pc join posts p on p.category_id = pc.id and p.status = 'published'`,
    ]);
    dynamicRoutes = [
      ...projects.map((p) => ({
        url: `${base}/projects/${p.slug}`,
        lastModified: new Date(p.updated_at),
        priority: 0.6,
        ...(p.cover_image_url ? { images: [String(p.cover_image_url)] } : {}),
      })),
      ...posts.map((p) => ({
        url: `${base}/blog/${p.slug}`,
        lastModified: new Date(p.updated_at),
        changeFrequency: "monthly" as const,
        priority: 0.7,
        ...(p.cover_image_url ? { images: [String(p.cover_image_url)] } : {}),
      })),
      ...categories.map((c) => ({ url: `${base}/blog/category/${c.slug}`, lastModified: now, priority: 0.4 })),
    ];
  } catch (error) {
    console.error("sitemap: database unavailable", error);
  }

  // Every page exists in Bangla (/bn) and English (/en); list both with hreflang alternates.
  return [...staticRoutes, ...serviceRoutes, ...dynamicRoutes].flatMap((entry) => {
    const path = entry.url.slice(base.length) || "/";
    const languages = {
      "bn-BD": `${base}${localizePath("bn", path)}`,
      en: `${base}${localizePath("en", path)}`,
      "x-default": `${base}${localizePath("bn", path)}`,
    };
    return LOCALES.map((locale) => ({ ...entry, url: `${base}${localizePath(locale, path)}`, alternates: { languages } }));
  });
}
