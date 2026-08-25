# Nirdeshona Web — Starter

Stack: Next.js 16 (App Router) + TypeScript + Tailwind + Supabase (Postgres + Auth + Storage) + raw SQL (no ORM) + Resend + Crisp + Cloudflare + Vercel.

## 1. Install dependencies

```bash
npm install
```

## 2. Create a Supabase project

1. Go to https://supabase.com → New Project (free tier).
2. Project Settings → API → copy `Project URL` and `anon public` key.
3. Project Settings → Database → Connection string → copy the **Session pooler** URI (this works reliably from Vercel's serverless functions).
4. Copy `.env.example` to `.env.local` and fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `DATABASE_URL`.

## 3. Run the schema migration

```bash
npm run db:migrate
```

This applies `db/migrations/0001_init.sql`, which creates every table (clients, projects, posts, comments, reactions, support tickets, contact requests, notifications, files) plus Row Level Security policies for the client portal.

To add more tables/columns later, add a new file like `db/migrations/0002_xyz.sql` and re-run `npm run db:migrate` — it only applies files it hasn't seen before.

## 4. Set your first admin user

After you sign up once through `/login` (or Supabase Dashboard → Authentication → Add user), promote yourself to admin:

```sql
update public.profiles set role = 'ADMIN' where id = '<your-user-id>';
```

## 5. Create a client + link a user

```sql
insert into public.clients (name, slug, contact_email)
values ('INS org', 'ins-org', 'contact@ins.org')
returning id;

insert into public.client_members (client_id, user_id)
values ('<client-id-from-above>', '<user-id>');
```

## 6. Local development

```bash
npm run dev
```

Visit http://localhost:3000.

## 7. Deploy

- Push this repo to GitHub.
- Import it into Vercel (free Hobby plan works for this scale) and add the same environment variables from `.env.local`.
- Point your domain's DNS through Cloudflare (free plan) for CDN + WAF + Turnstile, then add `web.nirdeshona.com` as a custom domain in Vercel.

## What's included vs. what's a next step

**Included (working end-to-end):** homepage pulling featured projects, contact form → DB + email, login via Supabase Auth, client dashboard showing that client's projects and tickets (RLS-scoped), ticket creation API.

**Structure ready, needs UI/logic filled in:** `/services`, `/projects/[slug]`, `/blog`, `/admin`, comments + reactions UI, notifications UI, file upload to Supabase Storage for ticket attachments, Crisp widget embed, Turnstile on the contact form.

## Why no ORM

All queries go through `lib/db/index.ts`, a single `postgres` (npm) client. Tagged-template queries like `` sql`select * from posts where id = ${id}` `` are parameterized automatically — safe from SQL injection without needing an ORM layer. Migrations are plain `.sql` files run by `db/run-migrations.mjs`.
