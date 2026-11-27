import { PageHero } from "@/app/components/marketing";
import { getI18n } from "@/lib/i18n/server";

export type LegalSection = { id: string; title: string; body: React.ReactNode };

export default async function LegalPage({
  title,
  description,
  updated,
  summary,
  sections,
}: {
  title: string;
  description: string;
  updated: string;
  summary: string[];
  sections: LegalSection[];
}) {
  const { L, num } = await getI18n();
  return (
    <>
      <PageHero eyebrow={L(`Last updated ${updated}`, `সর্বশেষ হালনাগাদ ${updated}`)} title={title} description={description} breadcrumbs={[{ label: title }]} />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="flex flex-col gap-5 lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-3xl border border-neutral-200 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">{L("Contents", "সূচিপত্র")}</p>
              <ol className="mt-3 flex flex-col gap-1">
                {sections.map((section, index) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`} className="flex gap-2 rounded-lg px-2 py-1.5 text-sm text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950">
                      <span className="w-5 text-neutral-400">{num(index + 1)}.</span>
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
          <div className="flex min-w-0 flex-col gap-5">
            <div className="theme-fixed rounded-3xl border border-neutral-950 bg-neutral-950 p-6 text-white sm:p-8">
              <p className="text-sm font-semibold">{L("In short", "সংক্ষেপে")}</p>
              <ul className="mt-4 flex flex-col gap-2">
                {summary.map((line) => (
                  <li key={line} className="flex gap-3 text-sm leading-6 text-neutral-300">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
            {sections.map((section, index) => (
              <article key={section.id} id={section.id} className="scroll-mt-28 rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8">
                <h2 className="flex items-center gap-3 text-lg font-semibold text-neutral-950">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-semibold text-neutral-700">
                    {num(index + 1)}
                  </span>
                  {section.title}
                </h2>
                <div className="mt-4 flex flex-col gap-3 text-sm leading-7 text-neutral-600 [&_li]:ml-5 [&_li]:list-disc">
                  {section.body}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
