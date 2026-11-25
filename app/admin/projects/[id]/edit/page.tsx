import Link from "next/link";
import { notFound } from "next/navigation";
import { sql } from "@/lib/db";
import { updateProject } from "../../actions";
import ProjectForm from "../../project-form";
import { requireAdmin } from "@/lib/auth/require-admin";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

function formatDate(value: unknown) {
  if (!value) {
    return "";
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return String(value).slice(0, 10);
}

export default async function EditProjectPage({
  params,
}: Props) {
  await requireAdmin();

  const { id } = await params;

  const [projectResult, clients, technologies, known] = await Promise.all([
    sql`
      select
        id,
        client_id,
        title,
        slug,
        short_description,
        description,
        title_bn,
        short_description_bn,
        description_bn,
        category,
        status,
        progress_percent,
        featured,
        cover_image_url,
        live_url,
        repository_url,
        started_at,
        completed_at
      from projects
      where id = ${id}
      limit 1
    `,

    sql`
      select
        id,
        name
      from clients
      order by name asc
    `,
    sql`
      select t.name from project_technologies pt join technologies t on t.id = pt.technology_id
      where pt.project_id = ${id} order by t.name
    `,
    sql`select name from technologies order by name`,
  ]);

  const project = projectResult[0];

  if (!project) {
    notFound();
  }


  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* Header */}

      <div className="mb-8">
        <div className="mb-3">
          <Link
            href="/admin/projects"
            className="text-sm text-neutral-500 transition hover:text-neutral-950"
          >
            ← Projects
          </Link>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">
              Edit project
            </h1>

            <p className="mt-2 text-sm text-neutral-500">
              Update the project information and settings.
            </p>
          </div>

          <span className="w-fit rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-600">
            {project.status}
          </span>
        </div>
      </div>

      <ProjectForm
        action={updateProject.bind(null, id)}
        knownTechnologies={known.map((t) => String(t.name))}
        submitLabel="Save changes"
        clients={clients.map((client) => ({
          id: client.id,
          name: client.name,
        }))}
        defaultValues={{
          title: project.title,
          slug: project.slug,
          short_description:
            project.short_description ?? "",
          description:
            project.description ?? "",
          title_bn: project.title_bn ?? "",
          short_description_bn: project.short_description_bn ?? "",
          description_bn: project.description_bn ?? "",
          category:
            project.category ?? "",
          client_id:
            project.client_id ?? "",
          status:
            project.status,
          progress_percent:
            project.progress_percent ?? 0,
          featured:
            project.featured ?? false,
          cover_image_url:
            project.cover_image_url ?? "",
          live_url:
            project.live_url ?? "",
          repository_url:
            project.repository_url ?? "",
          started_at:
            formatDate(project.started_at),
          completed_at:
            formatDate(project.completed_at),
          technologies: technologies.map((t) => String(t.name)),
        }}
      />
    </div>
  );
}