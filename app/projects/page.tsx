import type { Metadata } from "next";

import { PageHero } from "@/app/components/marketing";
import ProjectExplorer, { type ExplorerProject } from "@/app/components/projects/project-explorer";
import { sql } from "@/lib/db";

export const metadata: Metadata = {
  title: "Our Work — Nirdeshona Web",
  description: "Websites, web applications and digital products built by Nirdeshona Web Development.",
  alternates: { canonical: "/projects" },
};

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;

  // The whole (small) portfolio is sent once; filtering happens instantly in the browser.
  const projects = (await sql`
    select p.id, p.slug, p.title, p.short_description, p.category, p.status::text as status,
           p.progress_percent, p.cover_image_url, p.live_url, p.featured,
           c.name as client_name,
           extract(year from coalesce(p.completed_at, p.started_at, p.created_at::date))::int as year,
           coalesce(p.completed_at, p.started_at, p.created_at::date)::text as sort_date,
           coalesce(
             (select array_agg(t.name order by t.name)
              from project_technologies pt join technologies t on t.id = pt.technology_id
              where pt.project_id = p.id),
             '{}'
           ) as technologies
    from projects p
    left join clients c on c.id = p.client_id
    order by p.featured desc, coalesce(p.completed_at, p.started_at, p.created_at::date) desc
  `) as unknown as ExplorerProject[];

  const completed = projects.filter((p) => p.status === "COMPLETED").length;
  const active = projects.filter((p) => p.status === "IN_PROGRESS" || p.status === "REVIEW").length;
  const clients = new Set(projects.map((p) => p.client_name).filter(Boolean)).size;
  const techs = new Set(projects.flatMap((p) => p.technologies)).size;

  return (
    <>
      <PageHero
        eyebrow="Portfolio"
        title="Work we've designed, built and launched."
        description="Websites, platforms and tools for organisations, businesses and individuals — filter by category, status or technology."
        breadcrumbs={[{ label: "Our work" }]}
      >
        <div className="grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat value={projects.length} label="Projects" />
          <Stat value={completed} label="Launched" />
          <Stat value={active} label="In progress" />
          <Stat value={techs || clients} label={techs ? "Technologies" : "Clients"} />
        </div>
      </PageHero>

      <ProjectExplorer
        projects={projects}
        initial={{
          q: (params.q ?? "").slice(0, 80),
          category: params.category ?? "",
          status: params.status === "IN_PROGRESS" ? "ACTIVE" : (params.status ?? ""),
          tech: params.tech ?? "",
          sort: params.sort ?? "",
          view: params.view ?? "",
        }}
      />
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
