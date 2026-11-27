import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { sql } from "@/lib/db";
import { getI18n } from "@/lib/i18n/server";
import { jsonLd } from "@/lib/json-ld";
import { absoluteUrl, breadcrumbLd, ogImageUrl, pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";
import { tcol } from "@/lib/i18n/sql";
import { trackPostView } from "@/lib/posts/views";
import PostPage from "@/app/components/blog/post-page";

import type { Post, Tag } from "@/app/components/blog/types";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { L, locale, lp } = await getI18n();

  const [post] = await sql`
    select
      ${tcol(locale, "p.title")} as title,
      p.title as title_en,
      ${tcol(locale, "p.excerpt")} as excerpt,
      ${tcol(locale, "p.seo_title")} as seo_title,
      ${tcol(locale, "p.seo_description")} as seo_description,
      p.cover_image_url, p.published_at, p.updated_at,
      (p.title_bn is not null and p.title_bn <> '') as has_bn,
      pr.full_name as author_name,
      ${tcol(locale, "pc.name")} as category_name
    from public.posts p
    left join public.profiles pr on pr.id = p.author_id
    left join public.post_categories pc on pc.id = p.category_id
    where p.slug = ${slug}
      and p.status = 'published'
    limit 1
  `;

  if (!post) {
    return {
      title: L("Post Not Found | Nirdeshona", "লেখা পাওয়া যায়নি | নির্দেশনা"),
    };
  }

  const title = post.seo_title || post.title;

  const description =
    post.seo_description ||
    post.excerpt ||
    L(`Read ${post.title} on Nirdeshona.`, `নির্দেশনায় পড়ুন: ${post.title}`);

  const meta = pageMeta({
    locale,
    path: `/blog/${slug}`,
    title,
    description,
    image: post.cover_image_url ? String(post.cover_image_url) : null,
    eyebrow: L("Blog", "ব্লগ"),
    type: "article",
    og: { title: String(post.title_en), eyebrow: "Blog" },
  });
  return {
    ...meta,
    openGraph: {
      ...meta.openGraph,
      type: "article",
      publishedTime: post.published_at ? new Date(post.published_at).toISOString() : undefined,
      modifiedTime: post.updated_at ? new Date(post.updated_at).toISOString() : undefined,
      authors: post.author_name ? [String(post.author_name)] : undefined,
      section: post.category_name ? String(post.category_name) : undefined,
    },
  };
}

export default async function SinglePostPage({
  params,
}: PageProps) {
  const { slug } = await params;
  const { locale } = await getI18n();

  const [post] = (await sql`
    select
      p.*,
      ${tcol(locale, "p.title")} as title,
      ${tcol(locale, "p.excerpt")} as excerpt,
      ${tcol(locale, "p.content")} as content,

      pr.full_name as author_name,
      pr.avatar_url as author_avatar,

      ${tcol(locale, "pc.name")} as category_name,
      pc.slug as category_slug

    from public.posts p

    left join public.profiles pr
      on pr.id = p.author_id

    left join public.post_categories pc
      on pc.id = p.category_id

    where p.slug = ${slug}
      and p.status = 'published'

    limit 1
  `) as Post[];

  if (!post) {
    notFound();
  }

  /*
   * IMPORTANT:
   *
   * Do NOT use increment_post_views() here.
   *
   * trackPostView() checks:
   * post_id + visitor_id + 12-hour window.
   */
  await trackPostView(post.id);

  /*
   * Fetch the current value after tracking.
   * This ensures the number displayed on the page
   * reflects the latest database value.
   */
  const [freshPost] = await sql`
    select views_count
    from public.posts
    where id = ${post.id}
    limit 1
  `;

  if (freshPost) {
    post.views_count = Number(freshPost.views_count);
  }

  const tags = (await sql`
    select t.id, ${tcol(locale, "t.name")} as name, t.slug
    from public.tags t
    inner join public.post_tags pt on pt.tag_id = t.id
    where pt.post_id = ${post.id}
    order by t.name asc
  `) as Tag[];

  const url = `${site.url}/${locale}/blog/${post.slug}`;
  const structured = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt ?? undefined,
      image: post.cover_image_url ? [post.cover_image_url] : [absoluteUrl(ogImageUrl(post.title))],
      datePublished: post.published_at ? new Date(post.published_at).toISOString() : undefined,
      dateModified: new Date(post.updated_at ?? post.published_at ?? post.created_at).toISOString(),
      inLanguage: locale === "bn" ? "bn-BD" : "en",
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      url,
      author: { "@type": "Person", name: post.author_name || site.legalName },
      publisher: { "@id": `${site.url}/#organization` },
      articleSection: post.category_name ?? undefined,
      keywords: tags.map((t) => t.name).join(", ") || undefined,
      wordCount: post.content.trim().split(/\s+/).length,
      interactionStatistic: { "@type": "InteractionCounter", interactionType: "https://schema.org/ReadAction", userInteractionCount: Number(post.views_count) },
    },
    breadcrumbLd(locale, [
      [locale === "bn" ? "হোম" : "Home", "/"],
      [locale === "bn" ? "ব্লগ" : "Blog", "/blog"],
      [post.title, `/blog/${post.slug}`],
    ]),
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structured) }} />
      <PostPage post={post} tags={tags} />
    </>
  );
}