-- ============================================================
-- Contact form abuse protection: remember a salted hash of the sender's
-- IP (never the raw IP) so we can rate-limit per IP and per email.
-- ============================================================
alter table public.contact_requests add column if not exists ip_hash text;
create index if not exists idx_contact_requests_ip_created on public.contact_requests(ip_hash, created_at desc);
create index if not exists idx_contact_requests_email_created on public.contact_requests(lower(email), created_at desc);
