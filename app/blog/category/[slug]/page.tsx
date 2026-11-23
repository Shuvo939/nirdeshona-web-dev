import type { Metadata } from "next";
import { notFound } from "next/navigation";

import PostListing from "@/app/components/blog/post-listing";
import { PageHero } from "@/app/components/marketing";
import { sql } from "@/lib/db";

async function getCategory(slug: string) {
  const [category] = await sql`select name, slug from post_categories where slug = ${slug} limit 1`;
  return category as { name: string; slug: string } | undefined;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return {};
  return {
    title: `${category.name} — Blog — Nirdeshona Web`,
    alternates: { canonical: `/blog/category/${category.slug}` },
  };
}

export default async function BlogCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page: rawPage } = await searchParams;
  const category = await getCategory(slug);
  if (!category) notFound();
  const page = Math.max(1, Number.parseInt(rawPage ?? "1", 10) || 1);

  return (
    <>
      <PageHero
        eyebrow="Category"
        title={category.name}
        description={`Articles filed under ${category.name}.`}
        breadcrumbs={[{ label: "Blog", href: "/blog" }, { label: category.name }]}
      />
      <PostListing basePath={`/blog/category/${category.slug}`} page={page} categorySlug={category.slug} />
    </>
  );
}
