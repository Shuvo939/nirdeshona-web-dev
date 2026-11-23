import Link from "next/link";
import { sql } from "@/lib/db";
import { deleteProject } from "./actions";
import DeleteProjectButton from "./delete-project-button";
import {
  CheckCircle2,
  Clock3,
  Eye,
  FolderKanban,
  PauseCircle,
  Pencil,
  Plus,
  RefreshCw,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth/require-admin";

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    icon: typeof Clock3;
    className: string;
  }
> = {
  PLANNED: {
    label: "Planned",
    icon: Clock3,
    className: "bg-neutral-100 text-neutral-700",
  },
  IN_PROGRESS: {
    label: "In Progress",
    icon: RefreshCw,
    className: "bg-blue-50 text-blue-700",
  },
  REVIEW: {
    label: "Review",
    icon: Eye,
    className: "bg-amber-50 text-amber-700",
  },
  COMPLETED: {
    label: "Completed",
    icon: CheckCircle2,
    className: "bg-emerald-50 text-emerald-700",
  },
  ON_HOLD: {
    label: "On Hold",
    icon: PauseCircle,
    className: "bg-orange-50 text-orange-700",
  },
};

export default async function AdminProjectsPage() {
  await requireAdmin();

  const projects = await sql`
    select
      id,
      title,
      slug,
      category,
      status,
      progress_percent,
      featured,
      created_at
    from projects
    order by created_at desc
  `;

  const totalProjects = projects.length;
  const completedProjects = projects.filter(
    (project) => project.status === "COMPLETED"
  ).length;
  const activeProjects = projects.filter(
    (project) =>
      project.status === "IN_PROGRESS" ||
      project.status === "REVIEW"
  ).length;
  const featuredProjects = projects.filter(
    (project) => project.featured
  ).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-neutral-500">
            <FolderKanban className="h-4 w-4" />
            Admin / Projects
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-neutral-950">
            Projects
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
            Manage your portfolio projects, their progress, visibility, and
            project information.
          </p>
        </div>

        <Link
          href="/admin/projects/new"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-black px-5 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Projects"
          value={totalProjects}
          icon={<FolderKanban className="h-5 w-5" />}
        />

        <StatCard
          label="Active"
          value={activeProjects}
          icon={<RefreshCw className="h-5 w-5" />}
        />

        <StatCard
          label="Completed"
          value={completedProjects}
          icon={<CheckCircle2 className="h-5 w-5" />}
        />

        <StatCard
          label="Featured"
          value={featuredProjects}
          icon={<Eye className="h-5 w-5" />}
        />
      </div>

      {/* Projects */}
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        {/* Table header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <div>
            <h2 className="font-semibold text-neutral-950">
              All Projects
            </h2>

            <p className="mt-0.5 text-xs text-neutral-500">
              {totalProjects}{" "}
              {totalProjects === 1 ? "project" : "projects"} total
            </p>
          </div>
        </div>

        {projects.length === 0 ? (
          <EmptyProjects />
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50/70 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    <th className="px-5 py-3">Project</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Progress</th>
                    <th className="px-5 py-3">Featured</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-neutral-100">
                  {projects.map((project) => {
                    const status =
                      STATUS_CONFIG[project.status] ??
                      STATUS_CONFIG.PLANNED;

                    const StatusIcon = status.icon;

                    return (
                      <tr
                        key={project.id}
                        className="transition hover:bg-neutral-50/70"
                      >
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-medium text-neutral-950">
                              {project.title}
                            </p>

                            <p className="mt-0.5 text-xs text-neutral-400">
                              /{project.slug}
                            </p>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          {project.category ? (
                            <span className="rounded-lg bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700">
                              {project.category}
                            </span>
                          ) : (
                            <span className="text-sm text-neutral-400">
                              —
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
                          >
                            <StatusIcon className="h-3.5 w-3.5" />
                            {status.label}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex min-w-[120px] items-center gap-3">
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-100">
                              <div
                                className="h-full rounded-full bg-black transition-all"
                                style={{
                                  width: `${project.progress_percent}%`,
                                }}
                              />
                            </div>

                            <span className="w-9 text-right text-xs font-medium text-neutral-600">
                              {project.progress_percent}%
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          {project.featured ? (
                            <span className="text-xs font-medium text-neutral-900">
                              Yes
                            </span>
                          ) : (
                            <span className="text-xs text-neutral-400">
                              No
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/admin/projects/${project.id}/edit`}
                              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950"
                            >
                              <Pencil className="h-4 w-4" />
                              Edit
                            </Link>

                            <DeleteProjectButton
                              projectId={project.id}
                              projectTitle={project.title}
                              deleteAction={deleteProject}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="divide-y divide-neutral-100 md:hidden">
              {projects.map((project) => {
                const status =
                  STATUS_CONFIG[project.status] ??
                  STATUS_CONFIG.PLANNED;

                const StatusIcon = status.icon;

                return (
                  <div key={project.id} className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-neutral-950">
                          {project.title}
                        </h3>

                        <p className="mt-0.5 truncate text-xs text-neutral-400">
                          /{project.slug}
                        </p>
                      </div>

                      {project.featured && (
                        <span className="shrink-0 rounded-full bg-black px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                          Featured
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {project.category && (
                        <span className="rounded-lg bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700">
                          {project.category}
                        </span>
                      )}

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
                      >
                        <StatusIcon className="h-3.5 w-3.5" />
                        {status.label}
                      </span>
                    </div>

                    <div className="mt-5">
                      <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="text-neutral-500">
                          Progress
                        </span>

                        <span className="font-semibold text-neutral-800">
                          {project.progress_percent}%
                        </span>
                      </div>

                      <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
                        <div
                          className="h-full rounded-full bg-black"
                          style={{
                            width: `${project.progress_percent}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/projects/${project.id}/edit`}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Link>

                      <DeleteProjectButton
                        projectId={project.id}
                        projectTitle={project.title}
                        deleteAction={deleteProject}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700">
          {icon}
        </div>

        <span className="text-2xl font-bold tracking-tight text-neutral-950">
          {value}
        </span>
      </div>

      <p className="mt-4 text-sm text-neutral-500">{label}</p>
    </div>
  );
}

function EmptyProjects() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100">
        <FolderKanban className="h-6 w-6 text-neutral-500" />
      </div>

      <h3 className="mt-5 font-semibold text-neutral-950">
        No projects yet
      </h3>

      <p className="mt-2 max-w-sm text-sm leading-6 text-neutral-500">
        Create your first project to start building your Nirdeshona portfolio.
      </p>

      <Link
        href="/admin/projects/new"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
      >
        <Plus className="h-4 w-4" />
        Create Project
      </Link>
    </div>
  );
}