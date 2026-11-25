import type { Metadata } from "next";
import Link from "@/app/components/locale-link";
import { ArrowUpRight, Check, Compass, Eye, HeartHandshake, Layers3, Minus, Smartphone, Target, X } from "lucide-react";

import { FaqList, PageHero, PrimaryButton, SecondaryButton, SectionHeading, ServiceIcon } from "@/app/components/marketing";
import { sql } from "@/lib/db";
import { getContent } from "@/lib/content";
import { getI18n, localeAlternates } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { L, locale } = await getI18n();
  return {
    title: L("About — Nirdeshona Web", "আমাদের সম্পর্কে — নির্দেশনা ওয়েব"),
    description: L(
      "Nirdeshona Web Development is a small, focused studio from Bangladesh building modern websites and web applications.",
      "নির্দেশনা ওয়েব ডেভেলপমেন্ট বাংলাদেশের একটি ছোট, মনোযোগী স্টুডিও, যারা আধুনিক ওয়েবসাইট ও ওয়েব অ্যাপ্লিকেশন বানায়।",
    ),
    alternates: localeAlternates(locale, "/about"),
  };
}

const VALUE_ICONS = [Compass, Smartphone, Layers3, HeartHandshake];

export default async function AboutPage() {
  const { L, locale, num } = await getI18n();
  const { comparison, faqGroups, milestones, processSteps, services, site, team, techCategories, values } = getContent(locale);
  const [[stats], clients] = await Promise.all([
    sql`
      select
        (select count(*)::int from projects) as projects,
        (select count(*)::int from projects where status = 'COMPLETED') as completed,
        (select count(*)::int from clients) as clients,
        (select count(*)::int from posts where status = 'published') as articles
    `,
    sql`
      select c.name, c.logo_url from clients c
      where exists (select 1 from projects p where p.client_id = c.id)
      order by c.created_at asc limit 12
    `,
  ]);

  const years = Math.max(1, new Date().getFullYear() - site.founded);
  const enFaq = getContent("en").faqGroups.flatMap((g) => g.items);
  const aboutFaq = faqGroups
    .flatMap((g) => g.items)
    .filter((_, i) => /own|technolog|bengali|secure|start/i.test(enFaq[i]?.q ?? ""))
    .slice(0, 4);

  return (
    <>
      <PageHero
        eyebrow={L("About us", "আমাদের সম্পর্কে")}
        title={L("A small studio that cares about the details.", "খুঁটিনাটির যত্ন নেওয়া একটি ছোট স্টুডিও।")}
        description={L(
          `${site.legalName} is part of Nirdeshona — an initiative started in ${site.founded} to help people and organisations find direction. We bring that same spirit to the web: clear guidance, honest advice and software that works.`,
          `${site.legalName} নির্দেশনার অংশ — ${num(site.founded)} সালে শুরু হওয়া একটি উদ্যোগ, যার লক্ষ্য মানুষ ও প্রতিষ্ঠানকে সঠিক দিকনির্দেশনা দেওয়া। সেই একই চেতনা আমরা ওয়েবেও আনি: স্পষ্ট দিকনির্দেশনা, সৎ পরামর্শ আর কাজের সফটওয়্যার।`,
        )}
        breadcrumbs={[{ label: L("About", "আমাদের সম্পর্কে") }]}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <PrimaryButton href="/contact">{L("Work with us", "আমাদের সাথে কাজ করুন")}</PrimaryButton>
          <SecondaryButton href="/projects">{L("See our work", "আমাদের কাজ দেখুন")}</SecondaryButton>
        </div>
      </PageHero>

      {/* Stats */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { value: `${num(years)}+`, label: L("Years of Nirdeshona", "নির্দেশনার বছর") },
            { value: num(stats?.projects ?? 0), label: L("Projects", "প্রজেক্ট") },
            { value: num(stats?.completed ?? 0), label: L("Launched", "লঞ্চ হয়েছে") },
            { value: num(stats?.clients ?? 0), label: L("Clients", "ক্লায়েন্ট") },
            { value: num(services.length), label: L("Services", "সার্ভিস") },
            { value: `${num(techCategories.flatMap((c) => c.items).length)}+`, label: L("Technologies", "প্রযুক্তি") },
          ].map((item) => (
            <div key={item.label} className="rounded-3xl border border-neutral-200 bg-white p-5">
              <p className="text-3xl font-bold tracking-[-0.04em] text-neutral-950">{item.value}</p>
              <p className="mt-1 text-xs text-neutral-500">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Story + mission */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow={L("Our story", "আমাদের গল্প")} title={L("Why we build for the web.", "কেন আমরা ওয়েবের জন্য বানাই।")} />
            <div className="mt-6 flex flex-col gap-4 text-base leading-7 text-neutral-600">
              <p>
                {L(
                  "Many organisations in Bangladesh — NGOs, student groups, small businesses and individual professionals — need a reliable website but are let down by slow templates, hidden costs or developers who disappear after launch.",
                  "বাংলাদেশের অনেক প্রতিষ্ঠান — এনজিও, ছাত্র সংগঠন, ছোট ব্যবসা ও পেশাজীবী — একটি নির্ভরযোগ্য ওয়েবসাইট চায়, কিন্তু ধীর টেমপ্লেট, লুকানো খরচ বা লঞ্চের পর উধাও হয়ে যাওয়া ডেভেলপারের কারণে হতাশ হয়।",
                )}
              </p>
              <p>
                {L(
                  "We started Nirdeshona Web to do it differently: modern technology, mobile-first design for the phones people actually use, Bengali and English support, and a client portal so you can always see progress and get help.",
                  "আমরা নির্দেশনা ওয়েব শুরু করেছি ভিন্নভাবে করার জন্য: আধুনিক প্রযুক্তি, মানুষের হাতের ফোনের কথা ভেবে মোবাইল-ফার্স্ট ডিজাইন, বাংলা ও ইংরেজি সাপোর্ট, আর একটি ক্লায়েন্ট পোর্টাল — যাতে সবসময় অগ্রগতি দেখতে ও সাহায্য পেতে পারেন।",
                )}
              </p>
              <p>
                {L(
                  "We work with a small number of clients at a time, so every project gets proper attention from the first call to long after launch.",
                  "আমরা একসাথে অল্পসংখ্যক ক্লায়েন্টের সাথে কাজ করি, তাই প্রথম কল থেকে লঞ্চের অনেক পর পর্যন্ত প্রতিটি প্রজেক্ট যথাযথ মনোযোগ পায়।",
                )}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-3xl bg-neutral-950 p-7 text-white">
              <Target className="h-6 w-6 text-emerald-300" />
              <h3 className="mt-4 text-lg font-semibold">{L("Our mission", "আমাদের লক্ষ্য")}</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-400">
                {L(
                  "Make professional, modern websites accessible to organisations and people who are usually priced out or left behind.",
                  "পেশাদার, আধুনিক ওয়েবসাইট সেইসব প্রতিষ্ঠান ও মানুষের নাগালে আনা, যারা সাধারণত খরচের কারণে পিছিয়ে পড়ে।",
                )}
              </p>
            </div>
            <div className="rounded-3xl border border-neutral-200 bg-white p-7">
              <Eye className="h-6 w-6 text-neutral-700" />
              <h3 className="mt-4 text-lg font-semibold text-neutral-950">{L("Our vision", "আমাদের স্বপ্ন")}</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-600">
                {L(
                  "A web where every serious organisation in Bangladesh has a fast, secure, bilingual site it fully owns and can grow.",
                  "এমন একটি ওয়েব, যেখানে বাংলাদেশের প্রতিটি গুরুত্বপূর্ণ প্রতিষ্ঠানের থাকবে দ্রুত, নিরাপদ, দ্বিভাষিক একটি সাইট — যার পূর্ণ মালিক তারা নিজেরাই এবং যা বাড়ানো যায়।",
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="border-y border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading eyebrow={L("Journey", "পথচলা")} title={L("How we got here", "যেভাবে এখানে এলাম")} />
          <ol className="relative mt-10 grid grid-cols-1 gap-6 md:grid-cols-4">
            <div aria-hidden className="absolute left-[19px] top-2 h-[calc(100%-1rem)] w-px bg-neutral-200 md:left-0 md:right-0 md:top-[19px] md:h-px md:w-full" />
            {milestones.map((m) => (
              <li key={m.year} className="relative flex gap-4 md:flex-col md:gap-0">
                <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-neutral-50 bg-neutral-950 text-[10px] font-bold text-white">
                  {m.year.slice(-2)}
                </span>
                <div className="md:mt-5">
                  <p className="text-xs font-semibold text-neutral-400">{m.year}</p>
                  <h3 className="mt-1 font-semibold text-neutral-950">{m.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-neutral-600">{m.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading eyebrow={L("What we believe", "আমরা যা বিশ্বাস করি")} title={L("Principles we work by", "যে নীতিতে কাজ করি")} align="center" />
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value, index) => {
            const Icon = VALUE_ICONS[index % VALUE_ICONS.length];
            return (
              <div key={value.title} className="rounded-3xl border border-neutral-200 bg-white p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-950 text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-base font-semibold text-neutral-950">{value.title}</h3>
                <p className="mt-2 text-sm leading-6 text-neutral-600">{value.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Team */}
      <section className="border-y border-neutral-200 bg-neutral-50">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.3fr] lg:items-center lg:px-8">
          <SectionHeading
            eyebrow={L("The people", "মানুষগুলো")}
            title={L("You work directly with the person building your site.", "যিনি আপনার সাইট বানাচ্ছেন, সরাসরি তার সাথেই কাজ করবেন।")}
            description={L("No account managers in the middle. Questions go straight to the people writing the code.", "মাঝখানে কোনো অ্যাকাউন্ট ম্যানেজার নেই। প্রশ্ন সরাসরি যায় যারা কোড লিখছেন তাদের কাছে।")}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {team.map((member) => (
              <div key={member.name} className="rounded-3xl border border-neutral-200 bg-white p-6">
                <div className="flex items-center gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-950 text-lg font-bold text-white">
                    {member.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={member.photo} alt={member.name} className="h-full w-full object-cover" />
                    ) : (
                      member.name
                        .split(" ")
                        .map((p) => p[0])
                        .slice(0, 2)
                        .join("")
                    )}
                  </span>
                  <div>
                    <p className="font-semibold text-neutral-950">{member.name}</p>
                    <p className="text-sm text-neutral-500">{member.role}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-neutral-600">{member.bio}</p>
              </div>
            ))}
            <Link href="/contact" className="flex flex-col justify-center rounded-3xl border border-dashed border-neutral-300 p-6 transition hover:border-neutral-400 hover:bg-white">
              <p className="font-semibold text-neutral-950">{L("Plus trusted collaborators", "সাথে বিশ্বস্ত সহযোগীরা")}</p>
              <p className="mt-2 text-sm leading-6 text-neutral-600">{L("Writers, designers and specialists join when a project needs them.", "প্রজেক্টের প্রয়োজনে লেখক, ডিজাইনার ও বিশেষজ্ঞরা যুক্ত হন।")}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-neutral-950">
                {L("Work with us", "আমাদের সাথে কাজ করুন")} <ArrowUpRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading eyebrow={L("Why us", "কেন আমরা")} title={L("How we compare", "তুলনায় আমরা")} description={L("A fair, general comparison — the right choice depends on your project.", "একটি ন্যায্য, সাধারণ তুলনা — সঠিক পছন্দ নির্ভর করে আপনার প্রজেক্টের ওপর।")} />
        <div className="mt-8 overflow-x-auto rounded-3xl border border-neutral-200 bg-white">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left">
                <th className="p-4 font-medium text-neutral-500"> </th>
                <th className="bg-neutral-950 p-4 text-center font-semibold text-white">{L("Nirdeshona Web", "নির্দেশনা ওয়েব")}</th>
                <th className="p-4 text-center font-medium text-neutral-600">{L("Typical freelancer", "সাধারণ ফ্রিল্যান্সার")}</th>
                <th className="p-4 text-center font-medium text-neutral-600">{L("Large agency", "বড় এজেন্সি")}</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((row) => (
                <tr key={row.label} className="border-b border-neutral-100 last:border-0">
                  <td className="p-4 font-medium text-neutral-800">{row.label}</td>
                  {[row.us, row.freelancer, row.agency].map((v, i) => (
                    <td key={i} className={`p-4 text-center ${i === 0 ? "bg-neutral-50" : ""}`}>
                      <Mark value={v} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Services */}
      <section className="border-y border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading eyebrow={L("What we do", "আমরা যা করি")} title={L("Six ways we can help", "ছয়ভাবে আমরা সাহায্য করতে পারি")} />
            <Link href="/services" className="text-sm font-semibold text-neutral-950 hover:underline">
              {L("All services →", "সব সার্ভিস →")}
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <Link key={s.slug} href={`/services/${s.slug}`} className="group flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-4 transition hover:shadow-sm">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-950 text-white">
                  <ServiceIcon icon={s.icon} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-neutral-950">{s.title}</span>
                  <span className="block text-xs text-neutral-500">{L("From", "শুরু")} {s.startingFrom} · {s.timeline}</span>
                </span>
                <ArrowUpRight className="h-4 w-4 text-neutral-300 transition group-hover:text-neutral-950" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Tech + process */}
      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <SectionHeading eyebrow={L("Technology", "প্রযুক্তি")} title={L("Our toolbox", "আমাদের টুলবক্স")} />
          <div className="mt-8 flex flex-col gap-5">
            {techCategories.map((cat) => (
              <div key={cat.name}>
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">{cat.name}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {cat.items.map((t) => (
                    <span key={t} className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-700">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <SectionHeading eyebrow={L("How we work", "আমরা যেভাবে কাজ করি")} title={L("Five steps, no surprises.", "পাঁচ ধাপ, কোনো চমক নেই।")} />
          <ol className="mt-8 flex flex-col gap-3">
            {processSteps.map((step, index) => (
              <li key={step.title} className="flex gap-4 rounded-2xl border border-neutral-200 bg-white p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-xs font-semibold text-white">{num(index + 1)}</span>
                <div>
                  <h3 className="text-sm font-semibold text-neutral-950">{step.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-neutral-600">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Clients + FAQ */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        {clients.length > 0 && (
          <div className="mb-12 flex flex-col items-center gap-4 rounded-3xl border border-neutral-200 bg-neutral-50 p-6 sm:flex-row">
            <p className="shrink-0 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">{L("Trusted by", "যাদের আস্থা পেয়েছি")}</p>
            <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
              {clients.map((c) => (
                <span key={c.name} className="rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-sm font-medium text-neutral-700">
                  {c.name}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.4fr]">
          <SectionHeading eyebrow={L("Questions", "প্রশ্ন")} title={L("Good to know", "জেনে রাখা ভালো")} description={L("More answers on the FAQ page.", "আরও উত্তর পাবেন প্রশ্নোত্তর পেজে।")} />
          <div className="flex flex-col gap-4">
            <FaqList items={aboutFaq} />
            <Link href="/faq" className="text-sm font-semibold text-neutral-950 hover:underline">
              {L("All frequently asked questions →", "সব প্রশ্নোত্তর →")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Mark({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="mx-auto h-5 w-5 text-emerald-600" aria-label="✓" />;
  if (value === false) return <X className="mx-auto h-5 w-5 text-neutral-300" aria-label="✗" />;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-neutral-500">
      <Minus className="h-3.5 w-3.5" /> {value}
    </span>
  );
}
