-- ============================================================
-- Post view tracking
-- One visitor can generate one view per post every 12 hours.
-- ============================================================

create table public.post_view_tracking (
  post_id uuid not null
    references public.posts(id)
    on delete cascade,

  visitor_id uuid not null,

  last_viewed_at timestamptz not null default now(),

  primary key (post_id, visitor_id)
);

create index idx_post_view_tracking_post
  on public.post_view_tracking(post_id);

alter table public.post_view_tracking enable row level security;