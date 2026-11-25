/**
 * Route skeletons. Each loading.tsx renders one of these so a click on a link
 * switches to the new page immediately and shows its shape while the data loads,
 * instead of leaving the visitor on the old page.
 */

function Bar({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-full bg-neutral-200/80 ${className}`} />;
}

function Block({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-neutral-200/70 ${className}`} />;
}

function Shell({ children, label = "Loading" }: { children: React.ReactNode; label?: string }) {
  return (
    <div role="status" aria-busy="true" aria-live="polite" className="min-h-[70vh]">
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

/** Mirrors PageHero: breadcrumb, eyebrow, title, description. */
export function HeroSkeleton({ withStats = false }: { withStats?: boolean }) {
  return (
    <section className="border-b border-neutral-200 bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <Bar className="h-3 w-32" />
        <Bar className="mt-8 h-6 w-28" />
        <Bar className="mt-5 h-9 w-full max-w-xl sm:h-11" />
        <Bar className="mt-3 h-9 w-4/5 max-w-md sm:h-11" />
        <Bar className="mt-6 h-4 w-full max-w-2xl" />
        <Bar className="mt-2 h-4 w-3/4 max-w-xl" />
        {withStats && (
          <div className="mt-8 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Block key={i} className="h-20" />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white">
      <Block className="aspect-[16/10] rounded-none" />
      <div className="p-5">
        <Bar className="h-3 w-20" />
        <Bar className="mt-4 h-5 w-4/5" />
        <Bar className="mt-3 h-3.5 w-full" />
        <Bar className="mt-2 h-3.5 w-2/3" />
      </div>
    </div>
  );
}

export function CardGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Generic marketing page: hero + content grid. */
export function PageSkeleton() {
  return (
    <Shell>
      <HeroSkeleton />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <CardGrid />
      </div>
    </Shell>
  );
}

/** Projects / blog listing: hero, filter pills, grid. */
export function ListingSkeleton({ withStats = false }: { withStats?: boolean }) {
  return (
    <Shell>
      <HeroSkeleton withStats={withStats} />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Block className="h-12 w-full rounded-2xl" />
        <div className="mt-4 flex gap-2 overflow-hidden">
          {Array.from({ length: 6 }, (_, i) => (
            <Bar key={i} className="h-9 w-24 shrink-0" />
          ))}
        </div>
        <div className="mt-8">
          <CardGrid />
        </div>
      </div>
    </Shell>
  );
}

/** Blog article: title block, cover, paragraphs, sidebar. */
export function ArticleSkeleton() {
  return (
    <Shell>
      <div className="mx-auto max-w-3xl px-4 pb-8 pt-10 sm:px-6 sm:pt-14">
        <Bar className="h-3 w-40" />
        <Bar className="mt-6 h-6 w-24" />
        <Bar className="mt-5 h-9 w-full sm:h-11" />
        <Bar className="mt-3 h-9 w-3/4 sm:h-11" />
        <div className="mt-6 flex items-center gap-3">
          <Block className="h-10 w-10 rounded-full" />
          <div className="flex-1">
            <Bar className="h-3.5 w-32" />
            <Bar className="mt-2 h-3 w-48" />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <Block className="aspect-[16/8] w-full rounded-3xl" />
      </div>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {Array.from({ length: 4 }, (_, p) => (
          <div key={p} className="mb-8">
            {p > 0 && <Bar className="mb-5 h-6 w-1/2" />}
            <Bar className="h-4 w-full" />
            <Bar className="mt-3 h-4 w-full" />
            <Bar className="mt-3 h-4 w-11/12" />
            <Bar className="mt-3 h-4 w-2/3" />
          </div>
        ))}
      </div>
    </Shell>
  );
}

/** Project case study: header with cover, overview, details card. */
export function ProjectSkeleton() {
  return (
    <Shell>
      <section className="border-b border-neutral-200 bg-neutral-50">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-16">
          <div>
            <Bar className="h-3 w-40" />
            <div className="mt-6 flex gap-2">
              <Bar className="h-6 w-20" />
              <Bar className="h-6 w-24" />
            </div>
            <Bar className="mt-5 h-10 w-full max-w-md" />
            <Bar className="mt-5 h-4 w-full" />
            <Bar className="mt-2 h-4 w-4/5" />
            <div className="mt-8 flex gap-3">
              <Bar className="h-11 w-36" />
              <Bar className="h-11 w-28" />
            </div>
          </div>
          <Block className="aspect-[16/10] w-full rounded-3xl" />
        </div>
      </section>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_320px] lg:px-8">
        <div>
          {Array.from({ length: 3 }, (_, p) => (
            <div key={p} className="mb-8">
              <Bar className="mb-5 h-6 w-1/3" />
              <Bar className="h-4 w-full" />
              <Bar className="mt-3 h-4 w-11/12" />
              <Bar className="mt-3 h-4 w-3/4" />
            </div>
          ))}
        </div>
        <Block className="h-72 rounded-3xl" />
      </div>
    </Shell>
  );
}

/** Account / client portal content area (the side nav stays in the layout). */
export function PortalSkeleton() {
  return (
    <Shell>
      <div className="flex flex-col gap-6">
        <div>
          <Bar className="h-3 w-40" />
          <Bar className="mt-4 h-8 w-64" />
          <Bar className="mt-3 h-4 w-80 max-w-full" />
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Block key={i} className="h-24" />
          ))}
        </div>
        <Block className="h-56 rounded-3xl" />
        <Block className="h-40 rounded-3xl" />
      </div>
    </Shell>
  );
}

/** Admin pages: title row and a table. */
export function AdminSkeleton() {
  return (
    <Shell>
      <div className="flex items-center justify-between">
        <Bar className="h-8 w-48" />
        <Bar className="h-10 w-32" />
      </div>
      <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-neutral-100 px-4 py-4 last:border-0">
            <Bar className="h-4 w-1/3" />
            <Bar className="h-4 w-1/5" />
            <Bar className="ml-auto h-4 w-16" />
          </div>
        ))}
      </div>
    </Shell>
  );
}

/** Auth pages: centred card. */
export function AuthSkeleton() {
  return (
    <Shell>
      <div className="mx-auto max-w-md px-4 py-16">
        <Block className="mx-auto h-12 w-12 rounded-2xl" />
        <Bar className="mx-auto mt-6 h-7 w-48" />
        <Bar className="mx-auto mt-3 h-4 w-64" />
        <div className="mt-8 rounded-3xl border border-neutral-200 bg-white p-6">
          <Block className="h-11 rounded-xl" />
          <Block className="mt-4 h-11 rounded-xl" />
          <Block className="mt-4 h-11 rounded-xl" />
          <Bar className="mt-6 h-11 w-full" />
        </div>
      </div>
    </Shell>
  );
}
