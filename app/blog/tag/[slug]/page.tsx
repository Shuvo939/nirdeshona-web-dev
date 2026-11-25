import type { Metadata } from "next";
import { notFound } from "next/navigation";

import PostListing, { parseSort } from "@/app/components/blog/post-listing";
import { PageHero } from "@/app/components/marketing";
import { sql } from "@/lib/db";
import { getI18n, getLocale, localeAlternates } from "@/lib/i18n/server";
import { tcol } from "@/lib/i18n/sql";

async function getTag(slug: string) {
  const [tag] = await sql`select ${tcol(await getLocale(), "name")} as name, slug from tags where slug = ${slug} limit 1`;
  return tag as { name: string; slug: string } | undefined;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTag(slug);
  if (!tag) return {};
  const { L, locale } = await getI18n();
  return {
    title: `${tag.name} — ${L("Blog — Nirdeshona Web", "ব্লগ — নির্দেশনা ওয়েব")}`,
    alternates: localeAlternates(locale, `/blog/tag/${tag.slug}`),
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
  const { L } = await getI18n();
  const page = Math.max(1, Number.parseInt(rawPage ?? "1", 10) || 1);

  return (
    <>
      <PageHero
        eyebrow={L("Tag", "ট্যাগ")}
        title={`#${tag.name}`}
        description={L(`Articles tagged ${tag.name}.`, `“${tag.name}” ট্যাগযুক্ত লেখা।`)}
        breadcrumbs={[{ label: L("Blog", "ব্লগ"), href: "/blog" }, { label: tag.name }]}
      />
      <PostListing basePath={`/blog/tag/${tag.slug}`} page={page} tagSlug={tag.slug} sort={parseSort(rawSort)} />
    </>
  );
}
