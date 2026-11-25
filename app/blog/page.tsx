import type { Metadata } from "next";
import { Search } from "lucide-react";

import PostListing, { parseSort } from "@/app/components/blog/post-listing";
import { PageHero } from "@/app/components/marketing";
import NavSubmitButton from "@/app/components/nav-submit-button";
import { getI18n, localeAlternates } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { L, locale } = await getI18n();
  return {
    title: L("Blog — Nirdeshona Web", "ব্লগ — নির্দেশনা ওয়েব"),
    description: L(
      "Notes on web development, design, WordPress and running a website — from the Nirdeshona Web team.",
      "ওয়েব ডেভেলপমেন্ট, ডিজাইন, ওয়ার্ডপ্রেস ও ওয়েবসাইট পরিচালনা নিয়ে নির্দেশনা ওয়েব টিমের লেখা।",
    ),
    alternates: { ...localeAlternates(locale, "/blog"), types: { "application/rss+xml": "/blog/rss.xml" } },
  };
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const q = params.q?.trim().slice(0, 80) || null;
  const sort = parseSort(params.sort);
  const { L } = await getI18n();

  return (
    <>
      <PageHero
        eyebrow={L("Blog", "ব্লগ")}
        title={L("Ideas, guides and lessons from building for the web.", "ওয়েবের জন্য কাজ করতে গিয়ে পাওয়া ভাবনা, গাইড ও শিক্ষা।")}
        description={L("Practical articles on web development, design and keeping a website healthy.", "ওয়েব ডেভেলপমেন্ট, ডিজাইন ও ওয়েবসাইট সুস্থ রাখা নিয়ে কাজের লেখা।")}
        breadcrumbs={[{ label: L("Blog", "ব্লগ") }]}
      >
        <form action="/blog" role="search" className="flex w-full max-w-xl items-center gap-2 rounded-full border border-neutral-200 bg-white p-1.5 pl-4 shadow-sm">
          <Search className="h-4 w-4 shrink-0 text-neutral-400" />
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder={L("Search articles…", "লেখা খুঁজুন…")}
            aria-label={L("Search articles", "লেখা খুঁজুন")}
            className="h-9 min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
          <NavSubmitButton className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full bg-neutral-950 px-4 text-sm font-semibold text-white hover:bg-neutral-800">
            {L("Search", "খুঁজুন")}
          </NavSubmitButton>
        </form>
      </PageHero>
      <PostListing basePath="/blog" page={page} q={q} sort={sort} />
    </>
  );
}
