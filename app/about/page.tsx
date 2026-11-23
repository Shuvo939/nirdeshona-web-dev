import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Check, Compass, Eye, HeartHandshake, Layers3, Minus, Smartphone, Target, X } from "lucide-react";

import { FaqList, PageHero, PrimaryButton, SecondaryButton, SectionHeading, ServiceIcon } from "@/app/components/marketing";
import { sql } from "@/lib/db";
import { comparison, faqGroups, milestones, processSteps, services, site, team, techCategories, values } from "@/lib/site";

export const metadata: Metadata = {
  title: "About — Nirdeshona Web",
  description:
    "Nirdeshona Web Development is a small, focused studio from Bangladesh building modern websites and web applications.",
  alternates: { canonical: "/about" },
};

const VALUE_ICONS = [Compass, Smartphone, Layers3, HeartHandshake];

export default async function AboutPage() {
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
  const aboutFaq = faqGroups.flatMap((g) => g.items).filter((f) => /own|technolog|bengali|secure|start/i.test(f.q)).slice(0, 4);

  return (
    <>
      <PageHero
        eyebrow="About us"
        title="A small studio that cares about the details."
        description={`${site.legalName} is part of Nirdeshona — an initiative started in ${site.founded} to help people and organisations find direction. We bring that same spirit to the web: clear guidance, honest advice and software that works.`}
        breadcrumbs={[{ label: "About" }]}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <PrimaryButton href="/contact">Work with us</PrimaryButton>
          <SecondaryButton href="/projects">See our work</SecondaryButton>
        </div>
      </PageHero>

      {/* Stats */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { value: `${years}+`, label: "Years of Nirdeshona" },
            { value: String(stats?.projects ?? 0), label: "Projects" },
            { value: String(stats?.completed ?? 0), label: "Launched" },
            { value: String(stats?.clients ?? 0), label: "Clients" },
            { value: String(services.length), label: "Services" },
            { value: `${techCategories.flatMap((c) => c.items).length}+`, label: "Technologies" },
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
            <SectionHeading eyebrow="Our story" title="Why we build for the web." />
            <div className="mt-6 flex flex-col gap-4 text-base leading-7 text-neutral-600">
              <p>
                Many organisations in Bangladesh — NGOs, student groups, small businesses and individual professionals — need a
                reliable website but are let down by slow templates, hidden costs or developers who disappear after launch.
              </p>
              <p>
                We started Nirdeshona Web to do it differently: modern technology, mobile-first design for the phones people
                actually use, Bengali and English support, and a client portal so you can always see progress and get help.
              </p>
              <p>We work with a small number of clients at a time, so every project gets proper attention from the first call to long after launch.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-3xl bg-neutral-950 p-7 text-white">
              <Target className="h-6 w-6 text-emerald-300" />
              <h3 className="mt-4 text-lg font-semibold">Our mission</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-400">
                Make professional, modern websites accessible to organisations and people who are usually priced out or left behind.
              </p>
            </div>
            <div className="rounded-3xl border border-neutral-200 bg-white p-7">
              <Eye className="h-6 w-6 text-neutral-700" />
              <h3 className="mt-4 text-lg font-semibold text-neutral-950">Our vision</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-600">
                A web where every serious organisation in Bangladesh has a fast, secure, bilingual site it fully owns and can grow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="border-y border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Journey" title="How we got here" />
          <ol className="relative mt-10 grid grid-cols-1 gap-6 md:grid-cols-4">
            <div aria-hidden className="absolute left-[19px] top-2 h-[calc(100%-1rem)] w-px bg-neutral-200 md:left-0 md:right-0 md:top-[19px] md:h-px md:w-full" />
            {milestones.map((m) => (
              <li key={m.year} className="relative flex gap-4 md:flex-col md:gap-0">
                <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-neutral-50 bg-neutral-950 text-[10px] font-bold text-white">
                  {m.year.slice(2)}
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
        <SectionHeading eyebrow="What we believe" title="Principles we work by" align="center" />
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
            eyebrow="The people"
            title="You work directly with the person building your site."
            description="No account managers in the middle. Questions go straight to the people writing the code."
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
              <p className="font-semibold text-neutral-950">Plus trusted collaborators</p>
              <p className="mt-2 text-sm leading-6 text-neutral-600">Writers, designers and specialists join when a project needs them.</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-neutral-950">
                Work with us <ArrowUpRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Why us" title="How we compare" description="A fair, general comparison — the right choice depends on your project." />
        <div className="mt-8 overflow-x-auto rounded-3xl border border-neutral-200 bg-white">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left">
                <th className="p-4 font-medium text-neutral-500"> </th>
                <th className="bg-neutral-950 p-4 text-center font-semibold text-white">Nirdeshona Web</th>
                <th className="p-4 text-center font-medium text-neutral-600">Typical freelancer</th>
                <th className="p-4 text-center font-medium text-neutral-600">Large agency</th>
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
            <SectionHeading eyebrow="What we do" title="Six ways we can help" />
            <Link href="/services" className="text-sm font-semibold text-neutral-950 hover:underline">
              All services →
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
                  <span className="block text-xs text-neutral-500">From {s.startingFrom} · {s.timeline}</span>
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
          <SectionHeading eyebrow="Technology" title="Our toolbox" />
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
          <SectionHeading eyebrow="How we work" title="Five steps, no surprises." />
          <ol className="mt-8 flex flex-col gap-3">
            {processSteps.map((step, index) => (
              <li key={step.title} className="flex gap-4 rounded-2xl border border-neutral-200 bg-white p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-xs font-semibold text-white">{index + 1}</span>
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
            <p className="shrink-0 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">Trusted by</p>
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
          <SectionHeading eyebrow="Questions" title="Good to know" description="More answers on the FAQ page." />
          <div className="flex flex-col gap-4">
            <FaqList items={aboutFaq} />
            <Link href="/faq" className="text-sm font-semibold text-neutral-950 hover:underline">
              All frequently asked questions →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Mark({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="mx-auto h-5 w-5 text-emerald-600" aria-label="Yes" />;
  if (value === false) return <X className="mx-auto h-5 w-5 text-neutral-300" aria-label="No" />;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-neutral-500">
      <Minus className="h-3.5 w-3.5" /> {value}
    </span>
  );
}
