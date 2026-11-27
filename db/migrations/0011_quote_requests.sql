-- Quote requests created by the order builder on the pricing page.
-- Server code only (RLS on, no policies, no anon/authenticated grants).

create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  user_id uuid references public.profiles(id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  organisation text,
  plan text not null check (plan in ('starter', 'business', 'custom', 'care', 'social')),
  service text,
  pages integer not null default 0,
  add_ons text[] not null default '{}',
  care_plan integer,
  estimate_low integer not null default 0,
  estimate_high integer not null default 0,
  monthly integer not null default 0,
  timeline text,
  preferred_contact text not null default 'Email',
  message text,
  locale text not null default 'bn',
  status text not null default 'new' check (status in ('new', 'contacted', 'quoted', 'accepted', 'declined')),
  admin_note text,
  ip_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_quote_requests_created on public.quote_requests (created_at desc);
create index if not exists idx_quote_requests_email on public.quote_requests (lower(email));
create index if not exists idx_quote_requests_user on public.quote_requests (user_id);

alter table public.quote_requests enable row level security;
revoke all on public.quote_requests from anon, authenticated;

-- Allow quote requests to go to the recycle bin.
alter table public.trash drop constraint if exists trash_entity_check;
alter table public.trash add constraint trash_entity_check
  check (entity in ('post', 'project', 'client', 'file', 'contact', 'comment', 'quote'));
