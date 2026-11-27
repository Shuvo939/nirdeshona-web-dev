-- Defence in depth: the app talks to Postgres only from the server, never
-- through the public (anon/authenticated) API keys. RLS already blocks those
-- roles, but they shouldn't hold write privileges at all.
revoke insert, update, delete, truncate, references, trigger
  on all tables in schema public from anon, authenticated;
revoke usage, update on all sequences in schema public from anon, authenticated;

-- New tables created later start with no write access for these roles either.
alter default privileges in schema public
  revoke insert, update, delete, truncate, references, trigger on tables from anon, authenticated;
alter default privileges in schema public
  revoke usage, update on sequences from anon, authenticated;
