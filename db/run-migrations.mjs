// Minimal, ORM-free migration runner.
// Reads every .sql file in db/migrations (in filename order) and runs
// any that haven't been applied yet, tracked in a `_migrations` table.
//
// Usage: npm run db:migrate
// Requires DATABASE_URL in .env.local (Supabase connection string,
// "Session pooler" or direct connection — see README).

import "dotenv/config";
import postgres from "postgres";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(__dirname, "migrations");

if (!process.env.DATABASE_URL) {
  console.error("Missing DATABASE_URL in .env.local");
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL, { max: 1 });

async function main() {
  await sql`
    create table if not exists public._migrations (
      name text primary key,
      applied_at timestamptz not null default now()
    )
  `;

  const applied = new Set(
    (await sql`select name from public._migrations`).map((r) => r.name)
  );

  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`skip  ${file} (already applied)`);
      continue;
    }
    console.log(`apply ${file}`);
    const content = readFileSync(path.join(migrationsDir, file), "utf8");
    await sql.unsafe(content);
    await sql`insert into public._migrations (name) values (${file})`;
  }

  console.log("Done.");
  await sql.end();
}

main().catch(async (err) => {
  console.error(err);
  await sql.end();
  process.exit(1);
});
