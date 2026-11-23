import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  FolderKanban,
  HeartHandshake,
  Layers3,
  LifeBuoy,
  Newspaper,
  Paperclip,
  Rocket,
  Smartphone,
  Sparkles,
} from "lucide-react";

import HeroSearch from "@/app/components/home/hero-search";
import { FaqList, ServiceCard } from "@/app/components/marketing";
import ProjectCard, { type ProjectCardData } from "@/app/components/project-card";
import { sql } from "@/lib/db";
import { faqGroups, packages, processSteps, services, values } from "@/lib/site";

export const revalidate = 300;

const STACK = [
  "Next.js", "React", "TypeScript", "JavaScript", "HTML5", "CSS3", "Tailwind CSS", "shadcn/ui",
  "PostgreSQL", "SQL", "SQLite", "Supabase", "Neon", "Firebase", "NextAuth.js",
  "WordPress", "WooCommerce", "Sanity CMS", "Payload CMS", "Strapi", "Typesense",
  "Cloudflare", "Bunny.net", "Vercel", "Render", "Docker", "GitHub",
  "Resend", "Brevo", "Figma", "SEO",
];
const VALUE_ICONS = [Compass, Smartphone, Layers3, HeartHandshake];

export default async function HomePage() {
  const [projects, [stats], posts, clients] = await Promise.all([
    sql`
      select p.id, p.slug, p.title, p.short_description, p.category, p.status, p.progress_percent,
             p.cover_image_url, c.name as client_name
      from projects p left join clients c on c.id = p.client_id
      order by p.featured desc, coalesce(p.completed_at, p.started_at, p.created_at::date) desc
      limit 3
    ` as unknown as Promise<ProjectCardData[]>,
    sql`
      select count(*)::int as total,
             count(*) filter (where status = 'COMPLETED')::int as completed,
             count(*) filter (where status in ('IN_PROGRESS', 'REVIEW'))::int as active,
             (select count(*)::int from clients) as clients,
             (select count(*)::int from posts where status = 'published') as posts
      from projects
    `,
    sql`
      select p.slug, p.title, p.excerpt, p.cover_image_url, p.published_at, pc.name as category,
             (select count(*)::int from comments c where c.post_id = p.id and c.status = 'visible') as comments
      from posts p left join post_categories pc on pc.id = p.category_id
      where p.status = 'published'
      order by p.published_at desc nulls last
      limit 3
    `,
    sql`
      select c.name, c.logo_url from clients c
      where exists (select 1 from projects p where p.client_id = c.id)
      order by c.created_at asc limit 12
    `,
  ]);

  const years = Math.max(1, new Date().getFullYear() - 2022);
  const faqs = faqGroups.flatMap((g) => g.items).slice(0, 5);

  return (
    <main className="overflow-hidden bg-white text-neutral-950">
      {/* ================= HERO ================= */}
      <section className="relative border-b border-neutral-200">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.035)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black_25%,transparent_70%)]" />
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-neutral-100/80 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-14 sm:px-6 sm:pb-24 sm:pt-20 lg:px-8 lg:pt-24">
          <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[1.15fr_.85fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3.5 py-2 text-xs font-medium text-neutral-600 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Taking on new projects this month
              </div>

              <h1 className="mt-7 max-w-4xl text-[2.9rem] font-bold leading-[.98] tracking-[-0.055em] sm:text-6xl lg:text-[5.2rem]">
                We build digital
                <span className="block text-neutral-400">products that matter.</span>
              </h1>

              <p className="mt-7 max-w-2xl text-base leading-7 text-neutral-600 sm:text-lg sm:leading-8">
                Websites, web apps and WordPress solutions for organisations, businesses and individuals — designed mobile-first,
                built to last, and supported long after launch.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/contact" className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-neutral-950 px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-lg">
                  Start a project <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
                <Link href="/projects" className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-6 text-sm font-semibold text-neutral-800 transition hover:border-neutral-300 hover:bg-neutral-50">
                  See our work <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-8 max-w-xl">
                <HeroSearch />
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-neutral-500 sm:text-sm">
                {["Written scope & fixed quote", "Bengali + English", "You own the code"].map((t) => (
                  <span key={t} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Hero visual: a live-feeling snapshot of the client portal */}
            <div className="relative mx-auto w-full max-w-md lg:ml-auto">
              <div aria-hidden className="absolute -inset-6 rounded-[2.5rem] bg-neutral-100 blur-2xl" />
              <div className="relative rounded-[2rem] border border-neutral-200 bg-white p-4 shadow-2xl shadow-neutral-300/40">
                <div className="rounded-[1.5rem] border border-neutral-200 bg-neutral-50 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-neutral-400">Client portal</p>
                      <p className="mt-0.5 font-semibold tracking-tight">Your project, live</p>
                    </div>
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-950 text-sm font-bold text-white">N</span>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2">
                    <Mini label="Projects" value={stats.total} />
                    <Mini label="Launched" value={stats.completed} />
                    <Mini label="Active" value={stats.active} />
                  </div>

                  <div className="mt-3 rounded-2xl border border-neutral-200 bg-white p-4">
                    {[
                      ["Discovery", 100],
                      ["Design", 86],
                      ["Development", 64],
                      ["Launch", 20],
                    ].map(([label, value]) => (
                      <div key={label as string} className="mb-3 last:mb-0">
                        <div className="mb-1.5 flex justify-between text-[11px]">
                          <span className="text-neutral-500">{label}</span>
                          <span className="font-semibold">{value}%</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
                          <div className="h-full rounded-full bg-neutral-950" style={{ width: `${value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex flex-col gap-2">
                    <Toast icon={<Bell className="h-3.5 w-3.5" />} title="New reply on #12" text="“Homepage draft is ready for review”" />
                    <Toast icon={<Paperclip className="h-3.5 w-3.5" />} title="2 files attached" text="logo-final.svg · sitemap.pdf" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 gap-y-6 border-y border-neutral-200 py-7 sm:mt-20 sm:grid-cols-4 sm:divide-x sm:divide-neutral-200">
            <Stat value={`${stats.total}+`} label="Projects delivered & active" />
            <Stat value={String(stats.clients)} label="Clients served" />
            <Stat value={`${years}+ yrs`} label="Of Nirdeshona" />
            <Stat value="< 24h" label="Typical support reply" />
          </div>
        </div>
      </section>

      {/* ================= CLIENTS ================= */}
      {clients.length > 0 && (
        <section className="border-b border-neutral-200 bg-neutral-50/60">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-5 py-8 sm:flex-row sm:px-6 lg:px-8">
            <p className="shrink-0 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">Trusted by</p>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
              {clients.map((c) => (
                <span key={c.name} className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-sm font-medium text-neutral-700">
                  {c.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.logo_url} alt="" className="h-5 w-5 rounded object-contain" />
                  ) : (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-950 text-[10px] font-bold text-white">{c.name.charAt(0)}</span>
                  )}
                  {c.name}
                </span>
              ))}
              <Link href="/clients" className="text-sm font-semibold text-neutral-500 hover:text-neutral-950">
                All clients →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ================= SERVICES ================= */}
      <section id="services" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-20 sm:px-6 lg:px-8 lg:py-24">
        <Heading
          eyebrow="Services"
          title="Everything you need to launch and grow online."
          text="From a simple website to a full platform — one small team handles design, development and care."
          link={{ href: "/services", label: "All services" }}
        />
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <ServiceCard key={s.slug} service={s} />
          ))}
        </div>
      </section>

      {/* ================= WORK ================= */}
      <section id="projects" className="scroll-mt-24 border-y border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-24">
          <Heading eyebrow="Selected work" title="Built for real organisations." text="A few of the websites and platforms we've designed, built and launched." link={{ href: "/projects", label: "View all projects" }} />
          {projects.length === 0 ? (
            <p className="mt-10 rounded-3xl border border-dashed border-neutral-300 bg-white p-10 text-center text-sm text-neutral-500">Projects are being added — check back soon.</p>
          ) : (
            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ================= WHY ================= */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div>
            <Heading eyebrow="Why Nirdeshona" title="Small team. Clear process. Real support." text="We work with a handful of clients at a time, so you always talk to the people actually building your project." />
            <ul className="mt-8 flex flex-col gap-3">
              {["A written scope and fixed quote before we start", "A live preview link you can check any time", "A client portal for progress, tickets and files", "Full ownership of your code, domain and accounts"].map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm text-neutral-700">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <Check className="h-3 w-3" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {values.map((v, i) => {
              const Icon = VALUE_ICONS[i % VALUE_ICONS.length];
              return (
                <div key={v.title} className={`rounded-3xl border border-neutral-200 p-6 ${i % 3 === 0 ? "bg-neutral-950 text-white" : "bg-white"}`}>
                  <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${i % 3 === 0 ? "bg-white/10" : "bg-neutral-100 text-neutral-800"}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 font-semibold">{v.title}</h3>
                  <p className={`mt-2 text-sm leading-6 ${i % 3 === 0 ? "text-neutral-400" : "text-neutral-600"}`}>{v.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= PROCESS ================= */}
      <section className="border-y border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-24">
          <Heading eyebrow="How we work" title="From first call to launch — and beyond." align="center" />
          <ol className="relative mt-12 grid grid-cols-1 gap-4 md:grid-cols-5">
            <div aria-hidden className="absolute left-0 right-0 top-[22px] hidden h-px bg-neutral-200 md:block" />
            {processSteps.map((step, i) => (
              <li key={step.title} className="relative flex gap-4 md:flex-col md:gap-0">
                <span className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-4 border-neutral-50 bg-neutral-950 text-sm font-bold text-white">{i + 1}</span>
                <div className="md:mt-5">
                  <h3 className="font-semibold text-neutral-950">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-neutral-600">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ================= CLIENT PORTAL ================= */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="relative overflow-hidden rounded-[2rem] bg-neutral-950 px-6 py-12 text-white sm:px-12 sm:py-16">
          <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-32 left-10 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">Client portal</p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">Always know where your project stands.</h2>
              <p className="mt-4 max-w-lg text-sm leading-7 text-neutral-400 sm:text-base">
                Every client gets a private portal: see progress, open support tickets, share files and get notified the moment we reply.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/client" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-neutral-950 hover:bg-neutral-200">
                  Open client portal <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link href="/contact" className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 px-6 text-sm font-semibold hover:bg-white/10">
                  Become a client
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                { icon: FolderKanban, t: "Live progress", d: "Status and percentage for every project." },
                { icon: LifeBuoy, t: "Support tickets", d: "Priorities, replies and history in one thread." },
                { icon: Paperclip, t: "File sharing", d: "Send screenshots and documents securely." },
                { icon: Bell, t: "Instant updates", d: "In-app and email notifications." },
              ].map((f) => (
                <div key={f.t} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <f.icon className="h-5 w-5 text-emerald-300" />
                  <p className="mt-3 text-sm font-semibold">{f.t}</p>
                  <p className="mt-1 text-xs leading-5 text-neutral-400">{f.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= PRICING ================= */}
      <section className="border-y border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-24">
          <Heading eyebrow="Pricing" title="Simple packages. Honest prices." text="Every project starts with a written scope and fixed quote." link={{ href: "/pricing", label: "Full pricing & care plans" }} />
          <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-3">
            {packages.map((p) => (
              <div key={p.name} className={`flex flex-col rounded-3xl border p-6 ${p.highlighted ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-200 bg-white"}`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{p.name}</h3>
                  {p.highlighted && <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px]"><Sparkles className="h-3 w-3" /> Popular</span>}
                </div>
                <p className="mt-4 text-3xl font-bold tracking-tight">{p.price}</p>
                <p className={`mt-2 text-sm ${p.highlighted ? "text-neutral-400" : "text-neutral-600"}`}>{p.description}</p>
                <ul className="mt-5 flex flex-1 flex-col gap-2">
                  {p.features.slice(0, 4).map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className={`h-4 w-4 ${p.highlighted ? "text-emerald-400" : "text-emerald-600"}`} />
                      <span className={p.highlighted ? "text-neutral-200" : "text-neutral-700"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/pricing" className={`mt-6 inline-flex h-11 items-center justify-center rounded-full text-sm font-semibold ${p.highlighted ? "bg-white text-neutral-950 hover:bg-neutral-200" : "bg-neutral-950 text-white hover:bg-neutral-800"}`}>
                  See details
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= BLOG ================= */}
      {posts.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-24">
          <Heading eyebrow="From the blog" title="Ideas and guides for your website." link={{ href: "/blog", label: "All articles" }} />
          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
            {posts.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="group flex flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white transition hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]">
                <div className="aspect-[16/9] overflow-hidden bg-neutral-100">
                  {p.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.cover_image_url} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,#fafafa,#e5e5e5)]">
                      <Newspaper className="h-10 w-10 text-neutral-300" />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  {p.category && <span className="text-xs font-medium text-neutral-500">{p.category}</span>}
                  <h3 className="mt-1.5 font-semibold leading-snug group-hover:underline">{p.title}</h3>
                  {p.excerpt && <p className="mt-2 line-clamp-2 flex-1 text-sm leading-6 text-neutral-600">{p.excerpt}</p>}
                  <p className="mt-4 flex items-center gap-3 text-xs text-neutral-400">
                    {p.published_at && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(p.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    )}
                    <span>💬 {p.comments}</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ================= STACK + FAQ ================= */}
      <section className="border-t border-neutral-200 bg-neutral-50">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-5 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div>
            <Heading eyebrow="Technology" title="Modern tools, chosen for longevity." text="We pick proven technology that keeps your site fast, secure and easy to maintain." />
            <div className="mt-8 flex flex-wrap gap-2">
              {STACK.map((t) => (
                <span key={t} className="rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-sm font-medium text-neutral-700">
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-10 flex items-center gap-4 rounded-3xl border border-neutral-200 bg-white p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-neutral-950 text-white">
                <Rocket className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold">Fast on real phones</p>
                <p className="text-xs leading-5 text-neutral-500">Every build is tested on small screens and slow mobile networks before launch.</p>
              </div>
            </div>
          </div>
          <div>
            <Heading eyebrow="FAQ" title="Questions, answered." link={{ href: "/faq", label: "All FAQs" }} />
            <div className="mt-8">
              <FaqList items={faqs} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Heading({
  eyebrow,
  title,
  text,
  link,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  text?: string;
  link?: { href: string; label: string };
  align?: "left" | "center";
}) {
  return (
    <div className={`flex flex-col gap-4 ${align === "center" ? "items-center text-center" : "sm:flex-row sm:items-end sm:justify-between"}`}>
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">{eyebrow}</p>
        <h2 className="mt-3 text-3xl font-bold tracking-[-0.035em] text-neutral-950 sm:text-4xl">{title}</h2>
        {text && <p className="mt-3 text-base leading-7 text-neutral-600">{text}</p>}
      </div>
      {link && (
        <Link href={link.href} className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-neutral-950 hover:underline">
          {link.label} <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="px-2 text-center sm:px-6">
      <p className="text-3xl font-bold tracking-[-0.04em] sm:text-4xl">{value}</p>
      <p className="mt-1 text-xs text-neutral-500 sm:text-sm">{label}</p>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-3">
      <p className="text-xl font-bold tracking-tight">{value}</p>
      <p className="text-[11px] text-neutral-500">{label}</p>
    </div>
  );
}

function Toast({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700">{icon}</span>
      <span className="min-w-0">
        <span className="block text-xs font-semibold">{title}</span>
        <span className="block truncate text-[11px] text-neutral-500">{text}</span>
      </span>
    </div>
  );
}
