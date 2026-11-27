-- Shared fixed-window rate limiting for anonymous endpoints (uploads, captcha, password reset).
create table if not exists public.rate_limit_hits (
  id bigint generated always as identity primary key,
  bucket text not null,
  key text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_rate_limit_hits_lookup on public.rate_limit_hits (bucket, key, created_at desc);
alter table public.rate_limit_hits enable row level security;
revoke all on public.rate_limit_hits from anon, authenticated;
