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
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-neutral-200 p-4">
        <p className="mb-6 text-sm text-neutral-500">
          Signed in as {fullName ?? "Admin"}
        </p>
        <nav className="space-y-1">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block rounded px-3 py-2 text-sm hover:bg-neutral-100"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
