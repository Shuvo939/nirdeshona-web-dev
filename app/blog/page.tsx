import type { Metadata } from "next";

import PostListing from "@/app/components/blog/post-listing";
import { PageHero } from "@/app/components/marketing";

export const metadata: Metadata = {
  title: "Blog — Nirdeshona Web",
  description: "Notes on web development, design, WordPress and running a website — from the Nirdeshona Web team.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const q = params.q?.trim().slice(0, 80) || null;

  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Ideas, guides and lessons from building for the web."
        description="Practical articles on web development, design and keeping a website healthy."
        breadcrumbs={[{ label: "Blog" }]}
      />
      <PostListing basePath="/blog" page={page} q={q} />
    </>
  );
}
