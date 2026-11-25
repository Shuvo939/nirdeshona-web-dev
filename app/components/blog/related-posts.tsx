import Link from "@/app/components/locale-link";
import { Newspaper } from "lucide-react";

import { getI18n } from "@/lib/i18n/server";

type Related = { slug: string; title: string; excerpt: string | null; cover_image_url: string | null };

export default async function RelatedPosts({ posts }: { posts: Related[] }) {
  if (posts.length === 0) return null;
  const { L } = await getI18n();
  return (
    <section className="mt-16 border-t border-neutral-200 pt-10">
      <h2 className="text-xl font-bold tracking-tight text-neutral-950">{L("Keep reading", "আরও পড়ুন")}</h2>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {posts.map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}`} className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg">
            <div className="aspect-[16/9] overflow-hidden bg-neutral-100">
              {p.cover_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.cover_image_url} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Newspaper className="h-8 w-8 text-neutral-300" />
                </div>
              )}
            </div>
            <div className="p-4">
              <p className="line-clamp-2 text-sm font-semibold leading-snug text-neutral-950 group-hover:underline">{p.title}</p>
              {p.excerpt && <p className="mt-1 line-clamp-2 text-xs leading-5 text-neutral-500">{p.excerpt}</p>}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
