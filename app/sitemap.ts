import type { MetadataRoute } from "next";

import { sql } from "@/lib/db";
import { services, site } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = site.url.replace(/\/$/, "");
  const now = new Date();

  const staticRoutes = ["", "/services", "/projects", "/blog", "/about", "/pricing", "/clients", "/faq", "/contact", "/privacy", "/terms"].map(
    (path) => ({ url: `${base}${path}`, lastModified: now, changeFrequency: "weekly" as const, priority: path === "" ? 1 : 0.7 }),
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
      sql`select slug, updated_at from projects order by updated_at desc`,
      sql`select slug, updated_at from posts where status = 'published' order by published_at desc`,
      sql`select distinct pc.slug from post_categories pc join posts p on p.category_id = pc.id and p.status = 'published'`,
    ]);
    dynamicRoutes = [
      ...projects.map((p) => ({ url: `${base}/projects/${p.slug}`, lastModified: new Date(p.updated_at), priority: 0.6 })),
      ...posts.map((p) => ({ url: `${base}/blog/${p.slug}`, lastModified: new Date(p.updated_at), priority: 0.6 })),
      ...categories.map((c) => ({ url: `${base}/blog/category/${c.slug}`, lastModified: now, priority: 0.4 })),
    ];
  } catch (error) {
    console.error("sitemap: database unavailable", error);
  }

  return [...staticRoutes, ...serviceRoutes, ...dynamicRoutes];
}
