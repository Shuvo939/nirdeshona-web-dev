import type { Metadata } from "next";

import { PageHero } from "@/app/components/marketing";
import ProjectExplorer, { type ExplorerProject } from "@/app/components/projects/project-explorer";
import { sql } from "@/lib/db";
import { pageMeta } from "@/lib/seo";
import { getI18n } from "@/lib/i18n/server";
import { tcol } from "@/lib/i18n/sql";

export async function generateMetadata(): Promise<Metadata> {
  const { L, locale } = await getI18n();
  return pageMeta({
    locale,
    og: { title: "Our Work" },
    path: "/projects",
    title: L("Our Work — Nirdeshona Web", "আমাদের কাজ — নির্দেশনা ওয়েব"),
    description: L(
      "Websites, web applications and digital products built by Nirdeshona Web Development.",
      "নির্দেশনা ওয়েব ডেভেলপমেন্টের তৈরি ওয়েবসাইট, ওয়েব অ্যাপ্লিকেশন ও ডিজিটাল প্রোডাক্ট।",
    ),
  });
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const { L, locale, stat } = await getI18n();

  // The whole (small) portfolio is sent once; filtering happens instantly in the browser.
  const projects = (await sql`
    select p.id, p.slug, ${tcol(locale, "p.title")} as title, ${tcol(locale, "p.short_description")} as short_description,
           p.category, p.status::text as status,
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
        eyebrow={L("Portfolio", "পোর্টফোলিও")}
        title={L("Work we've designed, built and launched.", "আমাদের ডিজাইন করা, বানানো ও চালু করা কাজ।")}
        description={L(
          "Websites, platforms and tools for organisations, businesses and individuals — filter by category, status or technology.",
          "প্রতিষ্ঠান, ব্যবসা ও ব্যক্তির জন্য ওয়েবসাইট, প্ল্যাটফর্ম ও টুল — ক্যাটাগরি, অবস্থা বা প্রযুক্তি দিয়ে ফিল্টার করুন।",
        )}
        breadcrumbs={[{ label: L("Our work", "আমাদের কাজ") }]}
      >
        <div className="grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat value={stat(projects.length)} label={L("Projects", "প্রজেক্ট")} />
          <Stat value={stat(completed)} label={L("Launched", "চালু হয়েছে")} />
          <Stat value={stat(active)} label={L("In progress", "চলমান")} />
          <Stat value={stat(techs || clients)} label={techs ? L("Technologies", "প্রযুক্তি") : L("Clients", "ক্লায়েন্ট")} />
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

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-3">
      <p className="text-2xl font-bold tracking-tight text-neutral-950">{value}</p>
      <p className="text-xs text-neutral-500">{label}</p>
    </div>
  );
}
