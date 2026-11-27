-- Daily view counter per post, so the admin can see views over time.
-- (post_view_tracking keeps only each visitor's latest view.)
create table if not exists public.post_views_daily (
  post_id uuid not null references public.posts(id) on delete cascade,
  day date not null,
  views integer not null default 0,
  primary key (post_id, day)
);
create index if not exists idx_post_views_daily_day on public.post_views_daily (day);
alter table public.post_views_daily enable row level security;
revoke all on public.post_views_daily from anon, authenticated;

-- Seed history from what is already known: each visitor's last view.
insert into public.post_views_daily (post_id, day, views)
select post_id, (last_viewed_at at time zone 'Asia/Dhaka')::date, count(*)::int
from public.post_view_tracking
group by 1, 2
on conflict (post_id, day) do nothing;
