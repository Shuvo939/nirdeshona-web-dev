-- A–Z feature list for each project's case-study page (Markdown:
-- "## Group" headings with "- **Feature** — description" lines).
alter table public.projects add column if not exists features text;
alter table public.projects add column if not exists features_bn text;
