import { sql } from "@/lib/db";
import { site } from "@/lib/site";

// Rendered on request (never at build time, so a busy database can't fail the
// deploy) and cached at the CDN for 10 minutes.
export const dynamic = "force-dynamic";

function esc(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

export async function GET() {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || site.url).replace(/\/$/, "");
  let posts: { slug: string; title: string; excerpt: string | null; published_at: string | null; category: string | null }[];
  try {
    posts = (await sql`
    select p.slug, p.title, p.excerpt, p.published_at, pc.name as category
    from posts p
    left join post_categories pc on pc.id = p.category_id
    where p.status = 'published'
    order by p.published_at desc nulls last
    limit 30
  `) as unknown as typeof posts;
  } catch (error) {
    console.error("rss failed", error);
    return new Response("Feed temporarily unavailable", { status: 503, headers: { "Retry-After": "60" } });
  }

  const items = posts
    .map((p) => {
      const url = `${base}/blog/${p.slug}`;
      return `    <item>
      <title>${esc(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      ${p.published_at ? `<pubDate>${new Date(p.published_at).toUTCString()}</pubDate>` : ""}
      ${p.category ? `<category>${esc(p.category)}</category>` : ""}
      <description>${esc(p.excerpt ?? "")}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(site.name)} — Blog</title>
    <link>${base}/blog</link>
    <description>Articles on web development, design and running a website.</description>
    <language>en</language>
    <atom:link href="${base}/blog/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=600, s-maxage=600, stale-while-revalidate=3600" },
  });
}
