-- ============================================================
-- Facebook-style comments, richer reactions, moderation, user
-- management and an admin activity log. Additive only.
-- All new tables are server-only: RLS on, no policies, and no
-- grants for anon/authenticated (the app talks to Postgres directly).
-- ============================================================

-- ---------- Post reactions: more types ----------
alter table public.post_reactions drop constraint if exists post_reactions_reaction_type_check;
alter table public.post_reactions
  add constraint post_reactions_reaction_type_check
  check (reaction_type in ('like', 'love', 'helpful', 'celebrate', 'wow', 'sad'));

-- ---------- Comments: edit tracking ----------
alter table public.comments add column if not exists edited_at timestamptz;
alter table public.comments drop constraint if exists comments_content_length;
alter table public.comments add constraint comments_content_length check (char_length(content) between 1 and 3000);
create index if not exists idx_comments_post_created on public.comments(post_id, created_at);
create index if not exists idx_comments_user on public.comments(user_id, created_at desc);
create index if not exists idx_comments_parent on public.comments(parent_id);

-- ---------- Comment likes ----------
create table if not exists public.comment_likes (
  comment_id uuid not null references public.comments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id)
);
create index if not exists idx_comment_likes_user on public.comment_likes(user_id);

-- ---------- Comment reports ----------
create table if not exists public.comment_reports (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.comments(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null check (char_length(reason) between 1 and 300),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  unique (comment_id, reporter_id)
);
create index if not exists idx_comment_reports_open on public.comment_reports(created_at desc) where resolved_at is null;

-- ---------- Users: suspension ----------
alter table public.profiles add column if not exists is_banned boolean not null default false;
alter table public.profiles add column if not exists last_seen_at timestamptz;

-- ---------- Activity log ----------
create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity text not null,
  entity_id text,
  summary text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_activity_log_created on public.activity_log(created_at desc);

-- ---------- Lock new tables down ----------
alter table public.comment_likes enable row level security;
alter table public.comment_reports enable row level security;
alter table public.activity_log enable row level security;
revoke all on public.comment_likes, public.comment_reports, public.activity_log from anon, authenticated;
