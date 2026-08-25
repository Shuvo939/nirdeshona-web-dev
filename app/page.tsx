import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Code2,
  Globe2,
  Layers3,
  MonitorSmartphone,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import { sql } from "@/lib/db";

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  PLANNED: {
    label: "Planned",
    className: "bg-neutral-100 text-neutral-600",
  },
  IN_PROGRESS: {
    label: "In Progress",
    className: "bg-blue-50 text-blue-700",
  },
  REVIEW: {
    label: "Review",
    className: "bg-amber-50 text-amber-700",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-emerald-50 text-emerald-700",
  },
  ON_HOLD: {
    label: "On Hold",
    className: "bg-orange-50 text-orange-700",
  },
};

export default async function HomePage() {
  const [featuredProjects, projectStats] = await Promise.all([
    sql`
      select
        p.id,
        p.slug,
        p.title,
        p.short_description,
        p.category,
        p.status,
        p.progress_percent,
        p.cover_image_url,
        p.client_id,
        c.name as client_name
      from projects p
      left join clients c on c.id = p.client_id
      where p.featured = true
      order by p.created_at desc
      limit 6
    `,
    sql`
      select
        count(*)::int as total,
        count(*) filter (where status = 'COMPLETED')::int as completed,
        count(*) filter (
          where status = 'IN_PROGRESS' or status = 'REVIEW'
        )::int as active
      from projects
    `,
  ]);

  const stats = projectStats[0] ?? {
    total: 0,
    completed: 0,
    active: 0,
  };

  return (
    <main className="min-h-screen overflow-hidden bg-white text-neutral-950">
      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative border-b border-neutral-200">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-neutral-100/80 blur-3xl" />
          <div className="absolute right-[-180px] top-[180px] h-[350px] w-[350px] rounded-full bg-neutral-100 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-5 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24 lg:px-8 lg:pb-32 lg:pt-28">
          <div className="grid items-center gap-14 lg:grid-cols-[1.15fr_.85fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3.5 py-2 text-xs font-medium text-neutral-600 shadow-sm">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black text-white">
                  <Sparkles className="h-3 w-3" />
                </span>
                Digital solutions for real-world needs
              </div>

              <h1 className="mt-7 max-w-4xl text-[3.1rem] font-bold leading-[.98] tracking-[-0.055em] sm:text-6xl lg:text-[5.4rem]">
                We build digital
                <span className="block text-neutral-400">
                  products that matter.
                </span>
              </h1>

              <p className="mt-7 max-w-2xl text-base leading-7 text-neutral-600 sm:text-lg sm:leading-8">
                Nirdeshona helps organizations, businesses, and individuals
                turn ideas into modern websites, web applications, and
                practical digital solutions.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="#projects"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-black px-6 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-neutral-800"
                >
                  Explore our work
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="#services"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-6 text-sm font-medium text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50"
                >
                  Explore services
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-xs text-neutral-500 sm:text-sm">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-neutral-700" />
                  Modern technology
                </span>

                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-neutral-700" />
                  Responsive by default
                </span>

                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-neutral-700" />
                  Built to grow
                </span>
              </div>
            </div>

            {/* Hero visual */}

            <div className="relative mx-auto w-full max-w-md lg:ml-auto">
              <div className="absolute -inset-5 rounded-[2rem] bg-neutral-100 blur-2xl" />

              <div className="relative overflow-hidden rounded-[2rem] border border-neutral-200 bg-white p-4 shadow-2xl shadow-neutral-200/60">
                <div className="rounded-[1.5rem] border border-neutral-200 bg-neutral-50 p-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-neutral-400">
                        Nirdeshona
                      </p>
                      <p className="mt-1 font-semibold tracking-tight">
                        Digital workspace
                      </p>
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-sm font-bold text-white">
                      N
                    </div>
                  </div>

                  <div className="mt-8 grid grid-cols-2 gap-3">
                    <MiniStat
                      label="Projects"
                      value={stats.total}
                    />
                    <MiniStat
                      label="Completed"
                      value={stats.completed}
                    />
                  </div>

                  <div className="mt-3 rounded-2xl border border-neutral-200 bg-white p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-neutral-500">
                        Active projects
                      </span>
                      <span className="text-sm font-bold">
                        {stats.active}
                      </span>
                    </div>

                    <div className="mt-4 space-y-3">
                      <ProgressRow label="Design" value={86} />
                      <ProgressRow label="Development" value={68} />
                      <ProgressRow label="Launch" value={42} />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-3 rounded-2xl bg-black p-4 text-white">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
                      <Rocket className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-xs font-medium">
                        Ready to build?
                      </p>
                      <p className="mt-0.5 text-[11px] text-neutral-400">
                        Turn your idea into something useful.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}

          <div className="mt-16 border-y border-neutral-200 py-7 sm:mt-20">
            <div className="grid grid-cols-3 divide-x divide-neutral-200">
              <Stat value={stats.total} label="Total projects" />
              <Stat value={stats.completed} label="Completed" />
              <Stat value={stats.active} label="Currently active" />
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          INTRO
      ====================================================== */}

      <section className="border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr] lg:gap-20">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                What is Nirdeshona?
              </p>

              <h2 className="mt-4 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
                Technology should make things simpler.
              </h2>
            </div>

            <div>
              <p className="text-lg leading-8 text-neutral-600">
                We combine thoughtful design, modern development, and practical
                problem-solving to create digital experiences that people can
                actually use.
              </p>

              <p className="mt-5 max-w-3xl text-sm leading-7 text-neutral-500 sm:text-base">
                Whether you need a professional website, a custom platform,
                an internal system, or a complete digital product, our focus
                stays the same: understand the problem, choose the right
                approach, and build something reliable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          PROJECTS
      ====================================================== */}

      <section
        id="projects"
        className="scroll-mt-20 border-b border-neutral-200 bg-neutral-50"
      >
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 sm:py-28 lg:px-8">
          <SectionHeading
            eyebrow="Selected work"
            title="Projects we're proud of."
            description="A look at some of the digital products, websites, and solutions currently being built or completed through Nirdeshona."
          />

          {featuredProjects.length === 0 ? (
            <div className="mt-12 rounded-[2rem] border border-neutral-200 bg-white px-6 py-20 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100">
                <Layers3 className="h-5 w-5 text-neutral-500" />
              </div>

              <h3 className="mt-5 text-lg font-semibold">
                Projects are coming soon
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
                We're preparing our latest work for the portfolio.
              </p>
            </div>
          ) : (
            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {featuredProjects.map((project) => {
                const status =
                  STATUS_CONFIG[project.status] ??
                  STATUS_CONFIG.PLANNED;

                return (
                  <Link
                    key={project.id}
                    href={`/projects/${project.slug}`}
                    className="group overflow-hidden rounded-[1.5rem] border border-neutral-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-neutral-200/50"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
                      {project.cover_image_url ? (
                        <img
                          src={project.cover_image_url}
                          alt={project.title}
                          className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Layers3 className="h-10 w-10 text-neutral-300" />
                        </div>
                      )}

                      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
                        <span
                          className={`rounded-full px-3 py-1.5 text-[11px] font-medium backdrop-blur ${status.className}`}
                        >
                          {status.label}
                        </span>

                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-neutral-600 opacity-0 shadow-sm transition group-hover:opacity-100">
                          <ArrowUpRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="font-semibold tracking-tight">
                            {project.title}
                          </h3>

                          {project.client_name && (
                            <p className="mt-1 text-xs text-neutral-400">
                              {project.client_name}
                            </p>
                          )}
                        </div>
                      </div>

                      {project.short_description && (
                        <p className="mt-4 line-clamp-2 text-sm leading-6 text-neutral-500">
                          {project.short_description}
                        </p>
                      )}

                      <div className="mt-5 flex items-center justify-between">
                        {project.category ? (
                          <span className="rounded-lg bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600">
                            {project.category}
                          </span>
                        ) : (
                          <span />
                        )}

                        <span className="text-xs text-neutral-400">
                          {project.progress_percent}%
                        </span>
                      </div>

                      <div className="mt-3 h-1 overflow-hidden rounded-full bg-neutral-100">
                        <div
                          className="h-full rounded-full bg-black"
                          style={{
                            width: `${project.progress_percent}%`,
                          }}
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="mt-8 text-center">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-sm font-medium text-neutral-700 transition hover:text-black"
            >
              View all projects
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          SERVICES
      ====================================================== */}

      <section id="services" className="scroll-mt-20 border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 sm:py-28 lg:px-8">
          <SectionHeading
            eyebrow="Capabilities"
            title="Everything you need to build online."
            description="Flexible digital services for organizations, businesses, creators, and individuals."
          />

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ServiceCard
              number="01"
              icon={<Globe2 />}
              title="Web Development"
              description="Fast, responsive, modern websites and web applications built around your goals."
            />

            <ServiceCard
              number="02"
              icon={<Code2 />}
              title="Custom Development"
              description="Custom functionality and digital systems designed for specific workflows and requirements."
            />

            <ServiceCard
              number="03"
              icon={<Layers3 />}
              title="WordPress Solutions"
              description="Custom WordPress themes, plugins, integrations, and professional content-driven websites."
            />

            <ServiceCard
              number="04"
              icon={<MonitorSmartphone />}
              title="Responsive Experiences"
              description="Interfaces designed to work beautifully across phones, tablets, laptops, and large screens."
            />

            <ServiceCard
              number="05"
              icon={<Workflow />}
              title="Digital Workflows"
              description="Connect people, content, data, and processes through practical digital systems."
            />

            <ServiceCard
              number="06"
              icon={<ShieldCheck />}
              title="Reliable Foundations"
              description="Maintainable architecture, sensible technology choices, and solutions designed for long-term use."
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          PROCESS
      ====================================================== */}

      <section className="border-b border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                Our process
              </p>

              <h2 className="mt-4 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
                From idea to something real.
              </h2>

              <p className="mt-5 max-w-md text-sm leading-7 text-neutral-500 sm:text-base">
                A straightforward process keeps projects focused, transparent,
                and moving forward.
              </p>
            </div>

            <div className="divide-y divide-neutral-200 rounded-[1.5rem] border border-neutral-200 bg-white">
              <ProcessStep
                number="01"
                title="Understand"
                description="We learn what you're trying to achieve, who it's for, and what problem needs to be solved."
              />

              <ProcessStep
                number="02"
                title="Plan"
                description="We define the structure, features, technology, and priorities before unnecessary complexity enters the project."
              />

              <ProcessStep
                number="03"
                title="Build"
                description="Design and development happen together with a focus on usability, performance, and maintainability."
              />

              <ProcessStep
                number="04"
                title="Improve"
                description="We test, refine, launch, and continue improving the product based on real needs and feedback."
              />
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          WHY NIRDESHONA
      ====================================================== */}

      <section id="about" className="scroll-mt-20 border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
              Why Nirdeshona
            </p>

            <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
              Practical thinking behind every project.
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-neutral-500 sm:text-base">
              We don't believe every problem needs more technology. It needs
              the right technology.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Reason
              icon={<Search />}
              title="Problem first"
              description="We start with the actual need instead of choosing technology first."
            />

            <Reason
              icon={<Sparkles />}
              title="Thoughtful design"
              description="Clean interfaces with clear hierarchy and useful interactions."
            />

            <Reason
              icon={<Code2 />}
              title="Modern stack"
              description="Current tools and sensible architecture without unnecessary complexity."
            />

            <Reason
              icon={<Rocket />}
              title="Built to grow"
              description="Projects are structured so they can evolve as your requirements change."
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          TECHNOLOGY
      ====================================================== */}

      <section className="border-b border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                Technology
              </p>

              <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                Built with modern tools.
              </h2>
            </div>

            <div className="flex max-w-3xl flex-wrap gap-2">
              {[
                "Next.js",
                "React",
                "TypeScript",
                "Tailwind CSS",
                "PostgreSQL",
                "Supabase",
                "WordPress",
                "Cloudflare",
              ].map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-medium text-neutral-600"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CTA
      ====================================================== */}

      <section>
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] bg-black px-6 py-14 text-white sm:px-10 sm:py-20 lg:px-16">
            <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-white/[0.08] blur-3xl" />
            <div className="absolute -bottom-40 left-1/3 h-72 w-72 rounded-full bg-white/[0.05] blur-3xl" />

            <div className="relative max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-neutral-300">
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                Have an idea?
              </div>

              <h2 className="mt-6 text-3xl font-bold tracking-[-0.04em] sm:text-5xl">
                Let's turn your idea into something useful.
              </h2>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-neutral-400 sm:text-base">
                Whether you're starting from scratch or improving something
                that already exists, tell us what you're trying to accomplish.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/admin/projects/new"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-medium text-black transition hover:bg-neutral-100"
                >
                  Start a project
                  <ArrowUpRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/projects"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/15 px-5 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  See our work
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   SECTION HEADING
========================================================= */

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
        {eyebrow}
      </p>

      <h2 className="mt-4 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
        {title}
      </h2>

      <p className="mt-4 text-sm leading-7 text-neutral-500 sm:text-base">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   STAT
========================================================= */

function Stat({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold tracking-tight sm:text-3xl">
        {value}
      </p>

      <p className="mt-1 text-[11px] text-neutral-500 sm:text-sm">
        {label}
      </p>
    </div>
  );
}

/* =========================================================
   MINI STAT
========================================================= */

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <p className="text-[11px] text-neutral-400">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
    </div>
  );
}

/* =========================================================
   PROGRESS ROW
========================================================= */

function ProgressRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div>
      <div className="flex justify-between text-[10px] text-neutral-400">
        <span>{label}</span>
        <span>{value}%</span>
      </div>

      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-neutral-100">
        <div
          className="h-full rounded-full bg-black"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

/* =========================================================
   SERVICE CARD
========================================================= */

function ServiceCard({
  number,
  icon,
  title,
  description,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-[1.5rem] border border-neutral-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-neutral-200/50 sm:p-7">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700 transition group-hover:bg-black group-hover:text-white">
          {icon}
        </div>

        <span className="text-xs font-medium text-neutral-300">
          {number}
        </span>
      </div>

      <h3 className="mt-6 font-semibold tracking-tight">{title}</h3>

      <p className="mt-3 text-sm leading-6 text-neutral-500">
        {description}
      </p>

      <div className="mt-6 flex items-center gap-2 text-xs font-medium text-neutral-400 transition group-hover:text-neutral-950">
        Learn more
        <ArrowUpRight className="h-3.5 w-3.5" />
      </div>
    </div>
  );
}

/* =========================================================
   PROCESS STEP
========================================================= */

function ProcessStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-5 p-5 sm:p-6">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-semibold text-neutral-600">
        {number}
      </span>

      <div>
        <h3 className="font-semibold tracking-tight">{title}</h3>

        <p className="mt-1.5 text-sm leading-6 text-neutral-500">
          {description}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   REASON
========================================================= */

function Reason({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-neutral-200 bg-white p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-950 text-white">
        {icon}
      </div>

      <h3 className="mt-6 font-semibold tracking-tight">{title}</h3>

      <p className="mt-3 text-sm leading-6 text-neutral-500">
        {description}
      </p>
    </div>
  );
}