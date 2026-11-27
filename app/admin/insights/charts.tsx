"use client";

import { useState } from "react";

/**
 * Daily bar chart (one series). Bars use the ink token so they follow light/dark
 * themes; hover (or tap) shows the exact day and value.
 */
export function DailyBars({ data, unit, height = 140 }: { data: { day: string; value: number }[]; unit: string; height?: number }) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.value));
  const total = data.reduce((a, d) => a + d.value, 0);
  const shown = active !== null ? data[active] : null;
  const fmtDay = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  // Label every nth day so labels never collide.
  const every = Math.ceil(data.length / 6);

  return (
    <div>
      <div className="mb-2 flex h-5 items-baseline justify-between text-xs text-neutral-500">
        {shown ? (
          <span>
            <span className="font-semibold text-neutral-950">{shown.value.toLocaleString("en-US")}</span> {unit} · {fmtDay(shown.day)}
          </span>
        ) : (
          <span>
            <span className="font-semibold text-neutral-950">{total.toLocaleString("en-US")}</span> {unit} in this period
          </span>
        )}
        <span>max {max.toLocaleString("en-US")}</span>
      </div>
      <div className="relative" style={{ height }} onMouseLeave={() => setActive(null)}>
        {/* recessive gridlines */}
        {[0.5, 1].map((f) => (
          <div key={f} className="absolute inset-x-0 border-t border-dashed border-neutral-200" style={{ bottom: `${f * 100}%` }} />
        ))}
        <div className="absolute inset-0 flex items-end gap-[2px]">
          {data.map((d, i) => (
            <button
              key={d.day}
              type="button"
              aria-label={`${fmtDay(d.day)}: ${d.value} ${unit}`}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              className="group relative flex h-full min-w-0 flex-1 items-end"
            >
              <span
                className={`block w-full rounded-t-[4px] transition ${active === i ? "bg-neutral-950" : active === null ? "bg-neutral-800" : "bg-neutral-300"}`}
                style={{ height: d.value ? `${Math.max(3, (d.value / max) * 100)}%` : 0 }}
              />
            </button>
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-0 border-t border-neutral-300" />
      </div>
      <div className="mt-1.5 flex gap-[2px] text-[10px] text-neutral-400">
        {data.map((d, i) => (
          <span key={d.day} className="min-w-0 flex-1 overflow-visible whitespace-nowrap">
            {i % every === 0 ? fmtDay(d.day) : ""}
          </span>
        ))}
      </div>
    </div>
  );
}
