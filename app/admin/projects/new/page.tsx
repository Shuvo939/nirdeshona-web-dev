import Link from "next/link";
import { sql } from "@/lib/db";
import { createProject } from "../actions";
import ProjectForm from "../project-form";

export default async function NewProjectPage() {
  const clients = await sql`
    select
      id,
      name
    from clients
    order by name asc
  `;

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

        <h1 className="text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">
          Create project
        </h1>

        <p className="mt-2 text-sm text-neutral-500">
          Add a new project to your Nirdeshona portfolio.
        </p>
      </div>

      <ProjectForm
        action={createProject}
        clients={clients.map((client) => ({
          id: client.id,
          name: client.name,
        }))}
      />
    </div>
  );
}