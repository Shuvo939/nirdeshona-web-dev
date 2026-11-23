-- ============================================================
-- All writes go through server code (server actions / route handlers),
-- which enforces bans, rate limits, published-post checks and
-- notifications. These policies let a signed-in user bypass all of
-- that by writing straight to the Supabase REST API, so remove them.
-- Read policies are kept.
-- ============================================================
drop policy if exists "Logged in users can comment" on public.comments;
drop policy if exists "Logged in users can react" on public.post_reactions;
drop policy if exists "Client members create own tickets" on public.support_tickets;

-- Belt and braces: no direct writes from the public API roles.
revoke insert, update, delete on public.comments, public.post_reactions, public.support_tickets,
  public.ticket_messages, public.notifications, public.profiles from anon, authenticated;
