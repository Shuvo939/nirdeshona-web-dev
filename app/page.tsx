import type { Metadata } from "next";
import Link from "@/app/components/locale-link";
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  Calculator,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  FolderKanban,
  HeartHandshake,
  Layers3,
  LifeBuoy,
  Newspaper,
  LayoutDashboard,
  Paperclip,
  Rocket,
  Smartphone,
  Sparkles,
  Users,
} from "lucide-react";

import PostCardFooter, { postCardStats, type PostCardStats } from "@/app/components/blog/post-card-footer";
import CountUp from "@/app/components/home/count-up";
import HeroSearch from "@/app/components/home/hero-search";
import { FaqList, ServiceCard } from "@/app/components/marketing";
import ProjectCard, { type ProjectCardData } from "@/app/components/project-card";
import { sql } from "@/lib/db";
import type { Locale } from "@/lib/i18n/config";
import { publicCache } from "@/lib/public-cache";
import { pageMeta } from "@/lib/seo";
import { getContent } from "@/lib/content";
import { getI18n } from "@/lib/i18n/server";
import { tcol } from "@/lib/i18n/sql";
import { allTech } from "@/lib/site";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const { L, locale } = await getI18n();
  return pageMeta({
    locale,
    og: { title: "Nirdeshona Web — Website, Web App & Android App Development in Bangladesh" },
    path: "/",
    title: L(
      "Nirdeshona Web — Website, Web App & Android App Development in Bangladesh",
      "নির্দেশনা ওয়েব — বাংলাদেশে ওয়েবসাইট, ওয়েব অ্যাপ ও অ্যান্ড্রয়েড অ্যাপ তৈরি",
    ),
    description: L(
      "Fast, mobile-first websites, web apps, WordPress sites and Android apps — plus Facebook page setup, ads and social media management. Fixed quotes, Bangla + English, and support after launch.",
      "দ্রুত, মোবাইল-ফার্স্ট ওয়েবসাইট, ওয়েব অ্যাপ, ওয়ার্ডপ্রেস সাইট ও অ্যান্ড্রয়েড অ্যাপ — সঙ্গে ফেসবুক পেজ সেটআপ, বিজ্ঞাপন ও সোশ্যাল মিডিয়া ব্যবস্থাপনা। নির্দিষ্ট মূল্য, বাংলা ও ইংরেজি, আর লঞ্চের পরও সাপোর্ট।",
    ),
  });
}

const STACK = allTech;
const VALUE_ICONS = [Compass, Smartphone, Layers3, HeartHandshake];

// Public, viewer-independent data: cached briefly and refreshed when admins edit.
const getHomeData = publicCache(async (locale: Locale) => {
  const [projects, [stats], posts, clients, [live]] = await Promise.all([
    sql`
      select p.id, p.slug, ${tcol(locale, "p.title")} as title, ${tcol(locale, "p.short_description")} as short_description,
             p.category, p.status, p.progress_percent, p.cover_image_url, c.name as client_name
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
      select p.slug, ${tcol(locale, "p.title")} as title, ${tcol(locale, "p.excerpt")} as excerpt, p.cover_image_url, p.published_at,
             ${tcol(locale, "pc.name")} as category,
             ${postCardStats()}
      from posts p
      left join post_categories pc on pc.id = p.category_id
      left join profiles pr on pr.id = p.author_id
      where p.status = 'published'
      order by p.published_at desc nulls last
      limit 3
    `,
    sql`
      select c.name, c.logo_url from clients c
      where exists (select 1 from projects p where p.client_id = c.id)
      order by c.created_at asc limit 12
    `,
      sql`
      select p.slug, ${tcol(locale, "p.title")} as title, p.progress_percent, p.status, p.category
      from projects p
      where p.status in ('IN_PROGRESS', 'REVIEW')
      order by p.updated_at desc nulls last
      limit 1
    `,
  ]);
  return {
    projects: [...projects],
    stats: { ...stats },
    posts: [...posts],
    clients: [...clients],
    live: (live ?? null) as { slug: string; title: string; progress_percent: number; status: string; category: string | null } | null,
  };
}, "home-data");

export default async function HomePage() {
  const { L, locale, date, stat, num, digits } = await getI18n();
  const { faqGroups, packages, processSteps, services, values } = getContent(locale);
  const { projects, stats, posts, clients, live } = await getHomeData(locale);
  const progress = live?.progress_percent ?? 70;
  // Project stages from overall progress: discovery 0–10, design 10–35, development 35–85, launch 85–100.
  const stages = (
    [
      [L("Discovery", "আলোচনা"), 0, 10],
      [L("Design", "ডিজাইন"), 10, 35],
      [L("Development", "ডেভেলপমেন্ট"), 35, 85],
      [L("Launch", "লঞ্চ"), 85, 100],
    ] as const
  ).map(([label, from, to]) => {
    const value = Math.round(Math.min(100, Math.max(0, ((progress - from) / (to - from)) * 100)));
    const state = value >= 100 ? "done" : progress >= from ? "active" : "next";
    return [label, value, state] as const;
  });

  const years = Math.max(1, new Date().getFullYear() - 2022);
  const faqs = faqGroups.flatMap((g) => g.items).slice(0, 5);

  return (
    <main className="overflow-hidden bg-white text-neutral-950">
      {/* ================= HERO ================= */}
      <section className="relative border-b border-neutral-200">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgb(var(--c-black)/0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgb(var(--c-black)/0.035)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black_25%,transparent_70%)]" />
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-neutral-100/80 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 pb-14 pt-8 sm:px-6 sm:pb-24 sm:pt-20 lg:px-8 lg:pt-24">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.15fr_.85fr] lg:gap-14">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3.5 py-2 text-xs font-medium text-neutral-600 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                {L("Taking on new projects this month", "এ মাসে নতুন প্রজেক্ট নিচ্ছি")}
              </div>

              {locale === "bn" ? (
                <h1 className="mt-5 max-w-4xl text-balance text-[2.3rem] font-bold leading-[1.22] tracking-normal min-[380px]:text-[2.5rem] sm:mt-7 sm:text-6xl sm:leading-[1.15] lg:text-[4.4rem]">
                  আমরা বানাই এমন ডিজিটাল প্রোডাক্ট,
                  <span className="block text-neutral-400">যা কাজে লাগে।</span>
                </h1>
              ) : (
                <h1 className="mt-5 max-w-4xl text-[2.6rem] font-bold leading-[1.02] tracking-[-0.045em] min-[380px]:text-[2.85rem] sm:mt-7 sm:text-6xl sm:leading-[.98] sm:tracking-[-0.055em] lg:text-[5.2rem]">
                  We build digital
                  <span className="block text-neutral-400">products that matter.</span>
                </h1>
              )}

              <p className="mt-4 max-w-2xl text-[15px] leading-7 text-neutral-600 sm:mt-7 sm:text-lg sm:leading-8">
                {L("Websites, web apps, WordPress and Android apps — plus Facebook and social media — for organisations, businesses and individuals. Designed mobile-first, built to last, and supported long after launch.", "প্রতিষ্ঠান, ব্যবসা ও ব্যক্তির জন্য ওয়েবসাইট, ওয়েব অ্যাপ, ওয়ার্ডপ্রেস ও অ্যান্ড্রয়েড অ্যাপ — সঙ্গে ফেসবুক ও সোশ্যাল মিডিয়া। মোবাইল-ফার্স্ট ডিজাইন, টেকসই নির্মাণ, আর লঞ্চের পরও দীর্ঘদিনের সাপোর্ট।")}
              </p>

              <div className="mt-7 grid grid-cols-2 gap-2.5 sm:mt-8 sm:flex sm:gap-3">
                <Link href="/pricing#order" className="group inline-flex h-12 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-neutral-950 px-3 text-sm sm:gap-2 sm:px-6 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-lg">
                  {L("Start a project", "প্রজেক্ট শুরু করুন")} <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
                <Link href="/projects" className="inline-flex h-12 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-800 sm:gap-2 sm:px-6 transition hover:border-neutral-300 hover:bg-neutral-50">
                  {L("See our work", "আমাদের কাজ দেখুন")} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-3 max-w-xl sm:mt-8">
                <HeroSearch />
              </div>

              <ul className="mt-5 grid grid-cols-3 gap-2 sm:mt-8 sm:flex sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-3">
                {[L("Fixed written quote", "লিখিত নির্দিষ্ট মূল্য"), L("Bengali + English", "বাংলা + ইংরেজি"), L("You own the code", "কোডের মালিক আপনি")].map((t) => (
                  <li key={t} className="flex flex-col items-center gap-1.5 rounded-2xl border border-neutral-200 bg-white/70 px-1.5 py-2.5 text-center text-[11.5px] font-medium leading-4 text-neutral-600 sm:flex-row sm:gap-2 sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0 sm:text-left sm:text-sm sm:font-normal sm:text-neutral-500">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" /> {t}
                  </li>
                ))}
              </ul>
            </div>

            {/* Hero visual: a live-feeling snapshot of the client portal */}
            <div className="relative mx-auto w-full max-w-md lg:ml-auto">
              <div aria-hidden className="absolute -inset-6 rounded-[2.5rem] bg-neutral-100 blur-2xl" />
              <div className="relative rounded-[2rem] border border-neutral-200 bg-white p-4 shadow-2xl shadow-neutral-300/40">
                <div className="rounded-[1.5rem] border border-neutral-200 bg-neutral-50 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-neutral-400">{L("Client portal", "ক্লায়েন্ট পোর্টাল")}</p>
                      <p className="mt-0.5 font-semibold tracking-tight">{L("Your project, live", "আপনার প্রজেক্ট, সরাসরি")}</p>
                    </div>
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-950 text-sm font-bold text-white">N</span>
                  </div>

                  <Link href="/projects" aria-label={L("See our projects", "আমাদের প্রজেক্ট দেখুন")} className="mt-5 grid grid-cols-3 gap-2 rounded-2xl transition hover:opacity-80">
                    <Mini label={L("Projects", "প্রজেক্ট")} value={stat(stats.total)} />
                    <Mini label={L("Launched", "লঞ্চ হয়েছে")} value={stat(stats.completed)} />
                    <Mini label={L("Active", "চলমান")} value={stat(stats.active)} />
                  </Link>

                  <div className="mt-3 rounded-2xl border border-neutral-200 bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-neutral-400">
                          {live && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />}
                          {live ? L("In progress now", "এখন চলছে") : L("Sample project", "নমুনা প্রজেক্ট")}
                        </p>
                        {live ? (
                          <Link href={`/projects/${live.slug}`} className="block truncate text-sm font-semibold hover:underline">
                            {live.title}
                          </Link>
                        ) : (
                          <p className="truncate text-sm font-semibold">{L("Website redesign", "ওয়েবসাইট রিডিজাইন")}</p>
                        )}
                      </div>
                      <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">{L(`${stat(progress)}% done`, `${stat(progress)}% সম্পন্ন`)}</span>
                    </div>
                    <ol className="mt-4 flex flex-col gap-3">
                      {stages.map(([label, value, state]) => (
                        <li key={label} className="flex items-center gap-3">
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                              state === "done" ? "bg-emerald-600 text-white" : state === "active" ? "bg-neutral-950 text-white" : "border border-neutral-300 text-neutral-400"
                            }`}
                          >
                            {state === "done" ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : state === "active" ? <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> : null}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline justify-between gap-2 text-xs">
                              <span className={state === "next" ? "text-neutral-400" : "font-medium text-neutral-800"}>{label}</span>
                              <span className={`shrink-0 ${state === "done" ? "text-emerald-700" : state === "active" ? "font-semibold text-neutral-900" : "text-neutral-400"}`}>
                                {state === "done" ? L("Done", "সম্পন্ন") : state === "active" ? `${stat(value)}%` : L("Next", "পরবর্তী")}
                              </span>
                            </div>
                            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                              <div className={`h-full rounded-full ${state === "done" ? "bg-emerald-500" : "bg-neutral-950"}`} style={{ width: `${value}%` }} />
                            </div>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="mt-3 flex flex-col gap-2">
                    <HeroAction
                      href="/client"
                      icon={<LayoutDashboard className="h-4 w-4" />}
                      title={L("Already a client? Open your portal", "ক্লায়েন্ট? পোর্টালে যান")}
                      text={L("Progress, files and support tickets in one place.", "অগ্রগতি, ফাইল ও সাপোর্ট টিকেট — এক জায়গায়।")}
                    />
                    <HeroAction
                      href="/pricing#order"
                      icon={<Calculator className="h-4 w-4" />}
                      title={L("Plan a project in 2 minutes", "২ মিনিটে প্রজেক্ট সাজান")}
                      text={L("Pick what you need and see the price instantly.", "যা লাগবে বাছুন, দাম সঙ্গে সঙ্গে দেখুন।")}
                      primary
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 gap-3 sm:mt-20 lg:grid-cols-4">
            <StatCard icon={<FolderKanban className="h-5 w-5" />} value={<CountUp value={stats.total} suffix="+" />} label={L("Projects", "প্রজেক্ট")}>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${stats.total ? Math.round((stats.completed / stats.total) * 100) : 0}%` }} />
              </div>
              <p className="mt-2 text-[11px] text-neutral-500">
                {L(`${stats.completed} launched · ${stats.active} in progress`, `${stat(stats.completed)}টি লঞ্চ হয়েছে · ${stat(stats.active)}টি চলমান`)}
              </p>
            </StatCard>
            <StatCard icon={<Users className="h-5 w-5" />} value={<CountUp value={stats.clients} />} label={L("Clients served", "ক্লায়েন্ট")}>
              <p className="mt-3 text-[11px] text-neutral-500">{L("Organisations, businesses & individuals", "প্রতিষ্ঠান, ব্যবসা ও ব্যক্তি")}</p>
            </StatCard>
            <StatCard icon={<Layers3 className="h-5 w-5" />} value={<CountUp value={allTech.length} suffix="+" />} label={L("Technologies", "প্রযুক্তি")}>
              <p className="mt-3 text-[11px] text-neutral-500">{L("Next.js, WordPress, Supabase & more", "Next.js, WordPress, Supabase ও আরও")}</p>
            </StatCard>
            <StatCard icon={<Clock className="h-5 w-5" />} value={<span>{L("< 24h", "২৪ ঘণ্টার কম")}</span>} label={L("Support reply", "সাপোর্টে উত্তর")} dark>
              <p className="mt-3 text-[11px] text-neutral-400">{L(`Since 2022 · ${years}+ years of Nirdeshona`, `২০২২ থেকে · নির্দেশনার ${num(years)}+ বছর`)}</p>
            </StatCard>
          </div>
        </div>
      </section>

      {/* ================= CLIENTS ================= */}
      {clients.length > 0 && (
        <section className="border-b border-neutral-200 bg-neutral-50/60">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-5 py-8 sm:flex-row sm:px-6 lg:px-8">
            <p className="shrink-0 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">{L("Trusted by", "যাদের আস্থা পেয়েছি")}</p>
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
                {L("All clients →", "সব ক্লায়েন্ট →")}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ================= SERVICES ================= */}
      <section id="services" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-20 sm:px-6 lg:px-8 lg:py-24">
        <Heading
          eyebrow={L("Services", "সার্ভিস")}
          title={L("Everything you need to launch and grow online.", "অনলাইনে শুরু ও বেড়ে ওঠার জন্য যা যা দরকার।")}
          text={L("From a simple website to a full platform — one small team handles design, development and care.", "সাধারণ ওয়েবসাইট থেকে পূর্ণাঙ্গ প্ল্যাটফর্ম — ডিজাইন, ডেভেলপমেন্ট ও দেখভাল, সবই একটি ছোট টিমের হাতে।")}
          link={{ href: "/services", label: L("All services", "সব সার্ভিস") }}
        />
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <ServiceCard key={s.slug} service={s} />
          ))}
        </div>
      </section>

      {/* ================= WORK ================= */}
      <section id="projects" className="scroll-mt-24 border-y border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-24">
          <Heading eyebrow={L("Selected work", "নির্বাচিত কাজ")} title={L("Built for real organisations.", "বাস্তব প্রতিষ্ঠানের জন্য তৈরি।")} text={L("A few of the websites and platforms we've designed, built and launched.", "আমাদের ডিজাইন, নির্মাণ ও লঞ্চ করা কয়েকটি ওয়েবসাইট ও প্ল্যাটফর্ম।")} link={{ href: "/projects", label: L("View all projects", "সব প্রজেক্ট দেখুন") }} />
          {projects.length === 0 ? (
            <p className="mt-10 rounded-3xl border border-dashed border-neutral-300 bg-white p-10 text-center text-sm text-neutral-500">{L("Projects are being added — check back soon.", "প্রজেক্ট যোগ করা হচ্ছে — শিগগিরই আবার দেখুন।")}</p>
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
            <Heading eyebrow={L("Why Nirdeshona", "কেন নির্দেশনা")} title={L("Small team. Clear process. Real support.", "ছোট টিম। স্পষ্ট প্রক্রিয়া। সত্যিকারের সাপোর্ট।")} text={L("We work with a handful of clients at a time, so you always talk to the people actually building your project.", "আমরা একসঙ্গে অল্প কয়েকজন ক্লায়েন্টের সঙ্গে কাজ করি, তাই আপনি সবসময় কথা বলবেন তাঁদের সঙ্গেই, যাঁরা আপনার প্রজেক্ট বানাচ্ছেন।")} />
            <ul className="mt-8 flex flex-col gap-3">
              {[L("A written scope and fixed quote before we start", "কাজ শুরুর আগে লিখিত পরিসর ও নির্দিষ্ট মূল্য"), L("A live preview link you can check any time", "যেকোনো সময় দেখার মতো লাইভ প্রিভিউ লিংক"), L("A client portal for progress, tickets and files", "অগ্রগতি, টিকেট ও ফাইলের জন্য ক্লায়েন্ট পোর্টাল"), L("Full ownership of your code, domain and accounts", "কোড, ডোমেইন ও অ্যাকাউন্টের পূর্ণ মালিকানা")].map((t) => (
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
                <div key={v.title} className={`rounded-3xl border border-neutral-200 p-6 ${i % 3 === 0 ? "theme-fixed bg-neutral-950 text-white" : "bg-white"}`}>
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
          <Heading eyebrow={L("How we work", "আমরা যেভাবে কাজ করি")} title={L("From first call to launch — and beyond.", "প্রথম কল থেকে লঞ্চ — এবং তারপরও।")} align="center" />
          <ol className="relative mt-12 grid grid-cols-1 gap-4 md:grid-cols-5">
            <div aria-hidden className="absolute left-0 right-0 top-[22px] hidden h-px bg-neutral-200 md:block" />
            {processSteps.map((step, i) => (
              <li key={step.title} className="relative flex gap-4 md:flex-col md:gap-0">
                <span className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-4 border-neutral-50 bg-neutral-950 text-sm font-bold text-white">{num(i + 1)}</span>
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
        <div className="theme-fixed relative overflow-hidden rounded-[2rem] bg-neutral-950 px-6 py-12 text-white sm:px-12 sm:py-16">
          <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-32 left-10 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">{L("Client portal", "ক্লায়েন্ট পোর্টাল")}</p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">{L("Always know where your project stands.", "সবসময় জানুন, আপনার প্রজেক্ট কোথায় আছে।")}</h2>
              <p className="mt-4 max-w-lg text-sm leading-7 text-neutral-400 sm:text-base">
                {L("Every client gets a private portal: see progress, open support tickets, share files and get notified the moment we reply.", "প্রত্যেক ক্লায়েন্ট পান একটি নিজস্ব পোর্টাল: অগ্রগতি দেখুন, সাপোর্ট টিকেট খুলুন, ফাইল শেয়ার করুন, আর আমরা উত্তর দিলেই সঙ্গে সঙ্গে নোটিফিকেশন পান।")}
              </p>
              <div className="mt-7 grid grid-cols-2 gap-2.5 sm:mt-8 sm:flex sm:gap-3">
                <Link href="/client" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-neutral-950 hover:bg-neutral-200">
                  {L("Open client portal", "ক্লায়েন্ট পোর্টাল খুলুন")} <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link href="/contact" className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 px-6 text-sm font-semibold hover:bg-white/10">
                  {L("Become a client", "ক্লায়েন্ট হোন")}
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                { icon: FolderKanban, t: L("Live progress", "সরাসরি অগ্রগতি"), d: L("Status and percentage for every project.", "প্রতিটি প্রজেক্টের অবস্থা ও শতাংশ।") },
                { icon: LifeBuoy, t: L("Support tickets", "সাপোর্ট টিকেট"), d: L("Priorities, replies and history in one thread.", "অগ্রাধিকার, উত্তর ও ইতিহাস এক থ্রেডে।") },
                { icon: Paperclip, t: L("File sharing", "ফাইল শেয়ার"), d: L("Send screenshots and documents securely.", "নিরাপদে স্ক্রিনশট ও ডকুমেন্ট পাঠান।") },
                { icon: Bell, t: L("Instant updates", "তাৎক্ষণিক আপডেট"), d: L("In-app and email notifications.", "সাইটে ও ইমেইলে নোটিফিকেশন।") },
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
          <Heading eyebrow={L("Pricing", "প্রাইসিং")} title={L("Simple packages. Honest prices.", "সহজ প্যাকেজ। সৎ মূল্য।")} text={L("Every project starts with a written scope and fixed quote.", "প্রতিটি প্রজেক্ট শুরু হয় লিখিত পরিসর ও নির্দিষ্ট মূল্য দিয়ে।")} link={{ href: "/pricing", label: L("Full pricing & care plans", "পূর্ণ প্রাইসিং ও কেয়ার প্ল্যান") }} />
          <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-3">
            {packages.map((p) => (
              <div key={p.name} className={`flex flex-col rounded-3xl border p-6 ${p.highlighted ? "theme-fixed border-neutral-950 bg-neutral-950 text-white" : "border-neutral-200 bg-white"}`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{p.name}</h3>
                  {p.highlighted && <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px]"><Sparkles className="h-3 w-3" /> {L("Popular", "জনপ্রিয়")}</span>}
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
                  {L("See details", "বিস্তারিত দেখুন")}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= BLOG ================= */}
      {posts.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-24">
          <Heading eyebrow={L("From the blog", "ব্লগ থেকে")} title={L("Ideas and guides for your website.", "আপনার ওয়েবসাইটের জন্য ভাবনা ও গাইড।")} link={{ href: "/blog", label: L("All articles", "সব লেখা") }} />
          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
            {posts.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="group flex flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white transition hover:-translate-y-1 hover:shadow-[0_20px_50px_rgb(var(--c-black)/0.08)]">
                <div className="aspect-[16/9] overflow-hidden bg-neutral-100">
                  {p.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.cover_image_url} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgb(var(--c-neutral-50)),rgb(var(--c-neutral-200)))]">
                      <Newspaper className="h-10 w-10 text-neutral-300" />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  {p.category && <span className="text-xs font-medium text-neutral-500">{p.category}</span>}
                  <h3 className="mt-1.5 font-semibold leading-snug group-hover:underline">{p.title}</h3>
                  {p.excerpt && <p className="mt-2 line-clamp-2 flex-1 text-sm leading-6 text-neutral-600">{p.excerpt}</p>}
                  <PostCardFooter post={p as unknown as PostCardStats} />
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
            <Heading eyebrow={L("Technology", "প্রযুক্তি")} title={L("Modern tools, chosen for longevity.", "দীর্ঘস্থায়িত্বের কথা ভেবে বাছাই করা আধুনিক টুল।")} text={L("We pick proven technology that keeps your site fast, secure and easy to maintain.", "আমরা পরীক্ষিত প্রযুক্তি বেছে নিই, যাতে আপনার সাইট দ্রুত, নিরাপদ ও সহজে রক্ষণাবেক্ষণযোগ্য থাকে।")} />
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
                <p className="text-sm font-semibold">{L("Fast on real phones", "সাধারণ ফোনেও দ্রুত")}</p>
                <p className="text-xs leading-5 text-neutral-500">{L("Every build is tested on small screens and slow mobile networks before launch.", "লঞ্চের আগে প্রতিটি কাজ ছোট স্ক্রিন ও ধীর মোবাইল নেটওয়ার্কে পরীক্ষা করা হয়।")}</p>
              </div>
            </div>
          </div>
          <div>
            <Heading eyebrow={L("FAQ", "প্রশ্নোত্তর")} title={L("Questions, answered.", "আপনার প্রশ্নের উত্তর।")} link={{ href: "/faq", label: L("All FAQs", "সব প্রশ্নোত্তর") }} />
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

function StatCard({
  icon,
  value,
  label,
  dark = false,
  children,
}: {
  icon: React.ReactNode;
  value: React.ReactNode;
  label: string;
  dark?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`flex flex-col rounded-3xl border p-4 transition hover:-translate-y-0.5 sm:p-5 ${
        dark ? "theme-fixed border-neutral-950 bg-neutral-950 text-white" : "border-neutral-200 bg-white hover:shadow-[0_16px_40px_rgb(var(--c-black)/0.06)]"
      }`}
    >
      <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${dark ? "bg-white/10 text-emerald-300" : "bg-neutral-100 text-neutral-800"}`}>{icon}</span>
      <p className="mt-4 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">{value}</p>
      <p className={`mt-0.5 text-sm font-medium ${dark ? "text-neutral-300" : "text-neutral-700"}`}>{label}</p>
      <div className="mt-auto">{children}</div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-3">
      <p className="text-xl font-bold tracking-tight">{value}</p>
      <p className="text-[11px] text-neutral-500">{label}</p>
    </div>
  );
}

function HeroAction({
  href,
  icon,
  title,
  text,
  primary,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  text: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 rounded-2xl border p-3 transition ${
        primary ? "border-neutral-950 bg-neutral-950 text-white hover:bg-neutral-800" : "border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm"
      }`}
    >
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${primary ? "bg-white/10 text-white" : "bg-neutral-100 text-neutral-700"}`}>
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block text-[13px] font-semibold leading-5 ${primary ? "text-white" : "text-neutral-900"}`}>{title}</span>
        <span className={`block text-xs leading-5 ${primary ? "text-neutral-300" : "text-neutral-500"}`}>{text}</span>
      </span>
      <ArrowRight className={`h-4 w-4 shrink-0 transition group-hover:translate-x-0.5 ${primary ? "text-white" : "text-neutral-400"}`} />
    </Link>
  );
}
