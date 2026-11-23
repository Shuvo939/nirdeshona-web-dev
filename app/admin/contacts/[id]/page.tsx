import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  Mail,
  MessageSquare,
  Paperclip,
  Phone,
  User,
} from "lucide-react";

import { sql } from "@/lib/db";
import { StatusSelector } from "../status-selector";
import { DeleteContactButton } from "../delete-contact-button";
import { requireAdmin } from "@/lib/auth/require-admin";

type ContactStatus = "new" | "contacted" | "closed";

type ContactRequest = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  service: string | null;
  budget: string | null;
  message: string | null;
  attachment_url: string | null;
  preferred_contact_method: string | null;
  status: ContactStatus;
  created_at: string;
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
}

function isImageUrl(url: string) {
  return /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(url);
}

export default async function AdminContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;

  const rows = (await sql`
    select
      id,
      name,
      email,
      phone,
      service,
      budget,
      message,
      attachment_url,
      preferred_contact_method,
      status,
      created_at
    from public.contact_requests
    where id = ${id}
    limit 1
  `) as unknown as ContactRequest[];

  const contact = rows[0];

  if (!contact) notFound();

  // Private attachments are served through an admin-only signed-URL route.
  const attachmentHref = contact.attachment_url
    ? contact.attachment_url.startsWith("private:")
      ? `/api/admin/contact-attachments/${contact.id}`
      : contact.attachment_url
    : null;

  return (
    <div className="mx-auto max-w-4xl">
      {/* BACK */}
      <Link
        href="/admin/contacts"
        className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition hover:text-neutral-950"
      >
        <ArrowLeft className="h-4 w-4" />
        All contact requests
      </Link>

      {/* HEADER */}
      <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-500">
            <User className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
              Contact request
            </p>

            <h1 className="mt-1 truncate text-2xl font-bold tracking-tight text-neutral-950">
              {contact.name}
            </h1>

            <p className="mt-1 text-sm text-neutral-500">
              Submitted {formatDate(contact.created_at)}
            </p>
          </div>
        </div>

        <StatusSelector
          id={contact.id}
          currentStatus={contact.status}
        />
      </div>

      {/* QUICK ACTIONS */}
      <div className="mt-6 flex flex-wrap gap-2">
        <a
          href={`mailto:${contact.email}`}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800"
        >
          <Mail className="h-4 w-4" />
          Email
        </a>

        {contact.phone && (
          <a
            href={`tel:${contact.phone}`}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-950"
          >
            <Phone className="h-4 w-4" />
            Call
          </a>
        )}

        {contact.phone && (
          <a
            href={`https://wa.me/${contact.phone.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-950"
          >
            <MessageSquare className="h-4 w-4" />
            WhatsApp
            <ExternalLink className="h-3.5 w-3.5 text-neutral-400" />
          </a>
        )}
      </div>

      {/* MAIN CARD */}
      <div className="mt-6 overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
        {/* CONTACT */}
        <section className="border-b border-neutral-200 p-6 sm:p-8">
          <SectionTitle title="Contact information" />

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Info
              label="Name"
              value={contact.name}
            />

            <Info
              label="Email"
              value={contact.email}
              href={`mailto:${contact.email}`}
            />

            <Info
              label="Phone"
              value={contact.phone || "Not provided"}
              href={contact.phone ? `tel:${contact.phone}` : undefined}
            />

            <Info
              label="Preferred contact"
              value={contact.preferred_contact_method || "Not specified"}
            />
          </div>
        </section>

        {/* PROJECT */}
        <section className="border-b border-neutral-200 p-6 sm:p-8">
          <SectionTitle title="Project details" />

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Info
              label="Service"
              value={contact.service || "Not specified"}
            />

            <Info
              label="Budget"
              value={contact.budget || "Not specified"}
            />
          </div>
        </section>

        {/* MESSAGE */}
        <section className="border-b border-neutral-200 p-6 sm:p-8">
          <SectionTitle title="Message" />

          <div className="mt-5 rounded-2xl bg-neutral-50 p-5">
            <p className="whitespace-pre-wrap text-sm leading-7 text-neutral-700">
              {contact.message || "No message was provided."}
            </p>
          </div>
        </section>

        {/* ATTACHMENT */}
        {attachmentHref && (
          <section className="border-b border-neutral-200 p-6 sm:p-8">
            <SectionTitle title="Attachment" />

            {isImageUrl(contact.attachment_url!) ? (
              <a
                href={attachmentHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 block max-w-md overflow-hidden rounded-2xl border border-neutral-200 transition hover:border-neutral-400"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={attachmentHref}
                  alt="Contact attachment"
                  className="max-h-96 w-full object-contain bg-neutral-50"
                />
              </a>
            ) : (
              <a
                href={attachmentHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-950"
              >
                <Paperclip className="h-4 w-4" />
                View attachment
                <ExternalLink className="h-3.5 w-3.5 text-neutral-400" />
              </a>
            )}
          </section>
        )}

        {/* FOOTER */}
        <div className="flex flex-col gap-4 bg-neutral-50/70 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">
              Request ID
            </p>

            <p className="mt-1 break-all text-xs text-neutral-500">
              {contact.id}
            </p>
          </div>

          <DeleteContactButton id={contact.id} />
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <h2 className="text-sm font-semibold text-neutral-950">
      {title}
    </h2>
  );
}

function Info({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">
        {label}
      </p>

      {href ? (
        <a
          href={href}
          className="mt-1.5 block text-sm font-medium text-neutral-800 transition hover:text-neutral-950 hover:underline"
        >
          {value}
        </a>
      ) : (
        <p className="mt-1.5 text-sm font-medium text-neutral-800">
          {value}
        </p>
      )}
    </div>
  );
}