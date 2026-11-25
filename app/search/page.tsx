import Link from "@/app/components/locale-link";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  FileText,
  Search,
  Sparkles,
} from "lucide-react";
import { sql } from "@/lib/db";
import NavSubmitButton from "@/app/components/nav-submit-button";
import { getContent } from "@/lib/content";
import { getI18n } from "@/lib/i18n/server";
import { tcol } from "@/lib/i18n/sql";

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

type SearchResult = {
  id: string;
  title: string;
  description: string | null;
  href: string;
  type: "Project" | "Post";
};

export async function generateMetadata() {
  const { L } = await getI18n();
  return { title: L("Search — Nirdeshona Web", "খুঁজুন — নির্দেশনা ওয়েব"), robots: { index: false } };
}

export default async function SearchPage({
  searchParams,
}: SearchPageProps) {
  const { L, locale, num } = await getI18n();
  const services = getContent(locale)
    .services.slice(0, 3)
    .map((s) => ({ title: s.title, description: s.short, href: `/services/${s.slug}` }));
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  let results: SearchResult[] = [];

  if (query) {
    const searchTerm = `%${query}%`;

    const [projects, posts] = await Promise.all([
      sql`
        select
          id,
          slug,
          ${tcol(locale, "title")} as title,
          ${tcol(locale, "short_description")} as short_description
        from projects
        where
          title ilike ${searchTerm}
          or short_description ilike ${searchTerm}
          or description ilike ${searchTerm}
          or category ilike ${searchTerm}
          or title_bn ilike ${searchTerm}
          or short_description_bn ilike ${searchTerm}
          or description_bn ilike ${searchTerm}
        order by featured desc, created_at desc
        limit 12
      `,
      sql`
        select
          id,
          slug,
          ${tcol(locale, "title")} as title,
          ${tcol(locale, "excerpt")} as excerpt
        from posts
        where
          status = 'published'
          and (
            title ilike ${searchTerm}
            or excerpt ilike ${searchTerm}
            or content ilike ${searchTerm}
            or title_bn ilike ${searchTerm}
            or excerpt_bn ilike ${searchTerm}
            or content_bn ilike ${searchTerm}
          )
        order by published_at desc nulls last, created_at desc
        limit 12
      `,
    ]);

    results = [
      ...projects.map((project) => ({
        id: String(project.id),
        title: String(project.title),
        description: project.short_description
          ? String(project.short_description)
          : null,
        href: `/projects/${project.slug}`,
        type: "Project" as const,
      })),
      ...posts.map((post) => ({
        id: String(post.id),
        title: String(post.title),
        description: post.excerpt ? String(post.excerpt) : null,
        href: `/blog/${post.slug}`,
        type: "Post" as const,
      })),
    ];
  }

  return (
    <main className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-neutral-100/70 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.3]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #e5e5e5 1px, transparent 1px), linear-gradient(to bottom, #e5e5e5 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "linear-gradient(to bottom, black, transparent 75%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black, transparent 75%)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-16 sm:px-8 lg:px-10 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3.5 py-2 shadow-sm">
            <Search className="h-3.5 w-3.5 text-neutral-500" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
              {L("Search Nirdeshona", "নির্দেশনায় খুঁজুন")}
            </span>
          </div>

          <h1 className="mt-6 text-4xl font-bold tracking-[-0.04em] text-neutral-950 sm:text-5xl">
            {L("Find what you're looking for.", "যা খুঁজছেন, এখানেই খুঁজুন।")}
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-neutral-500 sm:text-base">
            {L("Search through our projects, articles, services, and other resources.", "আমাদের প্রজেক্ট, লেখা, সার্ভিস ও অন্যান্য রিসোর্সে খুঁজুন।")}
          </p>
        </div>

        <form action={`/${locale}/search`} method="GET" className="mx-auto mt-10 max-w-3xl">
          <div className="group flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-2 shadow-lg shadow-black/[0.04] transition focus-within:border-neutral-300 focus-within:shadow-xl focus-within:shadow-black/[0.06]">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 transition group-focus-within:bg-neutral-950 group-focus-within:text-white">
              <Search className="h-5 w-5" />
            </div>

            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder={L("Search projects, posts, services...", "প্রজেক্ট, লেখা, সার্ভিস খুঁজুন...")}
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent px-1 text-sm text-neutral-950 outline-none placeholder:text-neutral-400 sm:text-base"
            />

            <NavSubmitButton className="hidden h-12 shrink-0 items-center gap-2 rounded-xl bg-neutral-950 px-5 text-sm font-semibold text-white transition hover:bg-neutral-800 sm:inline-flex">
              {L("Search", "খুঁজুন")}
              <ArrowRight className="h-4 w-4" />
            </NavSubmitButton>
          </div>

          <NavSubmitButton
            icon={<Search className="h-4 w-4" />}
            className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 text-sm font-semibold text-white transition hover:bg-neutral-800 sm:hidden"
          >
            {L("Search", "খুঁজুন")}
          </NavSubmitButton>
        </form>

        {query ? (
          <section className="mx-auto mt-14 max-w-4xl">
            <div className="mb-6 flex items-end justify-between gap-4 border-b border-neutral-200 pb-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                  {L("Search results", "সার্চের ফলাফল")}
                </p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-neutral-950">
                  {L("Results for", "যার জন্য ফলাফল:")} &quot;{query}&quot;
                </h2>
              </div>

              <span className="shrink-0 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-500">
                {L(`${results.length} ${results.length === 1 ? "result" : "results"}`, `${num(results.length)}টি ফলাফল`)}
              </span>
            </div>

            {results.length > 0 ? (
              <div className="space-y-2">
                {results.map((result) => (
                  <Link
                    key={`${result.type}-${result.id}`}
                    href={result.href}
                    className="group flex items-center gap-4 rounded-2xl border border-transparent p-4 transition duration-200 hover:border-neutral-200 hover:bg-white hover:shadow-sm"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 transition group-hover:bg-neutral-950 group-hover:text-white">
                      {result.type === "Project" ? (
                        <BriefcaseBusiness className="h-4 w-4" />
                      ) : (
                        <FileText className="h-4 w-4" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-sm font-semibold text-neutral-900">
                          {result.title}
                        </h3>

                        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-500">
                          {result.type === "Project" ? L("Project", "প্রজেক্ট") : L("Post", "লেখা")}
                        </span>
                      </div>

                      {result.description && (
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-neutral-500">
                          {result.description}
                        </p>
                      )}
                    </div>

                    <ArrowRight className="h-4 w-4 shrink-0 text-neutral-300 transition group-hover:translate-x-0.5 group-hover:text-neutral-700" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-neutral-200 bg-neutral-50/70 px-6 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-neutral-400 shadow-sm">
                  <Search className="h-6 w-6" />
                </div>

                <h2 className="mt-5 text-lg font-semibold text-neutral-900">
                  {L("No results found", "কোনো ফলাফল পাওয়া যায়নি")}
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
                  {L(`We couldn't find anything matching "${query}". Try a different keyword or explore our services below.`, `“${query}”-এর সাথে মেলে এমন কিছু পাওয়া যায়নি। অন্য শব্দে চেষ্টা করুন বা নিচে আমাদের সার্ভিসগুলো দেখুন।`)}
                </p>

                <Link
                  href="/services"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
                >
                  {L("Explore services", "সার্ভিসগুলো দেখুন")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </section>
        ) : (
          <section className="mx-auto mt-14 max-w-4xl">
            <div className="mb-5 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-neutral-400" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
                {L("Explore Nirdeshona", "নির্দেশনা ঘুরে দেখুন")}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                href="/services"
                className="group rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 transition group-hover:bg-neutral-950 group-hover:text-white">
                    <BriefcaseBusiness className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-neutral-300 transition group-hover:translate-x-0.5 group-hover:text-neutral-700" />
                </div>

                <h2 className="mt-5 text-base font-semibold text-neutral-950">
                  {L("Our Services", "আমাদের সার্ভিস")}
                </h2>

                <p className="mt-1 text-sm leading-6 text-neutral-500">
                  {L("Web development, WordPress, UI/UX and digital solutions.", "ওয়েব ডেভেলপমেন্ট, ওয়ার্ডপ্রেস, ইউআই/ইউএক্স ও ডিজিটাল সমাধান।")}
                </p>
              </Link>

              <Link
                href="/projects"
                className="group rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 transition group-hover:bg-neutral-950 group-hover:text-white">
                    <BriefcaseBusiness className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-neutral-300 transition group-hover:translate-x-0.5 group-hover:text-neutral-700" />
                </div>

                <h2 className="mt-5 text-base font-semibold text-neutral-950">
                  {L("Our Work", "আমাদের কাজ")}
                </h2>

                <p className="mt-1 text-sm leading-6 text-neutral-500">
                  {L("Explore the websites and digital products we've built.", "আমাদের বানানো ওয়েবসাইট ও ডিজিটাল প্রোডাক্টগুলো দেখুন।")}
                </p>
              </Link>
            </div>

            <div className="mt-8 rounded-3xl border border-neutral-200 bg-neutral-50/70 p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-neutral-400" />
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
                  {L("Popular", "জনপ্রিয়")}
                </p>
              </div>

              <div className="mt-4 divide-y divide-neutral-200">
                {services.map((service) => (
                  <Link
                    key={service.href}
                    href={service.href}
                    className="group flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-neutral-800 transition group-hover:text-neutral-950">
                        {service.title}
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-500">
                        {service.description}
                      </p>
                    </div>

                    <ArrowRight className="h-4 w-4 shrink-0 text-neutral-300 transition group-hover:translate-x-0.5 group-hover:text-neutral-700" />
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}