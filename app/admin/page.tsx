import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  FileText,
  FolderKanban,
  MessageSquareText,
  Users,
} from "lucide-react";

import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [
    [projectCount],
    [postCount],
    [openTickets],
    [clientCount],
    [newContacts],
  ] = await Promise.all([
    sql`
      select count(*)::int as count
      from public.projects
    `,

    sql`
      select count(*)::int as count
      from public.posts
    `,

    sql`
      select count(*)::int as count
      from public.support_tickets
      where status in (
        'OPEN',
        'IN_PROGRESS',
        'WAITING_FOR_CLIENT'
      )
    `,

    sql`
      select count(*)::int as count
      from public.clients
    `,

    sql`
      select count(*)::int as count
      from public.contact_requests
      where status = 'new'
    `,
  ]);

  const stats = [
    {
      label: "Clients",
      value: Number(clientCount.count),
      description: "Total client records",
      href: "/admin/clients",
      icon: Users,
    },
    {
      label: "Projects",
      value: Number(projectCount.count),
      description: "Projects in workspace",
      href: "/admin/projects",
      icon: FolderKanban,
    },
    {
      label: "Posts",
      value: Number(postCount.count),
      description: "Published and draft content",
      href: "/admin/posts",
      icon: FileText,
    },
    {
      label: "Open Tickets",
      value: Number(openTickets.count),
      description: "Tickets needing attention",
      href: "/admin/tickets",
      icon: ClipboardList,
    },
  ];

  const hasAttention =
    Number(openTickets.count) > 0 ||
    Number(newContacts.count) > 0;

  return (
    <div className="space-y-8">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <section>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
              Administration
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-[-0.035em] text-neutral-950 sm:text-4xl">
              Overview
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500 sm:text-base">
              A quick look at your workspace, client activity and items that
              may need your attention.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/projects"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-950"
            >
              <FolderKanban className="h-4 w-4" />
              Projects
            </Link>

            <Link
              href="/admin/posts"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-neutral-950 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800"
            >
              <FileText className="h-4 w-4" />
              Posts
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          STAT CARDS
      ====================================================== */}

      <section
        aria-label="Workspace statistics"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="group rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 transition group-hover:bg-neutral-950 group-hover:text-white">
                  <Icon
                    className="h-4.5 w-4.5"
                    strokeWidth={1.8}
                  />
                </div>

                <ArrowRight
                  className="h-4 w-4 text-neutral-300 transition group-hover:translate-x-0.5 group-hover:text-neutral-700"
                  strokeWidth={1.8}
                />
              </div>

              <p className="mt-5 text-sm font-medium text-neutral-500">
                {stat.label}
              </p>

              <p className="mt-1 text-3xl font-bold tracking-tight text-neutral-950">
                {stat.value.toLocaleString()}
              </p>

              <p className="mt-1.5 text-xs text-neutral-400">
                {stat.description}
              </p>
            </Link>
          );
        })}
      </section>

      {/* =====================================================
          ATTENTION + QUICK ACTIONS
      ====================================================== */}

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Attention */}

        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
                Attention
              </p>

              <h2 className="mt-2 text-xl font-semibold tracking-tight text-neutral-950">
                Items that may need action
              </h2>

              <p className="mt-2 text-sm leading-6 text-neutral-500">
                Keep your client communication and support queue up to date.
              </p>
            </div>

            <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 sm:flex">
              <MessageSquareText className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-6 divide-y divide-neutral-100 rounded-2xl border border-neutral-200">
            {/* Open tickets */}

            <Link
              href="/admin/tickets"
              className="group flex items-center justify-between gap-4 p-4 transition hover:bg-neutral-50"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
                  <ClipboardList className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-800">
                    Open support tickets
                  </p>

                  <p className="mt-0.5 text-xs text-neutral-400">
                    Active tickets requiring follow-up
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <span className="text-sm font-semibold text-neutral-950">
                  {Number(openTickets.count).toLocaleString()}
                </span>

                <ArrowRight className="h-4 w-4 text-neutral-300 transition group-hover:translate-x-0.5 group-hover:text-neutral-700" />
              </div>
            </Link>

            {/* New contacts */}

            <Link
              href="/admin/contacts"
              className="group flex items-center justify-between gap-4 p-4 transition hover:bg-neutral-50"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
                  <MessageSquareText className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-800">
                    New contact requests
                  </p>

                  <p className="mt-0.5 text-xs text-neutral-400">
                    Unreviewed project inquiries
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <span className="text-sm font-semibold text-neutral-950">
                  {Number(newContacts.count).toLocaleString()}
                </span>

                <ArrowRight className="h-4 w-4 text-neutral-300 transition group-hover:translate-x-0.5 group-hover:text-neutral-700" />
              </div>
            </Link>
          </div>

          {!hasAttention && (
            <div className="mt-4 rounded-2xl bg-neutral-50 px-4 py-3 text-sm text-neutral-500">
              Everything looks clear right now. There are no outstanding
              items requiring immediate attention.
            </div>
          )}
        </div>

        {/* Quick actions */}

        <div className="rounded-3xl bg-neutral-950 p-6 text-white shadow-sm sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
            Quick actions
          </p>

          <h2 className="mt-2 text-xl font-semibold tracking-tight">
            Manage your workspace
          </h2>

          <p className="mt-2 text-sm leading-6 text-neutral-400">
            Jump directly to the areas you use most.
          </p>

          <div className="mt-6 space-y-2">
            <QuickAction
              href="/admin/projects"
              label="Manage projects"
              icon={FolderKanban}
            />

            <QuickAction
              href="/admin/posts"
              label="Manage posts"
              icon={FileText}
            />

            <QuickAction
              href="/admin/tickets"
              label="Review support tickets"
              icon={ClipboardList}
            />

            <QuickAction
              href="/admin/contacts"
              label="Review contact requests"
              icon={MessageSquareText}
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          SYSTEM SUMMARY
      ====================================================== */}

      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
              Workspace summary
            </p>

            <h2 className="mt-2 text-xl font-semibold tracking-tight text-neutral-950">
              Your Nirdeshona workspace at a glance
            </h2>
          </div>

          <Link
            href="/admin"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-neutral-200 px-4 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 hover:text-neutral-950"
          >
            Refresh overview
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <SummaryItem
            label="Content"
            value={`${Number(postCount.count).toLocaleString()} posts`}
          />

          <SummaryItem
            label="Client work"
            value={`${Number(projectCount.count).toLocaleString()} projects`}
          />

          <SummaryItem
            label="Support"
            value={`${Number(openTickets.count).toLocaleString()} active tickets`}
          />
        </div>
      </section>
    </div>
  );
}

/* ============================================================
   QUICK ACTION
============================================================ */

function QuickAction({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{
    className?: string;
    strokeWidth?: number;
  }>;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 transition hover:border-white/15 hover:bg-white/10"
    >
      <span className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-neutral-300">
          <Icon
            className="h-4 w-4"
            strokeWidth={1.8}
          />
        </span>

        <span className="text-sm font-medium text-neutral-200">
          {label}
        </span>
      </span>

      <ArrowRight className="h-4 w-4 text-neutral-500 transition group-hover:translate-x-0.5 group-hover:text-white" />
    </Link>
  );
}

/* ============================================================
   SUMMARY ITEM
============================================================ */

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-neutral-50 p-4">
      <p className="text-xs font-medium text-neutral-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-neutral-900">
        {value}
      </p>
    </div>
  );
}