-- ============================================================
-- Profile details (phone, company, bio) + ticket/notification indexes
-- Additive only — safe to apply on a live database.
-- ============================================================

alter table public.profiles
  add column if not exists phone text,
  add column if not exists company text,
  add column if not exists bio text;

alter table public.profiles
  drop constraint if exists profiles_full_name_length,
  add constraint profiles_full_name_length check (full_name is null or char_length(full_name) <= 100),
  drop constraint if exists profiles_bio_length,
  add constraint profiles_bio_length check (bio is null or char_length(bio) <= 500);

create index if not exists idx_ticket_messages_ticket_created
  on public.ticket_messages(ticket_id, created_at);

create index if not exists idx_support_tickets_updated
  on public.support_tickets(updated_at desc);

create index if not exists idx_client_members_user
  on public.client_members(user_id);

-- Keep updated_at fresh on profile edits
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();
