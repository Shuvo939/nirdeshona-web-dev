import type { Metadata } from "next";
import { Search } from "lucide-react";

import PostListing, { parseSort } from "@/app/components/blog/post-listing";
import { PageHero } from "@/app/components/marketing";

export const metadata: Metadata = {
  title: "Blog — Nirdeshona Web",
  description: "Notes on web development, design, WordPress and running a website — from the Nirdeshona Web team.",
  alternates: { canonical: "/blog", types: { "application/rss+xml": "/blog/rss.xml" } },
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const q = params.q?.trim().slice(0, 80) || null;
  const sort = parseSort(params.sort);

  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Ideas, guides and lessons from building for the web."
        description="Practical articles on web development, design and keeping a website healthy."
        breadcrumbs={[{ label: "Blog" }]}
      >
        <form action="/blog" role="search" className="flex w-full max-w-xl items-center gap-2 rounded-full border border-neutral-200 bg-white p-1.5 pl-4 shadow-sm">
          <Search className="h-4 w-4 shrink-0 text-neutral-400" />
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search articles…"
            aria-label="Search articles"
            className="h-9 min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
          <button type="submit" className="h-9 shrink-0 rounded-full bg-neutral-950 px-4 text-sm font-semibold text-white hover:bg-neutral-800">
            Search
          </button>
        </form>
      </PageHero>
      <PostListing basePath="/blog" page={page} q={q} sort={sort} />
    </>
  );
}
