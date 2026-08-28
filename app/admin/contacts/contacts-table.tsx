"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock3,
  MessageSquare,
  Paperclip,
  Search,
  Users,
} from "lucide-react";

import type { ContactRequest, ContactStatus } from "./page";

type Filter = "all" | ContactStatus;

const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "closed", label: "Closed" },
];

const statusStyles: Record<ContactStatus, string> = {
  new: "border-amber-200 bg-amber-50 text-amber-700",
  contacted: "border-blue-200 bg-blue-50 text-blue-700",
  closed: "border-neutral-200 bg-neutral-100 text-neutral-600",
};

const statusDots: Record<ContactStatus, string> = {
  new: "bg-amber-500",
  contacted: "bg-blue-500",
  closed: "bg-neutral-400",
};

const statusLabels: Record<ContactStatus, string> = {
  new: "New",
  contacted: "Contacted",
  closed: "Closed",
};

export default function ContactsTable({
  contacts,
  stats,
}: {
  contacts: ContactRequest[];
  stats: {
    total: number;
    new: number;
    contacted: number;
    closed: number;
  };
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const filteredContacts = useMemo(() => {
    const q = query.trim().toLowerCase();

    return contacts.filter((contact) => {
      if (filter !== "all" && contact.status !== filter) return false;
      if (!q) return true;

      return [
        contact.name,
        contact.email,
        contact.phone,
        contact.service,
        contact.budget,
        contact.message,
        contact.preferred_contact_method,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));
    });
  }, [contacts, query, filter]);

  function clearFilters() {
    setQuery("");
    setFilter("all");
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* HEADER */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
            Admin
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-950">
            Contact requests
          </h1>

          <p className="mt-1 max-w-xl text-sm leading-6 text-neutral-500">
            Manage inquiries, follow up with prospects, and keep track of
            incoming requests.
          </p>
        </div>

        {/* AJAX SEARCH */}
        <div className="relative w-full lg:w-80">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
          />

          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search contacts..."
            aria-label="Search contacts"
            className="h-10 w-full rounded-xl border border-neutral-200 bg-white pl-10 pr-10 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10"
          />

          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-lg leading-none text-neutral-400 transition hover:text-neutral-900"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* STATS — INFORMATIONAL ONLY */}
      <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total" value={stats.total} icon={Users} />
        <StatCard label="New" value={stats.new} icon={MessageSquare} />
        <StatCard label="Contacted" value={stats.contacted} icon={Clock3} />
        <StatCard label="Closed" value={stats.closed} icon={CheckCircle2} />
      </div>

      {/* FILTERS */}
      <div className="mt-7 flex items-center justify-between gap-4 border-b border-neutral-200">
        <div className="flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {filters.map((item) => {
            const active = filter === item.value;

            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                className={`relative shrink-0 px-4 py-3 text-sm font-semibold transition ${
                  active
                    ? "text-neutral-950"
                    : "text-neutral-400 hover:text-neutral-700"
                }`}
              >
                {item.label}

                {active && (
                  <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-neutral-950" />
                )}
              </button>
            );
          })}
        </div>

        <div className="hidden items-center gap-3 sm:flex">
          <p className="shrink-0 text-xs text-neutral-400">
            {filteredContacts.length.toLocaleString()} result
            {filteredContacts.length === 1 ? "" : "s"}
          </p>

          {(query || filter !== "all") && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-semibold text-neutral-500 transition hover:text-neutral-950"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* MOBILE RESULT INFO */}
      <div className="flex items-center justify-between pt-4 sm:hidden">
        <p className="text-xs text-neutral-400">
          Showing{" "}
          <span className="font-semibold text-neutral-700">
            {filteredContacts.length}
          </span>{" "}
          {filteredContacts.length === 1 ? "request" : "requests"}
        </p>

        {(query || filter !== "all") && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-semibold text-neutral-500 transition hover:text-neutral-950"
          >
            Clear
          </button>
        )}
      </div>

      {/* RESULTS */}
      {filteredContacts.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-20 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-500">
            <MessageSquare className="h-5 w-5" />
          </div>

          <h2 className="mt-4 text-sm font-semibold text-neutral-950">
            No contact requests found
          </h2>

          <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-neutral-500">
            {query
              ? "Try a different search term or clear your search."
              : filter !== "all"
                ? `There are no ${filter} contact requests.`
                : "Contact requests will appear here when someone submits the contact form."}
          </p>

          {(query || filter !== "all") && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 inline-flex h-10 items-center rounded-xl bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* DESKTOP */}
          <div className="mt-5 hidden overflow-hidden rounded-2xl border border-neutral-200 bg-white md:block">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/70 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">
                  <th className="px-5 py-3.5">Contact</th>
                  <th className="px-4 py-3.5">Service</th>
                  <th className="px-4 py-3.5">Budget</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Submitted</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredContacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className="group border-b border-neutral-100 last:border-0 transition hover:bg-neutral-50/70"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/contacts/${contact.id}`}
                        className="flex min-w-0 items-center gap-3"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500">
                          <Users className="h-4 w-4" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-neutral-900">
                            {contact.name}
                          </p>

                          <p className="mt-0.5 truncate text-xs text-neutral-400">
                            {contact.email}
                          </p>
                        </div>
                      </Link>
                    </td>

                    <td className="max-w-40 px-4 py-4 text-sm text-neutral-600">
                      <span className="block truncate">
                        {contact.service || "—"}
                      </span>
                    </td>

                    <td className="max-w-32 px-4 py-4 text-sm text-neutral-600">
                      <span className="block truncate">
                        {contact.budget || "—"}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <StatusBadge status={contact.status} />
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-xs text-neutral-500">
                      {formatDate(contact.created_at)}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-3">
                        {contact.attachment_url && (
                          <Paperclip
                            className="h-4 w-4 text-neutral-400"
                            aria-label="Has attachment"
                          />
                        )}

                        <Link
                          href={`/admin/contacts/${contact.id}`}
                          className="text-xs font-semibold text-neutral-600 transition hover:text-neutral-950"
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE */}
          <div className="mt-5 space-y-3 md:hidden">
            {filteredContacts.map((contact) => (
              <Link
                key={contact.id}
                href={`/admin/contacts/${contact.id}`}
                className="block rounded-2xl border border-neutral-200 bg-white p-4 transition hover:border-neutral-300 hover:shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500">
                    <Users className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-neutral-950">
                          {contact.name}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-neutral-400">
                          {contact.email}
                        </p>
                      </div>

                      <StatusBadge status={contact.status} />
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-neutral-100 pt-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                      Service
                    </p>

                    <p className="mt-1 truncate text-xs font-medium text-neutral-700">
                      {contact.service || "Not specified"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                      Submitted
                    </p>

                    <p className="mt-1 truncate text-xs font-medium text-neutral-700">
                      {formatDate(contact.created_at)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3 text-xs text-neutral-400">
                  <span className="truncate">
                    {contact.preferred_contact_method
                      ? `Prefers ${contact.preferred_contact_method}`
                      : "Contact method not specified"}
                  </span>

                  {contact.attachment_url && (
                    <span className="inline-flex shrink-0 items-center gap-1">
                      <Paperclip className="h-3.5 w-3.5" />
                      Attachment
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Users;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-[0.1em] text-neutral-400">
          {label}
        </span>

        <Icon className="h-4 w-4 text-neutral-400" />
      </div>

      <p className="mt-3 text-2xl font-bold tracking-tight text-neutral-950">
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: ContactStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusStyles[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${statusDots[status]}`} />
      {statusLabels[status]}
    </span>
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}