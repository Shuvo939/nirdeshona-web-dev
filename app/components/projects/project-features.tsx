import { Check, ChevronDown } from "lucide-react";

/*
 * A–Z feature list on a project page. Source is simple Markdown:
 *
 *   ## Group name
 *   Optional one-line intro for the group.
 *   - **Feature name** — what it does.
 *     Optional continuation line.
 */

type Feature = { name: string; detail: string };
type Group = { title: string; intro: string; items: Feature[] };

export function parseFeatures(source: string): Group[] {
  const groups: Group[] = [];
  let group: Group | null = null;
  for (const raw of source.replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.trimEnd();
    if (!line.trim()) continue;
    const heading = line.match(/^#{2,3}\s+(.+)$/);
    if (heading) {
      group = { title: heading[1].trim(), intro: "", items: [] };
      groups.push(group);
      continue;
    }
    if (!group) {
      group = { title: "", intro: "", items: [] };
      groups.push(group);
    }
    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    if (bullet) {
      const text = bullet[1];
      const named = text.match(/^\*\*(.+?)\*\*\s*(?:[—–:-]\s*)?(.*)$/);
      group.items.push(named ? { name: named[1].trim(), detail: named[2].trim() } : { name: "", detail: text.trim() });
    } else if (group.items.length && /^\s{2,}/.test(raw)) {
      const last = group.items[group.items.length - 1];
      last.detail = `${last.detail} ${line.trim()}`.trim();
    } else if (!group.items.length) {
      group.intro = `${group.intro} ${line.trim()}`.trim();
    }
  }
  return groups.filter((g) => g.items.length || g.intro);
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Inline only: **bold**, *italic*, `code`. */
function inline(s: string) {
  return esc(s)
    .replace(/`([^`]+)`/g, '<code class="rounded bg-neutral-100 px-1 py-0.5 font-mono text-[0.85em] text-neutral-800">$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-neutral-900">$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
}

const slug = (s: string, i: number) => `features-${i + 1}-${s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "").slice(0, 40)}`;

export default function ProjectFeatures({
  source,
  title,
  summary,
  count = String,
}: {
  source: string;
  /** Formats the per-group count (Bangla digits on /bn). */
  count?: (n: number) => string;
  title: string;
  /** e.g. (features, groups) => "48 features in 9 areas" */
  summary: (features: number, groups: number) => string;
}) {
  const groups = parseFeatures(source);
  if (!groups.length) return null;
  const total = groups.reduce((a, g) => a + g.items.length, 0);
  const named = groups.filter((g) => g.title);

  return (
    <div id="features" className="scroll-mt-24">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">{title}</h2>
        <span className="text-xs text-neutral-400">{summary(total, groups.length)}</span>
      </div>

      {named.length > 2 && (
        <nav className="mt-4 flex flex-wrap gap-1.5" aria-label={title}>
          {groups.map((g, i) =>
            g.title ? (
              <a
                key={i}
                href={`#${slug(g.title, i)}`}
                className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-600 transition hover:border-neutral-950 hover:text-neutral-950"
              >
                {g.title}
              </a>
            ) : null,
          )}
        </nav>
      )}

      <div className="mt-4 flex flex-col gap-3">
        {groups.map((g, i) => (
          <details
            key={i}
            id={g.title ? slug(g.title, i) : undefined}
            open={i < 2 || groups.length <= 3}
            className="group scroll-mt-24 rounded-2xl border border-neutral-200 bg-white [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4">
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold text-neutral-950">{g.title || title}</span>
                {g.intro && <span className="mt-0.5 block text-sm leading-6 text-neutral-500">{g.intro}</span>}
              </span>
              <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium tabular-nums text-neutral-600">{count(g.items.length)}</span>
              <ChevronDown className="h-4 w-4 shrink-0 text-neutral-400 transition group-open:rotate-180" aria-hidden />
            </summary>
            {g.items.length > 0 && (
              <ul className="divide-y divide-neutral-100 border-t border-neutral-100 px-5">
                {g.items.map((f, j) => (
                  <li key={j} className="flex gap-3 py-3.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                      <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
                    </span>
                    <div className="min-w-0 text-[15px] leading-7 text-neutral-600">
                      {f.name && <p className="font-semibold leading-6 text-neutral-950" dangerouslySetInnerHTML={{ __html: inline(f.name) }} />}
                      {f.detail && <p className={f.name ? "mt-0.5" : ""} dangerouslySetInnerHTML={{ __html: inline(f.detail) }} />}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </details>
        ))}
      </div>
    </div>
  );
}
