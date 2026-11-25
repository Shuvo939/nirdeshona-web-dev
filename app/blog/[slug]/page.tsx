import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { sql } from "@/lib/db";
import { getI18n } from "@/lib/i18n/server";
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
      ${tcol(locale, "title")} as title,
      ${tcol(locale, "excerpt")} as excerpt,
      ${tcol(locale, "seo_title")} as seo_title,
      ${tcol(locale, "seo_description")} as seo_description,
      cover_image_url,
      (title_bn is not null and title_bn <> '') as has_bn
    from public.posts
    where slug = ${slug}
      and status = 'published'
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

  return {
    title,
    description,
    alternates: {
      canonical: lp(`/blog/${slug}`),
      languages: { "bn-BD": `/bn/blog/${slug}`, en: `/en/blog/${slug}`, "x-default": `/bn/blog/${slug}` },
    },

    openGraph: {
      title,
      description,
      type: "article",

      ...(post.cover_image_url
        ? {
            images: [
              {
                url: String(post.cover_image_url),
                alt: String(post.title),
              },
            ],
          }
        : {}),
    },

    twitter: {
      card: post.cover_image_url
        ? "summary_large_image"
        : "summary",

      title,
      description,

      ...(post.cover_image_url
        ? {
            images: [String(post.cover_image_url)],
          }
        : {}),
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

  return (
    <PostPage post={post} tags={tags} />
  );
}