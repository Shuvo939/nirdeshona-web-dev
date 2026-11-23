-- ============================================================
-- Facebook-style reactions on comments (one per user per comment) and a
-- one-time-use registry for the custom captcha. Server-only tables.
-- ============================================================
alter table public.comment_likes add column if not exists reaction_type text not null default 'like';
alter table public.comment_likes drop constraint if exists comment_likes_reaction_type_check;
alter table public.comment_likes add constraint comment_likes_reaction_type_check
  check (reaction_type in ('like', 'love', 'helpful', 'celebrate', 'wow', 'sad'));

create table if not exists public.captcha_used (
  jti text primary key,
  used_at timestamptz not null default now()
);
create index if not exists idx_captcha_used_at on public.captcha_used(used_at);
alter table public.captcha_used enable row level security;
revoke all on public.captcha_used from anon, authenticated;
