import ContactsTable from "./contacts-table";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";

export type ContactStatus = "new" | "contacted" | "closed";

export type ContactRequest = {
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

export default async function AdminContactsPage() {
  await requireAdmin();

  const contacts = (await sql`
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
    order by created_at desc
  `) as unknown as ContactRequest[];

  const stats = (await sql`
    select
      count(*)::int as total,
      count(*) filter (where status = 'new')::int as new,
      count(*) filter (where status = 'contacted')::int as contacted,
      count(*) filter (where status = 'closed')::int as closed
    from public.contact_requests
  `)[0] as {
    total: number;
    new: number;
    contacted: number;
    closed: number;
  };

  return (
    <ContactsTable
      contacts={contacts}
      stats={stats}
    />
  );
}