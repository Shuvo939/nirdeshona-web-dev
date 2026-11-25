import Link from "@/app/components/locale-link";
import { ArrowUpRight, Layers3, Star } from "lucide-react";

import { PROJECT_STATUS, StatusBadge } from "@/app/components/marketing";
import T from "@/app/components/t";
import { categoryLabel } from "@/lib/projects/categories";

export type ProjectCardData = {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  category: string | null;
  status: string;
  progress_percent: number;
  cover_image_url: string | null;
  client_name?: string | null;
  technologies?: string[] | null;
  featured?: boolean;
};

export default function ProjectCard({ project }: { project: ProjectCardData }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
        {project.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.cover_image_url}
            alt={project.title}
            loading="lazy"
            className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,#f5f5f5,#e5e5e5)]">
            <Layers3 className="h-10 w-10 text-neutral-300" />
          </div>
        )}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
          <div className="flex flex-wrap gap-1.5">
            <StatusBadge map={PROJECT_STATUS} value={project.status} />
            {project.featured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-neutral-950/85 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
                <Star className="h-3 w-3 fill-amber-300 text-amber-300" /> <T en="Featured" bn="ফিচার্ড" />
              </span>
            )}
          </div>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-neutral-600 opacity-0 shadow-sm transition group-hover:opacity-100">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-semibold tracking-tight text-neutral-950">{project.title}</h3>
        {project.client_name && <p className="mt-1 text-xs text-neutral-400">{project.client_name}</p>}
        {project.short_description && (
          <p className="mt-3 line-clamp-2 flex-1 text-sm leading-6 text-neutral-500">{project.short_description}</p>
        )}
        {project.technologies && project.technologies.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.technologies.slice(0, 4).map((t) => (
              <span key={t} className="rounded-md border border-neutral-200 px-2 py-0.5 text-[11px] text-neutral-500">
                {t}
              </span>
            ))}
            {project.technologies.length > 4 && <span className="px-1 py-0.5 text-[11px] text-neutral-400">+{project.technologies.length - 4}</span>}
          </div>
        )}
        <div className="mt-5 flex items-center justify-between gap-3">
          {project.category ? (
            <span className="rounded-lg bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600">
              <T en={project.category} bn={categoryLabel(project.category, "bn")} />
            </span>
          ) : (
            <span />
          )}
          {project.status !== "COMPLETED" && (
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-neutral-100">
                <div className="h-full rounded-full bg-neutral-950" style={{ width: `${project.progress_percent}%` }} />
              </div>
              {project.progress_percent}%
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
