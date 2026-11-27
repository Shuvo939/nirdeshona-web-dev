-- Emails an admin sends to a client from a quote request, kept as a history.
create table if not exists public.quote_messages (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quote_requests(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete set null,
  subject text not null,
  body text not null,
  status text not null default 'sent' check (status in ('sent', 'failed')),
  error text,
  provider_id text,
  created_at timestamptz not null default now()
);
create index if not exists idx_quote_messages_quote on public.quote_messages (quote_id, created_at desc);
alter table public.quote_messages enable row level security;
revoke all on public.quote_messages from anon, authenticated;
