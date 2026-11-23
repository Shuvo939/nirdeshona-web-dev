import { NextResponse } from "next/server";

import { sql } from "@/lib/db";
import { faqGroups, services } from "@/lib/site";

export const runtime = "nodejs";

export type SearchHit = {
  type: "service" | "page" | "project" | "post" | "faq";
  title: string;
  description: string | null;
  href: string;
  meta?: string | null;
  image?: string | null;
};

const PAGES: SearchHit[] = [
  { type: "page", title: "Our Work", description: "Projects and case studies", href: "/projects" },
  { type: "page", title: "Pricing", description: "Website packages and care plans", href: "/pricing" },
  { type: "page", title: "Blog", description: "Articles and guides", href: "/blog" },
  { type: "page", title: "About", description: "Who we are and how we work", href: "/about" },
  { type: "page", title: "Clients", description: "People and organisations we work with", href: "/clients" },
  { type: "page", title: "FAQ", description: "Frequently asked questions", href: "/faq" },
  { type: "page", title: "Contact", description: "Start a project or get in touch", href: "/contact" },
  { type: "page", title: "Client portal", description: "Projects, tickets and support", href: "/client" },
  { type: "page", title: "Privacy Policy", description: "How we handle your data", href: "/privacy" },
  { type: "page", title: "Terms of Service", description: "Terms for using our site and services", href: "/terms" },
];

function matches(text: string, terms: string[]) {
  const hay = text.toLowerCase();
  return terms.every((t) => hay.includes(t));
}

export async function GET(request: Request) {
  const q = (new URL(request.url).searchParams.get("q") ?? "").trim().slice(0, 80);
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);

  if (terms.length === 0) {
    const posts = await sql`
      select slug, title, excerpt, cover_image_url, published_at
      from posts where status = 'published'
      order by published_at desc nulls last limit 4
    `;
    return NextResponse.json(
      {
        q,
        posts: posts.map((p) => ({ type: "post", title: p.title, description: p.excerpt, href: `/blog/${p.slug}`, image: p.cover_image_url })),
      },
      { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600" } },
    );
  }

  const pattern = `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;

  const [projects, posts] = await Promise.all([
    sql`
      select slug, title, short_description, category, cover_image_url
      from projects
      where title ilike ${pattern} or short_description ilike ${pattern}
         or description ilike ${pattern} or category ilike ${pattern}
      order by (title ilike ${pattern}) desc, featured desc, created_at desc
      limit 5
    `,
    sql`
      select p.slug, p.title, p.excerpt, p.cover_image_url, pc.name as category
      from posts p
      left join post_categories pc on pc.id = p.category_id
      where p.status = 'published'
        and (p.title ilike ${pattern} or p.excerpt ilike ${pattern} or p.content ilike ${pattern}
             or pc.name ilike ${pattern}
             or exists (select 1 from post_tags pt join tags t on t.id = pt.tag_id
                        where pt.post_id = p.id and t.name ilike ${pattern}))
      order by (p.title ilike ${pattern}) desc, p.published_at desc nulls last
      limit 6
    `,
  ]);

  const result = {
    q,
    services: services
      .filter((s) => matches(`${s.title} ${s.short} ${s.stack.join(" ")} ${s.idealFor.join(" ")}`, terms))
      .slice(0, 4)
      .map<SearchHit>((s) => ({ type: "service", title: s.title, description: s.short, href: `/services/${s.slug}`, meta: `From ${s.startingFrom}` })),
    pages: PAGES.filter((p) => matches(`${p.title} ${p.description}`, terms)).slice(0, 4),
    projects: projects.map<SearchHit>((p) => ({
      type: "project",
      title: p.title,
      description: p.short_description,
      href: `/projects/${p.slug}`,
      meta: p.category,
      image: p.cover_image_url,
    })),
    posts: posts.map<SearchHit>((p) => ({
      type: "post",
      title: p.title,
      description: p.excerpt,
      href: `/blog/${p.slug}`,
      meta: p.category,
      image: p.cover_image_url,
    })),
    faqs: faqGroups
      .flatMap((g) => g.items)
      .filter((f) => matches(`${f.q} ${f.a}`, terms))
      .slice(0, 3)
      .map<SearchHit>((f) => ({ type: "faq", title: f.q, description: f.a, href: "/faq" })),
  };

  return NextResponse.json(result, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
}
