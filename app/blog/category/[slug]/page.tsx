import type { Metadata } from "next";
import { notFound } from "next/navigation";

import PostListing, { parseSort } from "@/app/components/blog/post-listing";
import { PageHero } from "@/app/components/marketing";
import { sql } from "@/lib/db";
import { getI18n, getLocale } from "@/lib/i18n/server";
import { pageMeta } from "@/lib/seo";
import { tcol } from "@/lib/i18n/sql";

async function getCategory(slug: string) {
  const [category] = await sql`select ${tcol(await getLocale(), "name")} as name, slug from post_categories where slug = ${slug} limit 1`;
  return category as { name: string; slug: string } | undefined;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return {};
  const { L, locale } = await getI18n();
  return pageMeta({
    locale,
    path: `/blog/category/${category.slug}`,
    title: `${category.name} — ${L("Blog — Nirdeshona Web", "ব্লগ — নির্দেশনা ওয়েব")}`,
    description: L(`Articles about ${category.name} from the Nirdeshona Web blog.`, `নির্দেশনা ওয়েব ব্লগে ${category.name} বিষয়ের লেখা।`),
    eyebrow: L("Category", "বিভাগ"),
  });
}

export default async function BlogCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; sort?: string }>;
}) {
  const { slug } = await params;
  const { page: rawPage, sort: rawSort } = await searchParams;
  const category = await getCategory(slug);
  if (!category) notFound();
  const { L } = await getI18n();
  const page = Math.max(1, Number.parseInt(rawPage ?? "1", 10) || 1);

  return (
    <>
      <PageHero
        eyebrow={L("Category", "ক্যাটাগরি")}
        title={category.name}
        description={L(`Articles filed under ${category.name}.`, `“${category.name}” ক্যাটাগরির লেখা।`)}
        breadcrumbs={[{ label: L("Blog", "ব্লগ"), href: "/blog" }, { label: category.name }]}
      />
      <PostListing basePath={`/blog/category/${category.slug}`} page={page} categorySlug={category.slug} sort={parseSort(rawSort)} />
    </>
  );
}
