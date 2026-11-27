import Link from "@/app/components/locale-link";
import {
  ArrowRight,
  BriefcaseBusiness,
  CircleHelp,
  Compass,
  Home,
  Search,
} from "lucide-react";
import NotFoundActions from "@/app/components/not-found-actions";
import { getI18n } from "@/lib/i18n/server";

const quickLinks = [
  {
    href: "/",
    label: ["Home", "হোম"],
    description: ["Return to the homepage", "হোমপেজে ফিরে যান"],
    icon: Home,
  },
  {
    href: "/projects",
    label: ["Our Work", "আমাদের কাজ"],
    description: ["Explore our projects", "আমাদের প্রজেক্টগুলো দেখুন"],
    icon: BriefcaseBusiness,
  },
  {
    href: "/services",
    label: ["Services", "সার্ভিস"],
    description: ["See what we can build", "আমরা কী বানাতে পারি দেখুন"],
    icon: Compass,
  },
  {
    href: "/contact",
    label: ["Contact", "যোগাযোগ"],
    description: ["Talk to our team", "আমাদের টিমের সঙ্গে কথা বলুন"],
    icon: CircleHelp,
  },
];

export default async function NotFound() {
  const { L } = await getI18n();
  return (
    <main className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-white">
      {/* =========================================================
          BACKGROUND
      ========================================================== */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        {/* Soft central glow */}
        <div className="absolute left-1/2 top-[42%] h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-100/80 blur-3xl" />

        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.45]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgb(var(--c-neutral-200)) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--c-neutral-200)) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage:
              "radial-gradient(circle at center, black 0%, transparent 72%)",
            WebkitMaskImage:
              "radial-gradient(circle at center, black 0%, transparent 72%)",
          }}
        />

        {/* Top-left orbit */}
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full border border-neutral-200/70" />

        <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full border border-dashed border-neutral-200/70" />

        {/* Bottom-right orbit */}
        <div className="absolute -bottom-44 -right-44 h-[520px] w-[520px] rounded-full border border-neutral-200/70" />

        <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full border border-dashed border-neutral-200/70" />

        {/* Tiny decorative dots */}
        <div className="absolute left-[12%] top-[25%] h-1.5 w-1.5 rounded-full bg-neutral-300" />
        <div className="absolute right-[16%] top-[30%] h-2 w-2 rounded-full bg-neutral-200" />
        <div className="absolute bottom-[20%] left-[20%] h-2 w-2 rounded-full bg-neutral-200" />
      </div>

      {/* =========================================================
          CONTENT
      ========================================================== */}

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-72px)] w-full max-w-6xl items-center px-6 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto w-full max-w-3xl text-center">

          {/* Status pill */}
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/90 px-3.5 py-2 shadow-sm backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neutral-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-neutral-900" />
              </span>

              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                {L("Error 404", "ত্রুটি ৪০৪")}
              </span>
            </div>
          </div>

          {/* =====================================================
              404 DISPLAY
          ====================================================== */}

          <div className="relative mt-8 select-none">
            {/* Glow behind number */}
            <div
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 h-40 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-200/50 blur-3xl"
            />

            <p
              aria-hidden="true"
              className="relative bg-gradient-to-b from-neutral-200 via-neutral-100 to-neutral-50 bg-clip-text text-[clamp(8rem,28vw,16rem)] font-black leading-[0.72] tracking-[-0.1em] text-transparent"
            >
              404
            </p>

            {/* Center marker */}
            <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-neutral-200 bg-white/90 shadow-xl shadow-black/[0.06] backdrop-blur sm:h-20 sm:w-20 sm:rounded-3xl">
                <Compass className="h-7 w-7 text-neutral-700 sm:h-8 sm:w-8" />
              </div>
            </div>
          </div>

          {/* =====================================================
              MESSAGE
          ====================================================== */}

          <div className="-mt-2 sm:-mt-5">
            <h1 className="text-3xl font-bold tracking-[-0.03em] text-neutral-950 sm:text-4xl lg:text-[42px]">
              {L("This page took a wrong turn.", "এই পেজটি পথ হারিয়েছে।")}
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-neutral-500 sm:text-base">
              {L("The page you're looking for doesn't exist, has moved, or the address may have been entered incorrectly.", "আপনি যে পেজটি খুঁজছেন তা নেই, সরানো হয়েছে, অথবা ঠিকানা ভুল লেখা হয়ে থাকতে পারে।")}
            </p>
          </div>

          {/* =====================================================
              PRIMARY ACTIONS
          ====================================================== */}

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 px-6 text-sm font-semibold text-white shadow-lg shadow-black/10 transition duration-200 hover:-translate-y-0.5 hover:bg-neutral-800 sm:w-auto"
            >
              <Home className="h-4 w-4" />

              {L("Back to home", "হোমে ফিরে যান")}
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>

            <NotFoundActions />
          </div>

          {/* =====================================================
              SEARCH CTA
          ====================================================== */}

          <Link
            href="/search"
            className="group mx-auto mt-5 flex w-full max-w-md items-center gap-3 rounded-2xl border border-neutral-200 bg-white/80 p-3 text-left shadow-sm backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:bg-white hover:shadow-md"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 transition group-hover:bg-neutral-950 group-hover:text-white">
              <Search className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-neutral-900">
                {L("Search Nirdeshona", "নির্দেশনায় খুঁজুন")}
              </p>

              <p className="mt-0.5 truncate text-xs text-neutral-500">
                {L("Find projects, services, articles and more", "প্রজেক্ট, সার্ভিস, লেখা ও আরও অনেক কিছু খুঁজুন")}
              </p>
            </div>

            <ArrowRight className="h-4 w-4 shrink-0 text-neutral-300 transition group-hover:translate-x-0.5 group-hover:text-neutral-700" />
          </Link>

          {/* =====================================================
              QUICK LINKS
          ====================================================== */}

          <div className="mx-auto mt-14 max-w-3xl border-t border-neutral-200/80 pt-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
              {L("Maybe you were looking for", "হয়তো আপনি এগুলো খুঁজছিলেন")}
            </p>

            <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {quickLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group rounded-2xl border border-transparent p-3 text-left transition duration-200 hover:border-neutral-200 hover:bg-white hover:shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 transition group-hover:bg-neutral-950 group-hover:text-white">
                        <Icon className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-neutral-800">
                          {L(item.label[0], item.label[1])}
                        </p>

                        <p className="mt-0.5 truncate text-[11px] text-neutral-400">
                          {L(item.description[0], item.description[1])}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Bottom brand */}
          <div className="mt-10">
            <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-neutral-300">
              {L("Nirdeshona Web", "নির্দেশনা ওয়েব")}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}