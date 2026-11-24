-- ============================================================
-- Recycle bin: deleted records are moved here as JSON snapshots (with their
-- child rows) for 30 days, then purged. Server-only.
-- Client access: users whose verified email matches a client's contact email
-- are linked automatically; an admin removal is remembered so they aren't
-- re-linked. Server-only.
-- ============================================================
create table if not exists public.trash (
  id uuid primary key default gen_random_uuid(),
  entity text not null check (entity in ('post', 'project', 'client', 'file', 'contact', 'comment')),
  entity_id uuid not null,
  label text not null,
  data jsonb not null,
  r2_keys text[] not null default '{}',
  r2_private_keys text[] not null default '{}',
  deleted_by uuid references public.profiles(id) on delete set null,
  deleted_at timestamptz not null default now(),
  purge_after timestamptz not null default now() + interval '30 days'
);
create index if not exists idx_trash_deleted_at on public.trash(deleted_at desc);
create index if not exists idx_trash_purge_after on public.trash(purge_after);
alter table public.trash enable row level security;
revoke all on public.trash from anon, authenticated;

create table if not exists public.client_member_blocks (
  client_id uuid not null references public.clients(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (client_id, user_id)
);
alter table public.client_member_blocks enable row level security;
revoke all on public.client_member_blocks from anon, authenticated;

create index if not exists idx_clients_contact_email on public.clients (lower(contact_email));
