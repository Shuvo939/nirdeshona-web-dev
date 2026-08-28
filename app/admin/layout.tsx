import type { ReactNode } from "react";

import { requireAdmin } from "@/lib/auth/require-admin";

import AdminNav from "./admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="flex min-h-screen">
        {/* =====================================================
            DESKTOP SIDEBAR
        ====================================================== */}

        <aside className="hidden w-64 shrink-0 border-r border-neutral-200 bg-white lg:block">
          <div className="sticky top-0 flex h-screen flex-col">
            {/* Brand */}

            <div className="border-b border-neutral-200 px-5 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-950 text-sm font-bold text-white">
                  N
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold tracking-tight text-neutral-950">
                    Nirdeshona
                  </p>

                  <p className="mt-0.5 text-xs text-neutral-400">
                    Administration
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}

            <div className="flex-1 overflow-y-auto px-3 py-5">
              <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                Workspace
              </p>

              <AdminNav />
            </div>

            {/* Footer */}

            <div className="border-t border-neutral-200 p-4">
              <div className="rounded-2xl bg-neutral-50 px-4 py-3">
                <p className="text-xs font-medium text-neutral-700">
                  Admin workspace
                </p>

                <p className="mt-1 text-[11px] leading-5 text-neutral-400">
                  Manage your projects, content, clients and support requests.
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* =====================================================
            MAIN AREA
        ====================================================== */}

        <div className="min-w-0 flex-1">
          {/* Mobile header */}

          <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur lg:hidden">
            <div className="px-4 py-3 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-950 text-sm font-bold text-white">
                  N
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold tracking-tight text-neutral-950">
                    Nirdeshona
                  </p>

                  <p className="text-[11px] text-neutral-400">
                    Administration
                  </p>
                </div>
              </div>

              <div className="mt-3 -mx-1 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <AdminNav mobile />
              </div>
            </div>
          </header>

          {/* Page content */}

          <main className="min-w-0 p-4 sm:p-6 lg:p-8 xl:p-10">
            <div className="mx-auto w-full max-w-[1600px]">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}