import type { Metadata } from "next";
import Link from "next/link";
import { Layers3, Search } from "lucide-react";

import { PageHero } from "@/app/components/marketing";
import ProjectCard, { type ProjectCardData } from "@/app/components/project-card";
import { sql } from "@/lib/db";

export const metadata: Metadata = {
  title: "Our Work — Nirdeshona Web",
  description: "Websites, web applications and digital products built by Nirdeshona Web Development.",
  alternates: { canonical: "/projects" },
};

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "COMPLETED", label: "Completed" },
  { value: "IN_PROGRESS", label: "In progress" },
];

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; status?: string; q?: string }>;
}) {
  const params = await searchParams;
  const category = params.category?.trim() || null;
  const status = STATUS_FILTERS.some((s) => s.value === params.status) ? params.status || null : null;
  const q = params.q?.trim().slice(0, 80) || null;
  const pattern = q ? `%${q}%` : null;

  const [projects, categories, [counts]] = await Promise.all([
    sql`
      select p.id, p.slug, p.title, p.short_description, p.category, p.status,
             p.progress_percent, p.cover_image_url, c.name as client_name
      from projects p
      left join clients c on c.id = p.client_id
      where (${category}::text is null or p.category = ${category})
        and (${status}::text is null or p.status::text = ${status}
             or (${status} = 'IN_PROGRESS' and p.status in ('IN_PROGRESS', 'REVIEW')))
        and (${pattern}::text is null or p.title ilike ${pattern} or p.short_description ilike ${pattern})
      order by p.featured desc, coalesce(p.completed_at, p.started_at, p.created_at::date) desc
    ` as unknown as Promise<ProjectCardData[]>,
    sql`
      select category, count(*)::int as total
      from projects
      where category is not null
      group by category
      order by total desc, category asc
    `,
    sql`
      select count(*)::int as total,
             count(*) filter (where status = 'COMPLETED')::int as completed,
             count(distinct client_id)::int as clients
      from projects
    `,
  ]);

  function href(next: { category?: string | null; status?: string | null }) {
    const search = new URLSearchParams();
    const c = next.category === undefined ? category : next.category;
    const s = next.status === undefined ? status : next.status;
    if (c) search.set("category", c);
    if (s) search.set("status", s);
    if (q) search.set("q", q);
    const str = search.toString();
    return str ? `/projects?${str}` : "/projects";
  }

  return (
    <>
      <PageHero
        eyebrow="Portfolio"
        title="Work we've designed, built and launched."
        description="A selection of websites, platforms and tools for organisations, businesses and individuals."
        breadcrumbs={[{ label: "Our work" }]}
      >
        <div className="grid max-w-lg grid-cols-3 gap-3">
          <Stat value={counts?.total ?? 0} label="Projects" />
          <Stat value={counts?.completed ?? 0} label="Completed" />
          <Stat value={counts?.clients ?? 0} label="Clients" />
        </div>
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:px-0">
            <FilterPill href={href({ category: null })} active={!category}>
              All categories
            </FilterPill>
            {categories.map((item) => (
              <FilterPill key={item.category} href={href({ category: item.category })} active={category === item.category}>
                {item.category}
                <span className="ml-1.5 text-[10px] opacity-60">{item.total}</span>
              </FilterPill>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex rounded-full border border-neutral-200 bg-white p-1">
              {STATUS_FILTERS.map((item) => (
                <Link
                  key={item.label}
                  href={href({ status: item.value || null })}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                    (status ?? "") === item.value ? "bg-neutral-950 text-white" : "text-neutral-600 hover:text-neutral-950"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <form action="/projects" className="relative">
              {category && <input type="hidden" name="category" value={category} />}
              {status && <input type="hidden" name="status" value={status} />}
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="search"
                name="q"
                defaultValue={q ?? ""}
                placeholder="Search projects"
                className="h-10 w-full rounded-full border border-neutral-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10 sm:w-56"
              />
            </form>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-neutral-300 bg-white px-6 py-20 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100">
              <Layers3 className="h-5 w-5 text-neutral-500" />
            </div>
            <h2 className="mt-5 text-lg font-semibold">No projects found</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">Try a different filter or search term.</p>
            <Link href="/projects" className="mt-6 inline-flex text-sm font-semibold underline">
              Clear filters
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-3">
      <p className="text-2xl font-bold tracking-tight text-neutral-950">{value}</p>
      <p className="text-xs text-neutral-500">{label}</p>
    </div>
  );
}

function FilterPill({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`inline-flex shrink-0 items-center rounded-full border px-3.5 py-2 text-xs font-medium transition ${
        active
          ? "border-neutral-950 bg-neutral-950 text-white"
          : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:text-neutral-950"
      }`}
    >
      {children}
    </Link>
  );
}
