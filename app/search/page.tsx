import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  FileText,
  Search,
  Sparkles,
} from "lucide-react";
import { sql } from "@/lib/db";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

type SearchResult = {
  id: string;
  title: string;
  description: string | null;
  href: string;
  type: "Project" | "Post";
};

const services = [
  {
    title: "Web Development",
    description: "Modern websites and web applications.",
    href: "/services/web-development",
  },
  {
    title: "WordPress",
    description: "Custom WordPress websites and solutions.",
    href: "/services/wordpress",
  },
  {
    title: "UI / UX Design",
    description: "Clean and intuitive digital experiences.",
    href: "/services/design",
  },
];

export default async function SearchPage({
  searchParams,
}: SearchPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";

  let results: SearchResult[] = [];

  if (query) {
    const searchTerm = `%${query}%`;

    const [projects, posts] = await Promise.all([
      sql`
        select
          id,
          title,
          short_description
        from projects
        where
          title ilike ${searchTerm}
          or short_description ilike ${searchTerm}
          or description ilike ${searchTerm}
          or category ilike ${searchTerm}
        order by featured desc, created_at desc
        limit 12
      `,

      sql`
        select
          id,
          title,
          excerpt,
          slug
        from posts
        where
          status = 'published'
          and (
            title ilike ${searchTerm}
            or excerpt ilike ${searchTerm}
            or content ilike ${searchTerm}
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
        href: `/projects/${project.slug ?? project.id}`,
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
      {/* =========================================================
          BACKGROUND
      ========================================================== */}

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
            maskImage:
              "linear-gradient(to bottom, black, transparent 75%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black, transparent 75%)",
          }}
        />
      </div>

      {/* =========================================================
          CONTENT
      ========================================================== */}

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-16 sm:px-8 lg:px-10 lg:py-20">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3.5 py-2 shadow-sm">
            <Search className="h-3.5 w-3.5 text-neutral-500" />

            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Search Nirdeshona
            </span>
          </div>

          <h1 className="mt-6 text-4xl font-bold tracking-[-0.04em] text-neutral-950 sm:text-5xl">
            Find what you&apos;re looking for.
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-neutral-500 sm:text-base">
            Search through our projects, articles, services, and other
            resources.
          </p>
        </div>

        {/* Search form */}
        <form
          action="/search"
          method="GET"
          className="mx-auto mt-10 max-w-3xl"
        >
          <div className="group flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-2 shadow-lg shadow-black/[0.04] transition focus-within:border-neutral-300 focus-within:shadow-xl focus-within:shadow-black/[0.06]">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 transition group-focus-within:bg-neutral-950 group-focus-within:text-white">
              <Search className="h-5 w-5" />
            </div>

            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search projects, posts, services..."
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent px-1 text-sm text-neutral-950 outline-none placeholder:text-neutral-400 sm:text-base"
            />

            <button
              type="submit"
              className="hidden h-12 shrink-0 items-center gap-2 rounded-xl bg-neutral-950 px-5 text-sm font-semibold text-white transition hover:bg-neutral-800 sm:inline-flex"
            >
              Search
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <button
            type="submit"
            className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 text-sm font-semibold text-white transition hover:bg-neutral-800 sm:hidden"
          >
            <Search className="h-4 w-4" />
            Search
          </button>
        </form>

        {/* =======================================================
            SEARCH RESULTS
        ======================================================== */}

        {query ? (
          <section className="mx-auto mt-14 max-w-4xl">
            <div className="mb-6 flex items-end justify-between gap-4 border-b border-neutral-200 pb-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                  Search results
                </p>

                <h2 className="mt-1 text-xl font-semibold tracking-tight text-neutral-950">
                  Results for &quot;{query}&quot;
                </h2>
              </div>

              <span className="shrink-0 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-500">
                {results.length}{" "}
                {results.length === 1 ? "result" : "results"}
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
                          {result.type}
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
                  No results found
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
                  We couldn&apos;t find anything matching &quot;{query}&quot;.
                  Try a different keyword or explore our services below.
                </p>

                <Link
                  href="/services"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
                >
                  Explore services
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </section>
        ) : (
          /* =====================================================
             EMPTY SEARCH STATE
          ====================================================== */

          <section className="mx-auto mt-14 max-w-4xl">
            <div className="mb-5 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-neutral-400" />

              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
                Explore Nirdeshona
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {/* Services */}
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
                  Our Services
                </h2>

                <p className="mt-1 text-sm leading-6 text-neutral-500">
                  Web development, WordPress, UI/UX and digital solutions.
                </p>
              </Link>

              {/* Projects */}
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
                  Our Work
                </h2>

                <p className="mt-1 text-sm leading-6 text-neutral-500">
                  Explore the websites and digital products we&apos;ve built.
                </p>
              </Link>
            </div>

            {/* Popular services */}
            <div className="mt-8 rounded-3xl border border-neutral-200 bg-neutral-50/70 p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-neutral-400" />

                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
                  Popular
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