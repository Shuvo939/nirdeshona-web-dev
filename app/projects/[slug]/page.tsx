import type { Metadata } from "next";
import Breadcrumbs from "@/app/components/breadcrumbs";
import Link from "@/app/components/locale-link";
import { notFound } from "next/navigation";
import { cache } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Building2,
  CalendarDays,
  ChevronRight,
  Code2,
  Globe,
  Layers3,
  MessageSquare,
  Star,
  Timer,
} from "lucide-react";

import { renderMarkdown } from "@/app/components/blog/markdown";
import BlueprintBackdrop from "@/app/components/blueprint-backdrop";
import ProjectFeatures from "@/app/components/projects/project-features";
import { PROJECT_STATUS, StatusBadge } from "@/app/components/marketing";
import ProjectCard, { type ProjectCardData } from "@/app/components/project-card";
import ProjectGallery from "@/app/components/projects/project-gallery";
import ShareButton from "@/app/components/projects/share-button";
import { sql } from "@/lib/db";
import { getLocalizedService } from "@/lib/content";
import type { Locale } from "@/lib/i18n/config";
import { getI18n, getLocale, makeI18n } from "@/lib/i18n/server";
import { breadcrumbLd, pageMeta } from "@/lib/seo";
import { tcol } from "@/lib/i18n/sql";
import { categoryLabel } from "@/lib/projects/categories";
import { jsonLd } from "@/lib/json-ld";
import { isHttpUrl } from "@/lib/safe-url";
import { services, site } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

type Project = {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  description: string | null;
  features: string | null;
  category: string | null;
  status: string;
  progress_percent: number;
  featured: boolean;
  cover_image_url: string | null;
  live_url: string | null;
  repository_url: string | null;
  started_at: string | null;
  completed_at: string | null;
  updated_at: string;
  client_name: string | null;
  client_logo: string | null;
};

const getProject = cache(async (slug: string, locale: Locale) => {
  const [project] = (await sql`
    select p.id, p.slug, ${tcol(locale, "p.title")} as title, ${tcol(locale, "p.short_description")} as short_description,
           ${tcol(locale, "p.description")} as description, ${tcol(locale, "p.features")} as features, p.category, p.status::text as status,
           p.progress_percent, p.featured, p.cover_image_url, p.live_url, p.repository_url,
           p.started_at::text as started_at, p.completed_at::text as completed_at, p.updated_at,
           c.name as client_name, c.logo_url as client_logo
    from projects p left join clients c on c.id = p.client_id
    where p.slug = ${slug}
    limit 1
  `) as unknown as Project[];
  return project ?? null;
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { L, locale } = await getI18n();
  const project = await getProject(slug, locale);
  if (!project) return { title: L("Project not found — Nirdeshona Web", "প্রজেক্ট পাওয়া যায়নি — নির্দেশনা ওয়েব") };
  const description =
    project.short_description || L(`${project.title} — a project by Nirdeshona Web Development.`, `${project.title} — নির্দেশনা ওয়েব ডেভেলপমেন্টের একটি প্রজেক্ট।`);
  return pageMeta({
    locale,
    path: `/projects/${project.slug}`,
    title: `${project.title} — ${L("Nirdeshona Web", "নির্দেশনা ওয়েব")}`,
    description,
    image: project.cover_image_url,
    eyebrow: L("Project", "প্রজেক্ট"),
    type: "article",
    og: { title: locale === "bn" ? ((await getProject(slug, "en"))?.title ?? project.title) : project.title, eyebrow: "Project" },
  });
}

function makeFmt(locale: Locale) {
  return (value: string | null) =>
    value
      ? new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-GB", { month: locale === "bn" ? "long" : "short", year: "numeric", timeZone: "Asia/Dhaka" }).format(new Date(value))
      : null;
}

function duration(start: string | null, end: string | null, locale: Locale) {
  if (!start) return null;
  const { L, stat, num } = makeI18n(locale);
  const from = new Date(start);
  const to = end ? new Date(end) : new Date();
  const days = Math.max(1, Math.round((to.getTime() - from.getTime()) / 86_400_000));
  if (days < 14) return L(`${days} day${days > 1 ? "s" : ""}`, `${num(days)} দিন`);
  if (days < 60) return L(`${Math.round(days / 7)} weeks`, `${num(Math.round(days / 7))} সপ্তাহ`);
  const months = Math.round(days / 30.4);
  return L(`${months} month${months > 1 ? "s" : ""}`, `${num(months)} মাস`);
}

function hostOf(url: string | null) {
  if (!url) return null;
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export default async function ProjectDetailsPage({ params }: Props) {
  const { slug } = await params;
  const locale = await getLocale();
  const { L, stat, num } = makeI18n(locale);
  const fmt = makeFmt(locale);
  const project = await getProject(slug, locale);
  if (!project) notFound();

  const [media, technologies, related, siblings] = await Promise.all([
    sql`
      select id, file_url, caption from project_media
      where project_id = ${project.id}
      order by sort_order asc, created_at asc
    ` as unknown as Promise<{ id: string; file_url: string; caption: string | null }[]>,
    sql`
      select t.name from project_technologies pt join technologies t on t.id = pt.technology_id
      where pt.project_id = ${project.id} order by t.name asc
    ` as unknown as Promise<{ name: string }[]>,
    sql`
      select p.id, p.slug, ${tcol(locale, "p.title")} as title, ${tcol(locale, "p.short_description")} as short_description,
             p.category, p.status::text as status, p.progress_percent,
             p.cover_image_url, p.featured, c.name as client_name
      from projects p left join clients c on c.id = p.client_id
      where p.id <> ${project.id}
      order by (p.category is not distinct from ${project.category}) desc, p.featured desc,
               coalesce(p.completed_at, p.started_at, p.created_at::date) desc
      limit 3
    ` as unknown as Promise<ProjectCardData[]>,
    sql`
      select slug, ${tcol(locale, "title")} as title from projects
      order by featured desc, coalesce(completed_at, started_at, created_at::date) desc, id
    ` as unknown as Promise<{ slug: string; title: string }[]>,
  ]);

  const index = siblings.findIndex((s) => s.slug === project.slug);
  const prev = index > 0 ? siblings[index - 1] : null;
  const next = index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : null;

  const tech = technologies.map((t) => t.name);
  const liveUrl = project.live_url && isHttpUrl(project.live_url) ? project.live_url : null;
  const repoUrl = project.repository_url && isHttpUrl(project.repository_url) ? project.repository_url : null;
  const host = hostOf(liveUrl);
  const completed = project.status === "COMPLETED";
  const timeTaken = duration(project.started_at, project.completed_at, locale);
  const matchedService = services.find(
    (s) => project.category && (s.title.toLowerCase().includes(project.category.toLowerCase()) || project.category.toLowerCase().includes(s.title.split(" ")[0].toLowerCase())),
  );
  const serviceLabel = matchedService ? getLocalizedService(locale, matchedService.slug)?.title ?? matchedService.title : null;

  const facts = [
    project.client_name && { icon: Building2, label: L("Client", "ক্লায়েন্ট"), value: project.client_name },
    project.category && { icon: Layers3, label: L("Category", "ক্যাটাগরি"), value: categoryLabel(project.category, locale) },
    (project.started_at || project.completed_at) && {
      icon: CalendarDays,
      label: completed ? L("Launched", "চালু হয়েছে") : L("Started", "শুরু"),
      value: fmt(completed ? project.completed_at ?? project.started_at : project.started_at) ?? "—",
    },
    timeTaken && { icon: Timer, label: completed ? L("Delivered in", "সময় লেগেছে") : L("Running for", "চলছে"), value: timeTaken },
  ].filter(Boolean) as { icon: typeof Building2; label: string; value: string }[];

  const schema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.short_description ?? undefined,
    url: `${site.url.replace(/\/$/, "")}/${locale}/projects/${project.slug}`,
    inLanguage: locale === "bn" ? "bn-BD" : "en",
    image: project.cover_image_url ?? undefined,
    dateCreated: project.started_at ?? undefined,
    datePublished: project.completed_at ?? undefined,
    creator: { "@type": "Organization", name: site.legalName ?? site.name, url: site.url },
    keywords: tech.join(", ") || undefined,
  };

  return (
    <main className="bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: jsonLd([
            schema,
            breadcrumbLd(locale, [
              [L("Home", "হোম"), "/"],
              [L("Our work", "আমাদের কাজ"), "/projects"],
              [project.title, `/projects/${project.slug}`],
            ]),
          ]),
        }} />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-neutral-200">
        <BlueprintBackdrop />
        <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 sm:pb-12 sm:pt-10 lg:px-8">
          <Breadcrumbs items={[{ label: L("Our work", "আমাদের কাজ"), href: "/projects" }, { label: project.title }]} />

          <div className="mt-6 grid grid-cols-1 gap-8 sm:mt-8 sm:gap-10 lg:grid-cols-[1.05fr_1fr] lg:items-center">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge map={PROJECT_STATUS} value={project.status} />
                {project.category && (
                  <Link href={`/projects?category=${encodeURIComponent(project.category)}`} className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-700 hover:border-neutral-300">
                    {categoryLabel(project.category, locale)}
                  </Link>
                )}
                {project.featured && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-neutral-950 px-3 py-1 text-xs font-semibold text-white">
                    <Star className="h-3 w-3 fill-amber-300 text-amber-300" /> {L("Featured", "ফিচার্ড")}
                  </span>
                )}
              </div>

              <h1 className={`mt-4 text-balance text-[2rem] font-bold leading-[1.12] text-neutral-950 sm:mt-5 sm:text-5xl sm:leading-[1.05] ${locale === "bn" ? "" : "tracking-[-0.035em]"}`}>{project.title}</h1>
              {project.client_name && (
                <p className="mt-3 flex min-w-0 items-center gap-2 text-sm text-neutral-500">
                  <ClientMark name={project.client_name} logo={project.client_logo} />
                  {L(
                    <span className="min-w-0 truncate">
                      for <span className="font-medium text-neutral-800">{project.client_name}</span>
                    </span>,
                    <span className="min-w-0 truncate">
                      <span className="font-medium text-neutral-800">{project.client_name}</span>-এর জন্য
                    </span>,
                  )}
                </p>
              )}
              {project.short_description && <p className="mt-4 max-w-xl text-[15px] leading-7 text-neutral-600 sm:mt-5 sm:text-lg sm:leading-8">{project.short_description}</p>}

              {!completed && (
                <div className="mt-6 max-w-sm">
                  <div className="flex items-center justify-between text-xs font-medium text-neutral-600">
                    <span>{L("Progress", "অগ্রগতি")}</span>
                    <span>{stat(project.progress_percent)}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-200">
                    <div className="h-full rounded-full bg-gradient-to-r from-neutral-800 to-emerald-500" style={{ width: `${project.progress_percent}%` }} />
                  </div>
                </div>
              )}

              {/* Phones: one row — main action stretches, Source and Share become icon buttons. */}
              <div className="mt-6 flex items-center gap-2.5 sm:mt-8 sm:gap-3">
                {liveUrl && (
                  <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-neutral-950 px-5 text-sm font-semibold text-white transition hover:bg-neutral-800 sm:flex-none">
                    <Globe className="h-4 w-4 shrink-0" /> <span className="truncate">{L("Visit website", "ওয়েবসাইট দেখুন")}</span> <ArrowUpRight className="h-4 w-4 shrink-0" />
                  </a>
                )}
                {repoUrl && (
                  <a
                    href={repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={L("Source code", "সোর্স কোড")}
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white text-sm font-semibold text-neutral-800 hover:border-neutral-300 sm:w-auto sm:px-5"
                  >
                    <Code2 className="h-4 w-4" /> <span className="hidden sm:inline">{L("Source", "সোর্স কোড")}</span>
                  </a>
                )}
                <ShareButton
                  title={project.title}
                  labelClassName={liveUrl ? "hidden sm:inline" : ""}
                  className={`inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white text-sm font-semibold text-neutral-800 hover:border-neutral-300 ${liveUrl ? "w-11 sm:w-auto sm:px-5" : "px-5"}`}
                />
              </div>
            </div>

            {/* Browser frame */}
            <div className="min-w-0">
              <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.10)] sm:shadow-[0_30px_80px_rgba(0,0,0,0.12)]">
                <div className="flex items-center gap-3 border-b border-neutral-200 bg-neutral-50 px-3 py-2 sm:px-4 sm:py-2.5">
                  <span className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </span>
                  <span className="min-w-0 flex-1 truncate rounded-md bg-white px-3 py-1 text-center text-[11px] text-neutral-500">{host ?? project.slug}</span>
                </div>
                {project.cover_image_url ? (
                  // Whole screenshot, never cropped; tall ones are capped and show their top.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={project.cover_image_url} alt={project.title} className="block max-h-[70vh] w-full bg-neutral-100 object-cover object-top" />
                ) : (
                  <div className="flex aspect-[16/10] items-center justify-center bg-neutral-100">
                    <Layers3 className="h-12 w-12 text-neutral-300" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {facts.length > 0 && (
            <dl className="mt-8 grid grid-cols-2 gap-2.5 sm:mt-12 sm:gap-3 lg:grid-cols-4">
              {facts.map((f) => (
                <div key={f.label} className="rounded-2xl border border-neutral-200 bg-white p-4">
                  <dt className="flex items-center gap-1.5 text-xs text-neutral-500">
                    <f.icon className="h-3.5 w-3.5" /> {f.label}
                  </dt>
                  <dd className="mt-1.5 truncate text-sm font-semibold text-neutral-950">{f.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      {/* Body */}
      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8">
        <div className="flex min-w-0 flex-col gap-12">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">{L("Overview", "সংক্ষেপে")}</h2>
            {project.description ? (
              <div className="mt-4 text-[15px] leading-7 text-neutral-700 sm:text-base" dangerouslySetInnerHTML={{ __html: renderMarkdown(project.description) }} />
            ) : (
              <p className="mt-4 text-neutral-600">{project.short_description ?? L("Details for this project are coming soon.", "এই প্রজেক্টের বিস্তারিত শিগগিরই আসছে।")}</p>
            )}
          </div>

          {project.features && (
            <ProjectFeatures
              source={project.features}
              title={L("All features", "সব ফিচার")}
              count={(n) => num(n)}
              summary={(f, g) => L(`${f} features in ${g} area${g > 1 ? "s" : ""}`, `${num(g)}টি ভাগে ${num(f)}টি ফিচার`)}
            />
          )}

          {media.length > 0 && (
            <div>
              <div className="flex items-end justify-between gap-3">
                <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">{L("Gallery", "গ্যালারি")}</h2>
                <span className="text-xs text-neutral-400">
                  {L(`${media.length} image${media.length > 1 ? "s" : ""} · click to enlarge`, `${num(media.length)}টি ছবি · বড় করে দেখতে ক্লিক করুন`)}
                </span>
              </div>
              <div className="mt-4">
                <ProjectGallery items={media} title={project.title} />
              </div>
            </div>
          )}

          {tech.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">{L("Built with", "যা দিয়ে তৈরি")}</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {tech.map((t) => (
                  <Link
                    key={t}
                    href={`/projects?tech=${encodeURIComponent(t)}`}
                    className="rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-sm text-neutral-700 transition hover:border-neutral-950 hover:text-neutral-950"
                    title={L(`More projects built with ${t}`, `${t} দিয়ে তৈরি আরও প্রজেক্ট`)}
                  >
                    {t}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-neutral-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-neutral-950">{L("Project details", "প্রজেক্টের তথ্য")}</h3>
            <dl className="mt-4 flex flex-col divide-y divide-neutral-100 text-sm">
              <Row label={L("Status", "অবস্থা")}>
                <StatusBadge map={PROJECT_STATUS} value={project.status} />
              </Row>
              {project.started_at && <Row label={L("Started", "শুরু")}>{fmt(project.started_at)}</Row>}
              {project.completed_at && <Row label={L("Completed", "সম্পন্ন")}>{fmt(project.completed_at)}</Row>}
              {timeTaken && <Row label={L("Duration", "সময়কাল")}>{timeTaken}</Row>}
              {tech.length > 0 && <Row label={L("Technologies", "প্রযুক্তি")}>{num(tech.length)}</Row>}
              <Row label={L("Last updated", "সর্বশেষ আপডেট")}>{fmt(project.updated_at)}</Row>
            </dl>
            {(liveUrl || repoUrl) && (
              <div className="mt-4 flex flex-col gap-2">
                {liveUrl && (
                  <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-xl bg-neutral-50 px-3.5 py-2.5 text-sm font-medium text-neutral-800 hover:bg-neutral-100">
                    <span className="truncate">{host}</span>
                    <ArrowUpRight className="h-4 w-4 shrink-0" />
                  </a>
                )}
                {repoUrl && (
                  <a href={repoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-xl bg-neutral-50 px-3.5 py-2.5 text-sm font-medium text-neutral-800 hover:bg-neutral-100">
                    <span>{L("Repository", "রিপোজিটরি")}</span>
                    <Code2 className="h-4 w-4 shrink-0" />
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="theme-fixed rounded-3xl bg-neutral-950 p-6 text-white">
            <MessageSquare className="h-6 w-6 text-emerald-300" />
            <h3 className="mt-4 text-lg font-semibold">{L("Want something similar?", "এমন কিছু চান?")}</h3>
            <p className="mt-2 text-sm leading-6 text-neutral-400">
              {L(
                "Tell us about your idea — we'll reply within a working day with honest advice and a quote.",
                "আপনার আইডিয়া জানান — ২৪ ঘণ্টার মধ্যে সৎ পরামর্শ ও খরচের হিসাবসহ উত্তর দেব।",
              )}
            </p>
            <Link
              href={`/contact${matchedService ? `?service=${encodeURIComponent(matchedService.title)}` : ""}`}
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-neutral-950 hover:bg-neutral-200"
            >
              {L("Start a project", "প্রজেক্ট শুরু করুন")} <ArrowRight className="h-4 w-4" />
            </Link>
            {matchedService && (
              <Link href={`/services/${matchedService.slug}`} className="mt-3 block text-xs text-neutral-400 hover:text-white">
                {L(`About our ${matchedService.title.toLowerCase()} service →`, `আমাদের ${serviceLabel} সেবা সম্পর্কে →`)}
              </Link>
            )}
          </div>
        </aside>
      </section>

      {/* Prev / next */}
      {(prev || next) && (
        <nav aria-label={L("More projects", "আরও প্রজেক্ট")} className="border-y border-neutral-200 bg-neutral-50">
          <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-neutral-200 px-0 sm:px-6 lg:px-8">
            {prev ? (
              <Link href={`/projects/${prev.slug}`} className="group flex flex-col gap-1 px-4 py-6 sm:px-0 sm:pr-6">
                <span className="flex items-center gap-1 text-xs text-neutral-500">
                  <ArrowLeft className="h-3.5 w-3.5 transition group-hover:-translate-x-0.5" /> {L("Previous", "আগের")}
                </span>
                <span className="truncate font-semibold text-neutral-950">{prev.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`/projects/${next.slug}`} className="group flex flex-col items-end gap-1 px-4 py-6 text-right sm:px-0 sm:pl-6">
                <span className="flex items-center gap-1 text-xs text-neutral-500">
                  {L("Next", "পরের")} <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </span>
                <span className="max-w-full truncate font-semibold text-neutral-950">{next.title}</span>
              </Link>
            ) : (
              <span />
            )}
          </div>
        </nav>
      )}

      {/* Related */}
      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl font-bold tracking-[-0.03em] text-neutral-950">{L("More of our work", "আমাদের আরও কাজ")}</h2>
            <Link href="/projects" className="text-sm font-semibold text-neutral-950 hover:underline">
              {L("All projects →", "সব প্রজেক্ট →")}
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <dt className="text-neutral-500">{label}</dt>
      <dd className="text-right font-medium text-neutral-900">{children}</dd>
    </div>
  );
}

function ClientMark({ name, logo }: { name: string; logo: string | null }) {
  return (
    <span className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-md border border-neutral-200 bg-white text-[10px] font-bold text-neutral-700">
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt="" className="h-full w-full object-contain p-0.5" />
      ) : (
        name.charAt(0)
      )}
    </span>
  );
}
