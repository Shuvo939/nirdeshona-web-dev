-- ============================================================
-- nirdeshona-web — initial schema
-- Run this in the Supabase SQL editor, or via db:migrate script.
-- Auth users live in Supabase's built-in `auth.users` table.
-- `public.profiles` extends that with our own fields + role.
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- Roles / Profiles ----------
create type user_role as enum ('ADMIN', 'CLIENT', 'USER');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role user_role not null default 'USER',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------- Clients ----------
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  contact_email text,
  contact_phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Which users belong to which client (a client can have multiple users)
create table public.client_members (
  client_id uuid not null references public.clients(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (client_id, user_id)
);

-- ---------- Projects / Portfolio ----------
create type project_status as enum ('PLANNED', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'ON_HOLD');

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete set null,
  slug text not null unique,
  title text not null,
  short_description text,
  description text,
  category text,
  status project_status not null default 'PLANNED',
  progress_percent int not null default 0 check (progress_percent between 0 and 100),
  featured boolean not null default false,
  cover_image_url text,
  live_url text,
  repository_url text,
  started_at date,
  completed_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_media (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  file_url text not null,
  file_key text,
  caption text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.technologies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table public.project_technologies (
  project_id uuid not null references public.projects(id) on delete cascade,
  technology_id uuid not null references public.technologies(id) on delete cascade,
  primary key (project_id, technology_id)
);

-- ---------- Blog / Posts ----------
create table public.post_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete set null,
  category_id uuid references public.post_categories(id) on delete set null,
  slug text not null unique,
  title text not null,
  excerpt text,
  content text not null,
  cover_image_url text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  seo_title text,
  seo_description text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique
);

create table public.post_tags (
  post_id uuid not null references public.posts(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

-- ---------- Comments ----------
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete cascade,
  content text not null,
  status text not null default 'visible' check (status in ('visible', 'hidden', 'pending')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Reactions ----------
create table public.post_reactions (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reaction_type text not null check (reaction_type in ('like', 'love', 'helpful')),
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

-- ---------- Views (simple aggregated counter for V1) ----------
alter table public.posts add column views_count bigint not null default 0;

create function public.increment_post_views(post_id_in uuid)
returns void as $$
  update public.posts set views_count = views_count + 1 where id = post_id_in;
$$ language sql security definer;

-- ---------- Support Tickets ----------
create type ticket_status as enum ('OPEN', 'IN_PROGRESS', 'WAITING_FOR_CLIENT', 'RESOLVED', 'CLOSED');
create type ticket_priority as enum ('LOW', 'NORMAL', 'HIGH', 'URGENT');

create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_number serial unique,
  client_id uuid not null references public.clients(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  created_by uuid not null references public.profiles(id),
  subject text not null,
  status ticket_status not null default 'OPEN',
  priority ticket_priority not null default 'NORMAL',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  sender_id uuid not null references public.profiles(id),
  message text not null,
  created_at timestamptz not null default now()
);

create table public.ticket_attachments (
  id uuid primary key default gen_random_uuid(),
  ticket_message_id uuid not null references public.ticket_messages(id) on delete cascade,
  file_url text not null,
  file_key text not null,
  file_name text not null,
  file_size bigint,
  mime_type text,
  created_at timestamptz not null default now()
);

-- ---------- Contact requests ----------
create table public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  service text,
  budget text,
  message text,
  attachment_url text,
  preferred_contact_method text,
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at timestamptz not null default now()
);

-- ---------- Notifications ----------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  message text,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- Files (generic metadata table for R2/Supabase Storage objects) ----------
create table public.files (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null,
  file_url text not null,
  file_key text not null,
  file_name text not null,
  file_size bigint,
  mime_type text,
  created_at timestamptz not null default now()
);

-- ---------- Site settings ----------
create table public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- ---------- Indexes ----------
create index idx_projects_client on public.projects(client_id);
create index idx_posts_status on public.posts(status, published_at desc);
create index idx_comments_post on public.comments(post_id);
create index idx_tickets_client on public.support_tickets(client_id, status);
create index idx_ticket_messages_ticket on public.ticket_messages(ticket_id);
create index idx_notifications_user on public.notifications(user_id, read_at);

-- ---------- Row Level Security ----------
alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.client_members enable row level security;
alter table public.projects enable row level security;
alter table public.support_tickets enable row level security;
alter table public.ticket_messages enable row level security;
alter table public.ticket_attachments enable row level security;
alter table public.notifications enable row level security;
alter table public.comments enable row level security;
alter table public.post_reactions enable row level security;

-- Public read for posts/projects handled at the app layer (raw SQL, service role) —
-- these RLS policies protect the client-portal data specifically.

create policy "Users see own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Client members see their client" on public.clients
  for select using (
    exists (select 1 from public.client_members cm where cm.client_id = clients.id and cm.user_id = auth.uid())
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN')
  );

create policy "Client members see own projects" on public.projects
  for select using (
    client_id is null
    or exists (select 1 from public.client_members cm where cm.client_id = projects.client_id and cm.user_id = auth.uid())
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN')
  );

create policy "Client members see own tickets" on public.support_tickets
  for select using (
    exists (select 1 from public.client_members cm where cm.client_id = support_tickets.client_id and cm.user_id = auth.uid())
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN')
  );

create policy "Client members create own tickets" on public.support_tickets
  for insert with check (
    exists (select 1 from public.client_members cm where cm.client_id = support_tickets.client_id and cm.user_id = auth.uid())
  );

create policy "Ticket participants see messages" on public.ticket_messages
  for select using (
    exists (
      select 1 from public.support_tickets t
      join public.client_members cm on cm.client_id = t.client_id
      where t.id = ticket_messages.ticket_id and cm.user_id = auth.uid()
    )
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'ADMIN')
  );

create policy "Users see own notifications" on public.notifications
  for select using (auth.uid() = user_id);

create policy "Anyone can read visible comments" on public.comments
  for select using (status = 'visible');

create policy "Logged in users can comment" on public.comments
  for insert with check (auth.uid() = user_id);

create policy "Logged in users can react" on public.post_reactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
