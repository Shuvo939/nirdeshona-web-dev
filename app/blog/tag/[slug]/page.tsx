import type { Metadata } from "next";
import { notFound } from "next/navigation";

import PostListing, { parseSort } from "@/app/components/blog/post-listing";
import { PageHero } from "@/app/components/marketing";
import { sql } from "@/lib/db";

async function getTag(slug: string) {
  const [tag] = await sql`select name, slug from tags where slug = ${slug} limit 1`;
  return tag as { name: string; slug: string } | undefined;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTag(slug);
  if (!tag) return {};
  return {
    title: `${tag.name} — Blog — Nirdeshona Web`,
    alternates: { canonical: `/blog/tag/${tag.slug}` },
  };
}

export default async function BlogTagPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; sort?: string }>;
}) {
  const { slug } = await params;
  const { page: rawPage, sort: rawSort } = await searchParams;
  const tag = await getTag(slug);
  if (!tag) notFound();
  const page = Math.max(1, Number.parseInt(rawPage ?? "1", 10) || 1);

  return (
    <>
      <PageHero
        eyebrow="Tag"
        title={`#${tag.name}`}
        description={`Articles tagged ${tag.name}.`}
        breadcrumbs={[{ label: "Blog", href: "/blog" }, { label: tag.name }]}
      />
      <PostListing basePath={`/blog/tag/${tag.slug}`} page={page} tagSlug={tag.slug} sort={parseSort(rawSort)} />
    </>
  );
}
