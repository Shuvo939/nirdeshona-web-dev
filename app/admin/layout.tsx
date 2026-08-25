import { requireAdmin } from "@/lib/auth/require-admin";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/posts", label: "Posts" },
  { href: "/admin/tickets", label: "Support Tickets" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { fullName } = await requireAdmin();

  return (
    <div className="min-h-screen bg-neutral-50 md:flex">
      {/* =====================================================
          DESKTOP SIDEBAR
      ====================================================== */}
      <aside className="hidden w-56 shrink-0 border-r border-neutral-200 bg-white md:block">
        <div className="sticky top-0 p-4">
          <p className="mb-6 px-3 text-sm text-neutral-500">
            Signed in as{" "}
            <span className="font-medium text-neutral-700">
              {fullName ?? "Admin"}
            </span>
          </p>

          <nav className="space-y-1">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </aside>

      {/* =====================================================
          MOBILE TOP NAVIGATION
      ====================================================== */}
      <div className="border-b border-neutral-200 bg-white md:hidden">
        <div className="px-4 py-4">
          <div className="mb-3">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-neutral-400">
              Admin
            </p>

            <p className="mt-1 text-sm font-medium text-neutral-700">
              Signed in as {fullName ?? "Admin"}
            </p>
          </div>

          <nav className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}