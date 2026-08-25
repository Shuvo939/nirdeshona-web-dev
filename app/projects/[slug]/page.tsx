import Link from "next/link";
import { notFound } from "next/navigation";
import { sql } from "@/lib/db";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  PauseCircle,
  RefreshCw,
  Eye,
  Code2,
  FolderKanban,
} from "lucide-react";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

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

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;

  const result = await sql`
    select
      title,
      short_description
    from projects
    where slug = ${slug}
    limit 1
  `;

  const project = result[0];

  if (!project) {
    return {
      title: "Project Not Found | Nirdeshona",
    };
  }

  return {
    title: `${project.title} | Nirdeshona`,
    description:
      project.short_description ||
      `View ${project.title} — a project by Nirdeshona.`,
  };
}

export default async function ProjectDetailsPage({
  params,
}: Props) {
  const { slug } = await params;

  const projectResult = await sql`
    select
      p.id,
      p.client_id,
      p.slug,
      p.title,
      p.short_description,
      p.description,
      p.category,
      p.status,
      p.progress_percent,
      p.featured,
      p.cover_image_url,
      p.live_url,
      p.repository_url,
      p.started_at,
      p.completed_at,
      p.created_at,
      p.updated_at,
      c.name as client_name
    from projects p
    left join clients c
      on c.id = p.client_id
    where p.slug = ${slug}
    limit 1
  `;

  const project = projectResult[0];

  if (!project) {
    notFound();
  }

  const media = await sql`
    select
      id,
      file_url,
      file_key,
      caption,
      sort_order
    from project_media
    where project_id = ${project.id}
    order by sort_order asc, created_at asc
  `;

  const technologies = await sql`
    select
      t.id,
      t.name
    from project_technologies pt
    inner join technologies t
      on t.id = pt.technology_id
    where pt.project_id = ${project.id}
    order by t.name asc
  `;

  const status =
    STATUS_CONFIG[project.status] ??
    STATUS_CONFIG.PLANNED;

  const StatusIcon = status.icon;

  const formatDate = (value: string | Date | null) => {
    if (!value) return null;

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(value));
  };

  return (
    <main className="min-h-screen bg-neutral-50">
      {/* =====================================================
          TOP NAVIGATION
      ====================================================== */}

      <div className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight text-neutral-950"
          >
            Nirdeshona
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition hover:text-neutral-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to projects
          </Link>
        </div>
      </div>

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto w-full max-w-6xl px-6 py-14 sm:py-20">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              {project.category && (
                <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700">
                  {project.category}
                </span>
              )}

              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${status.className}`}
              >
                <StatusIcon className="h-3.5 w-3.5" />
                {status.label}
              </span>

              {project.featured && (
                <span className="rounded-full bg-black px-3 py-1.5 text-xs font-medium text-white">
                  Featured
                </span>
              )}
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-neutral-950 sm:text-5xl lg:text-6xl">
              {project.title}
            </h1>

            {project.short_description && (
              <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-600 sm:text-xl">
                {project.short_description}
              </p>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              {project.live_url && (
                <a
                  href={project.live_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-black px-5 text-sm font-medium text-white transition hover:bg-neutral-800"
                >
                  Visit project
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              )}

              {project.repository_url && (
                <a
                  href={project.repository_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 hover:text-neutral-950"
                >
                  <Code2 className="h-4 w-4" />
                  Repository
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          COVER IMAGE
      ====================================================== */}

      {project.cover_image_url && (
        <section className="border-b border-neutral-200 bg-neutral-50">
          <div className="mx-auto w-full max-w-6xl px-6 py-10 sm:py-14">
            <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
              <img
                src={project.cover_image_url}
                alt={project.title}
                className="block aspect-[16/8] w-full object-cover"
              />
            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <section className="mx-auto w-full max-w-6xl px-6 py-14 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Main column */}

          <div className="space-y-10">
            {/* Description */}

            {project.description && (
              <article className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold tracking-tight text-neutral-950">
                    About this project
                  </h2>
                </div>

                <div className="whitespace-pre-line text-sm leading-7 text-neutral-600 sm:text-base sm:leading-8">
                  {project.description}
                </div>
              </article>
            )}

            {/* Technologies */}

            {technologies.length > 0 && (
              <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-xl font-semibold tracking-tight text-neutral-950">
                  Technologies
                </h2>

                <div className="mt-6 flex flex-wrap gap-2.5">
                  {technologies.map((technology) => (
                    <span
                      key={technology.id}
                      className="rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2 text-sm font-medium text-neutral-700"
                    >
                      {technology.name}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Media Gallery */}

            {media.length > 0 && (
              <section>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold tracking-tight text-neutral-950">
                    Project Gallery
                  </h2>

                  <p className="mt-1 text-sm text-neutral-500">
                    Screenshots and media from this project.
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  {media.map((item) => (
                    <figure
                      key={item.id}
                      className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm"
                    >
                      <img
                        src={item.file_url}
                        alt={
                          item.caption ||
                          `${project.title} project image`
                        }
                        className="aspect-video w-full object-cover transition duration-300 hover:scale-[1.02]"
                      />

                      {item.caption && (
                        <figcaption className="border-t border-neutral-100 px-4 py-3 text-sm text-neutral-500">
                          {item.caption}
                        </figcaption>
                      )}
                    </figure>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* =================================================
              SIDEBAR
          ================================================== */}

          <aside className="space-y-5">
            {/* Project information */}

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-neutral-950">
                Project Information
              </h2>

              <div className="mt-6 divide-y divide-neutral-100">
                {project.client_name && (
                  <div className="py-4 first:pt-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                      Client
                    </p>

                    <p className="mt-1.5 text-sm font-medium text-neutral-900">
                      {project.client_name}
                    </p>
                  </div>
                )}

                {project.category && (
                  <div className="py-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                      Category
                    </p>

                    <p className="mt-1.5 text-sm font-medium text-neutral-900">
                      {project.category}
                    </p>
                  </div>
                )}

                <div className="py-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                    Status
                  </p>

                  <span
                    className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${status.className}`}
                  >
                    <StatusIcon className="h-3.5 w-3.5" />
                    {status.label}
                  </span>
                </div>

                <div className="py-4 last:pb-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                    Progress
                  </p>

                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-500">
                        Completion
                      </span>

                      <span className="font-semibold text-neutral-900">
                        {project.progress_percent}%
                      </span>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-100">
                      <div
                        className="h-full rounded-full bg-black transition-all"
                        style={{
                          width: `${project.progress_percent}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}

            {(project.started_at || project.completed_at) && (
              <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-neutral-500" />

                  <h2 className="text-base font-semibold text-neutral-950">
                    Timeline
                  </h2>
                </div>

                <div className="mt-5 space-y-5">
                  {project.started_at && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                        Started
                      </p>

                      <p className="mt-1.5 text-sm font-medium text-neutral-900">
                        {formatDate(project.started_at)}
                      </p>
                    </div>
                  )}

                  {project.completed_at && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                        Completed
                      </p>

                      <p className="mt-1.5 text-sm font-medium text-neutral-900">
                        {formatDate(project.completed_at)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* External links */}

            {(project.live_url || project.repository_url) && (
              <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h2 className="text-base font-semibold text-neutral-950">
                  Links
                </h2>

                <div className="mt-4 space-y-2">
                  {project.live_url && (
                    <a
                      href={project.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-xl border border-neutral-200 px-4 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 hover:text-neutral-950"
                    >
                      <span className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        Live project
                      </span>

                      <ArrowUpRight className="h-4 w-4 text-neutral-400" />
                    </a>
                  )}

                  {project.repository_url && (
                    <a
                      href={project.repository_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-xl border border-neutral-200 px-4 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 hover:text-neutral-950"
                    >
                      <span className="flex items-center gap-2">
                        <Code2 className="h-4 w-4" />
                        Source repository
                      </span>

                      <ArrowUpRight className="h-4 w-4 text-neutral-400" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>

      {/* =====================================================
          FOOTER CTA
      ====================================================== */}

      <section className="border-t border-neutral-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center">
          <FolderKanban className="mx-auto h-7 w-7 text-neutral-400" />

          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-neutral-950">
            Explore more projects
          </h2>

          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-neutral-500">
            Discover more websites, digital products, and solutions built by
            Nirdeshona.
          </p>

          <Link
            href="/"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-black px-5 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            Back to portfolio
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}