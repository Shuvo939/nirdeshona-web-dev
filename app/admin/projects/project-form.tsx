import Link from "next/link";
import { PROJECT_CATEGORIES } from "@/lib/projects/categories";

const STATUSES = [
  {
    value: "PLANNED",
    label: "Planned",
  },
  {
    value: "IN_PROGRESS",
    label: "In Progress",
  },
  {
    value: "REVIEW",
    label: "Review",
  },
  {
    value: "COMPLETED",
    label: "Completed",
  },
  {
    value: "ON_HOLD",
    label: "On Hold",
  },
] as const;

type ClientOption = {
  id: string;
  name: string;
};

type ProjectFormValues = {
  title?: string;
  slug?: string;
  short_description?: string;
  description?: string;
  category?: string;
  client_id?: string;
  status?: string;
  progress_percent?: number;
  featured?: boolean;
  cover_image_url?: string;
  live_url?: string;
  repository_url?: string;
  started_at?: string;
  completed_at?: string;
};

type ProjectFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  defaultValues?: ProjectFormValues;
  clients?: ClientOption[];
};

export default function ProjectForm({
  action,
  defaultValues,
  clients = [],
}: ProjectFormProps) {
  const v = defaultValues ?? {};

  return (
    <form action={action} className="space-y-8">
      {/* =====================================================
          BASIC INFORMATION
      ====================================================== */}

      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-base font-semibold text-neutral-950">
            Basic Information
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Define the project&apos;s basic identity and description.
          </p>
        </div>

        <div className="space-y-5">
          {/* Title */}

          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-neutral-900"
            >
              Project title
            </label>

            <input
              id="title"
              name="title"
              type="text"
              defaultValue={v.title}
              required
              placeholder="e.g. Nirdeshona Website"
              className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100"
            />
          </div>

          {/* Slug */}

          <div>
            <label
              htmlFor="slug"
              className="block text-sm font-medium text-neutral-900"
            >
              Slug
            </label>

            <input
              id="slug"
              name="slug"
              type="text"
              defaultValue={v.slug}
              required
              placeholder="nirdeshona-website"
              className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 font-mono text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100"
            />

            <p className="mt-2 text-xs text-neutral-400">
              Use lowercase letters, numbers, and hyphens only.
            </p>
          </div>

          {/* Short Description */}

          <div>
            <label
              htmlFor="short_description"
              className="block text-sm font-medium text-neutral-900"
            >
              Short description
            </label>

            <input
              id="short_description"
              name="short_description"
              type="text"
              defaultValue={v.short_description}
              placeholder="A short summary of this project"
              className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100"
            />
          </div>

          {/* Description */}

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-neutral-900"
            >
              Full description
            </label>

            <textarea
              id="description"
              name="description"
              defaultValue={v.description}
              rows={7}
              placeholder="Describe the project, its goals, features, technologies, and outcomes..."
              className="mt-2 w-full resize-y rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100"
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          CLIENT ASSIGNMENT
      ====================================================== */}

      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-base font-semibold text-neutral-950">
            Client Assignment
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Assign this project to a client. You can leave it unassigned if
            this is a personal or internal project.
          </p>
        </div>

        <div>
          <label
            htmlFor="client_id"
            className="block text-sm font-medium text-neutral-900"
          >
            Client
          </label>

          <div className="relative mt-2">
            <select
              id="client_id"
              name="client_id"
              defaultValue={v.client_id ?? ""}
              className="w-full appearance-none rounded-xl border border-neutral-200 bg-white px-4 py-3 pr-10 text-sm outline-none transition focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100"
            >
              <option value="">No client</option>

              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>

            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-neutral-400">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>

          <p className="mt-2 text-xs text-neutral-400">
            {clients.length > 0
              ? `${clients.length} client${
                  clients.length === 1 ? "" : "s"
                } available.`
              : "No clients have been created yet."}
          </p>
        </div>
      </section>

      {/* =====================================================
          COVER IMAGE
      ====================================================== */}

      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-base font-semibold text-neutral-950">
            Cover Image
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Set the primary image used when this project is displayed.
          </p>
        </div>

        <div>
          <label
            htmlFor="cover_image_url"
            className="block text-sm font-medium text-neutral-900"
          >
            Cover image URL
          </label>

          <input
            id="cover_image_url"
            name="cover_image_url"
            type="url"
            defaultValue={v.cover_image_url}
            placeholder="https://..."
            className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100"
          />

          <p className="mt-2 text-xs text-neutral-400">
            The primary image for this project.
          </p>
        </div>
      </section>

      {/* =====================================================
          PROJECT CLASSIFICATION
      ====================================================== */}

      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-base font-semibold text-neutral-950">
            Classification
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Categorize the project so it can be filtered and displayed
            consistently.
          </p>
        </div>

        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-neutral-900"
          >
            Project category
          </label>

          <div className="relative mt-2">
            <select
              id="category"
              name="category"
              defaultValue={v.category ?? ""}
              className="w-full appearance-none rounded-xl border border-neutral-200 bg-white px-4 py-3 pr-10 text-sm outline-none transition focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100"
            >
              <option value="">Select a category</option>

              {PROJECT_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-neutral-400">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>

          <p className="mt-2 text-xs text-neutral-400">
            Choose one of the predefined Nirdeshona project categories.
          </p>
        </div>
      </section>

      {/* =====================================================
          STATUS & PROGRESS
      ====================================================== */}

      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-base font-semibold text-neutral-950">
            Project Status
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Track the current state and completion of the project.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {/* Status */}

          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-neutral-900"
            >
              Status
            </label>

            <select
              id="status"
              name="status"
              defaultValue={v.status ?? "PLANNED"}
              className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100"
            >
              {STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Progress */}

          <div>
            <label
              htmlFor="progress_percent"
              className="block text-sm font-medium text-neutral-900"
            >
              Progress
            </label>

            <div className="relative mt-2">
              <input
                id="progress_percent"
                name="progress_percent"
                type="number"
                min={0}
                max={100}
                defaultValue={v.progress_percent ?? 0}
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 pr-12 text-sm outline-none transition focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100"
              />

              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-neutral-400">
                %
              </span>
            </div>
          </div>
        </div>

        {/* Featured */}

        <div className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
          <label
            htmlFor="featured"
            className="flex cursor-pointer items-start gap-3"
          >
            <input
              id="featured"
              name="featured"
              type="checkbox"
              defaultChecked={v.featured}
              className="mt-0.5 h-4 w-4 rounded border-neutral-300"
            />

            <span>
              <span className="block text-sm font-medium text-neutral-900">
                Feature this project
              </span>

              <span className="mt-1 block text-xs leading-5 text-neutral-500">
                Featured projects can appear prominently on the public
                portfolio and homepage.
              </span>
            </span>
          </label>
        </div>
      </section>

      {/* =====================================================
          PROJECT TIMELINE
      ====================================================== */}

      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-base font-semibold text-neutral-950">
            Project Timeline
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Record when the project started and when it was completed.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="started_at"
              className="block text-sm font-medium text-neutral-900"
            >
              Started date
            </label>

            <input
              id="started_at"
              name="started_at"
              type="date"
              defaultValue={v.started_at}
              className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100"
            />
          </div>

          <div>
            <label
              htmlFor="completed_at"
              className="block text-sm font-medium text-neutral-900"
            >
              Completed date
            </label>

            <input
              id="completed_at"
              name="completed_at"
              type="date"
              defaultValue={v.completed_at}
              className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100"
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          LINKS
      ====================================================== */}

      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-base font-semibold text-neutral-950">
            Project Links
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Add links to the live project and source repository.
          </p>
        </div>

        <div className="space-y-5">
          {/* Live URL */}

          <div>
            <label
              htmlFor="live_url"
              className="block text-sm font-medium text-neutral-900"
            >
              Live project URL
            </label>

            <input
              id="live_url"
              name="live_url"
              type="url"
              defaultValue={v.live_url}
              placeholder="https://example.com"
              className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100"
            />
          </div>

          {/* Repository URL */}

          <div>
            <label
              htmlFor="repository_url"
              className="block text-sm font-medium text-neutral-900"
            >
              Repository URL
            </label>

            <input
              id="repository_url"
              name="repository_url"
              type="url"
              defaultValue={v.repository_url}
              placeholder="https://github.com/username/project"
              className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100"
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          ACTIONS
      ====================================================== */}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
        <Link
          href="/admin/projects"
          className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-200 bg-white px-5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 hover:text-neutral-950"
        >
          Cancel
        </Link>

        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-black px-6 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800"
        >
          Save project
        </button>
      </div>
    </form>
  );
}