-- ============================================================
-- Bangla versions of database content. The existing columns hold English;
-- the *_bn columns hold Bangla. Each language falls back to the other when
-- its own text is empty.
-- ============================================================
alter table public.posts
  add column if not exists title_bn text,
  add column if not exists excerpt_bn text,
  add column if not exists content_bn text,
  add column if not exists seo_title_bn text,
  add column if not exists seo_description_bn text;

alter table public.projects
  add column if not exists title_bn text,
  add column if not exists short_description_bn text,
  add column if not exists description_bn text;

alter table public.post_categories add column if not exists name_bn text;
alter table public.tags add column if not exists name_bn text;
