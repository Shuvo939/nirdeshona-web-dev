-- ============================================================
-- Security: SECURITY DEFINER functions must not be callable through
-- the public REST API (/rest/v1/rpc/*). The app calls the database
-- server-side only, so revoke execute from anon/authenticated and
-- pin search_path (Supabase advisors 0011, 0028, 0029).
-- ============================================================


create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create or replace function public.increment_post_views(post_id_in uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.posts set views_count = views_count + 1 where id = post_id_in;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.increment_post_views(uuid) from public, anon, authenticated;

do $$
begin
  if exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
             where n.nspname = 'public' and p.proname = 'rls_auto_enable') then
    execute 'revoke execute on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end $$;
