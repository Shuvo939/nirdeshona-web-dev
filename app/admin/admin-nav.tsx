"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  ClipboardList,
  FolderKanban,
  LayoutDashboard,
  MessageSquareText,
  Newspaper,
} from "lucide-react";

const links = [
  {
    href: "/admin",
    label: "Overview",
    description: "Dashboard overview",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/clients",
    label: "Clients",
    description: "Client portal access",
    icon: Building2,
  },
  {
    href: "/admin/projects",
    label: "Projects",
    description: "Manage projects",
    icon: FolderKanban,
  },
  {
    href: "/admin/posts",
    label: "Posts",
    description: "Manage articles",
    icon: Newspaper,
  },
  {
    href: "/admin/tickets",
    label: "Support Tickets",
    description: "Client support",
    icon: ClipboardList,
  },
  {
    href: "/admin/contacts",
    label: "Contact Requests",
    description: "Project inquiries",
    icon: MessageSquareText,
  },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminNav({
  mobile = false,
}: {
  mobile?: boolean;
}) {
  const pathname = usePathname();

  if (mobile) {
    return (
      <nav
        aria-label="Admin navigation"
        className="flex min-w-max gap-1"
      >
        {links.map((link) => {
          const Icon = link.icon;
          const active = isActivePath(pathname, link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={[
                "inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-neutral-950 text-white shadow-sm"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950",
              ].join(" ")}
            >
              <Icon className="h-4 w-4" strokeWidth={1.8} />

              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav
      aria-label="Admin navigation"
      className="space-y-1"
    >
      {links.map((link) => {
        const Icon = link.icon;
        const active = isActivePath(pathname, link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={[
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 transition",
              active
                ? "bg-neutral-950 text-white shadow-sm"
                : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950",
            ].join(" ")}
          >
            <span
              className={[
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition",
                active
                  ? "bg-white/10 text-white"
                  : "bg-neutral-100 text-neutral-500 group-hover:bg-white group-hover:text-neutral-950",
              ].join(" ")}
            >
              <Icon
                className="h-4 w-4"
                strokeWidth={1.8}
              />
            </span>

            <span className="min-w-0">
              <span
                className={[
                  "block truncate text-sm font-medium",
                  active ? "text-white" : "text-neutral-700",
                ].join(" ")}
              >
                {link.label}
              </span>

              <span
                className={[
                  "mt-0.5 block truncate text-[11px]",
                  active ? "text-neutral-400" : "text-neutral-400",
                ].join(" ")}
              >
                {link.description}
              </span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}