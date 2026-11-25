import { NextResponse, type NextRequest } from "next/server";

import { sql } from "@/lib/db";
import { isLocale } from "@/lib/i18n/config";
import { tcol } from "@/lib/i18n/sql";
import { categoryLabel } from "@/lib/projects/categories";

// A compact, cache-friendly index of everything searchable in the database.
// The search popup downloads it once and then searches in the browser, so
// typing never waits for the network. Services, pages and FAQs come from
// lib/site.ts and are bundled on the client.

export type IndexItem = {
  type: "post" | "project";
  title: string;
  description: string | null;
  href: string;
  meta: string | null;
  image: string | null;
  keywords: string;
  date: string | null;
};

export async function GET(request: NextRequest) {
  const lang = request.nextUrl.searchParams.get("lang");
  const locale = isLocale(lang) ? lang : "bn";
  try {
    const [posts, projects] = await Promise.all([
      sql`
        select p.slug, ${tcol(locale, "p.title")} as title, ${tcol(locale, "p.excerpt")} as excerpt, p.cover_image_url, p.published_at,
               ${tcol(locale, "pc.name")} as category,
               concat_ws(' ', p.title, p.title_bn) as alt_titles,
               left(regexp_replace(${tcol(locale, "p.content")}, '[#*_>\`\\[\\]()!-]+', ' ', 'g'), 600) as body,
               (select string_agg(concat_ws(' ', t.name, t.name_bn), ' ') from post_tags pt join tags t on t.id = pt.tag_id where pt.post_id = p.id) as tags
        from posts p left join post_categories pc on pc.id = p.category_id
        where p.status = 'published'
        order by p.published_at desc nulls last
        limit 500
      `,
      sql`
        select p.slug, ${tcol(locale, "p.title")} as title, ${tcol(locale, "p.short_description")} as short_description,
               concat_ws(' ', p.title, p.title_bn) as alt_titles, p.category, p.cover_image_url, c.name as client
        from projects p left join clients c on c.id = p.client_id
        order by p.featured desc, p.created_at desc
        limit 300
      `,
    ]);

    const items: IndexItem[] = [
      ...posts.map((p) => ({
        type: "post" as const,
        title: p.title,
        description: p.excerpt,
        href: `/blog/${p.slug}`,
        meta: p.category,
        image: p.cover_image_url,
        keywords: [p.alt_titles, p.category, p.tags, p.body].filter(Boolean).join(" "),
        date: p.published_at ? new Date(p.published_at).toISOString() : null,
      })),
      ...projects.map((p) => ({
        type: "project" as const,
        title: p.title,
        description: p.short_description,
        href: `/projects/${p.slug}`,
        meta: categoryLabel(p.category, locale) || null,
        image: p.cover_image_url,
        keywords: [p.alt_titles, p.category, categoryLabel(p.category, "bn"), p.client].filter(Boolean).join(" "),
        date: null,
      })),
    ];

    return NextResponse.json(
      { items, generatedAt: new Date().toISOString() },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400" } },
    );
  } catch (error) {
    console.error("search-index failed", error);
    return NextResponse.json({ items: [], generatedAt: null }, { headers: { "Cache-Control": "no-store" } });
  }
}
