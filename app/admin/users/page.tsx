import Link from "next/link";
import { Ban, RotateCcw } from "lucide-react";

import ConfirmButton from "@/app/components/confirm-button";
import { getSessionUser } from "@/lib/auth/session";
import { sql } from "@/lib/db";

import { AdminHeader, Avatar, Empty, FilterTabs, Pager, SearchBox, pageParam, timeAgo } from "../admin-ui";
import { setUserBanned, setUserRole } from "./actions";
import RoleSelect from "./role-select";

export const dynamic = "force-dynamic";
const PER_PAGE = 25;

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ role?: string; q?: string; page?: string }> }) {
  const sp = await searchParams;
  const me = await getSessionUser();
  const role = ["ADMIN", "CLIENT", "USER", "SUSPENDED"].includes(sp.role ?? "") ? sp.role! : "ALL";
  const q = sp.q?.trim().slice(0, 80) || null;
  const pattern = q ? `%${q}%` : null;
  const page = pageParam(sp.page);

  const where = sql`
    (${role} = 'ALL' or (${role} = 'SUSPENDED' and p.is_banned) or p.role::text = ${role})
    and (${pattern}::text is null or p.full_name ilike ${pattern} or u.email ilike ${pattern} or p.company ilike ${pattern})
  `;

  const [rows, [{ total }], [counts]] = await Promise.all([
    sql`
      select p.id, p.full_name, p.avatar_url, p.role, p.company, p.phone, p.is_banned, p.created_at,
             u.email, u.last_sign_in_at,
             (select count(*)::int from comments c where c.user_id = p.id) as comments,
             (select string_agg(cl.name, ', ') from client_members m join clients cl on cl.id = m.client_id where m.user_id = p.id) as clients
      from profiles p left join auth.users u on u.id = p.id
      where ${where}
      order by p.created_at desc
      limit ${PER_PAGE} offset ${(page - 1) * PER_PAGE}
    `,
    sql`select count(*)::int as total from profiles p left join auth.users u on u.id = p.id where ${where}`,
    sql`
      select count(*)::int as all,
             count(*) filter (where role = 'ADMIN')::int as admin,
             count(*) filter (where role = 'CLIENT')::int as client,
             count(*) filter (where role = 'USER')::int as user,
             count(*) filter (where is_banned)::int as suspended
      from profiles
    `,
  ]);

  const href = (next: { role?: string; page?: number }) => {
    const p = new URLSearchParams();
    const r = next.role ?? role;
    if (r !== "ALL") p.set("role", r);
    if (q) p.set("q", q);
    if (next.page && next.page > 1) p.set("page", String(next.page));
    const s = p.toString();
    return s ? `/admin/users?${s}` : "/admin/users";
  };

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader title="Users" description="Everyone with an account. Change roles or suspend accounts that misbehave." />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterTabs
          active={role}
          tabs={[
            { value: "ALL", label: "All", href: href({ role: "ALL" }), count: counts.all },
            { value: "ADMIN", label: "Admins", href: href({ role: "ADMIN" }), count: counts.admin },
            { value: "CLIENT", label: "Clients", href: href({ role: "CLIENT" }), count: counts.client },
            { value: "USER", label: "Members", href: href({ role: "USER" }), count: counts.user },
            { value: "SUSPENDED", label: "Suspended", href: href({ role: "SUSPENDED" }), count: counts.suspended },
          ]}
        />
        <SearchBox action="/admin/users" defaultValue={q ?? ""} placeholder="Search name, email, organisation…" hidden={role !== "ALL" ? { role } : {}} />
      </div>

      {rows.length === 0 ? (
        <Empty>No users found.</Empty>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          <ul className="divide-y divide-neutral-100">
            {rows.map((u) => {
              const self = u.id === me?.id;
              return (
                <li key={u.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <Avatar name={u.full_name ?? u.email} url={u.avatar_url} size="h-10 w-10" />
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-neutral-950">
                        <span className="truncate">{u.full_name || "Unnamed user"}</span>
                        {self && <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-600">You</span>}
                        {u.is_banned && <span className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-600">Suspended</span>}
                      </p>
                      <p className="truncate text-xs text-neutral-500">{u.email}</p>
                      <p className="mt-0.5 truncate text-xs text-neutral-400">
                        Joined {timeAgo(u.created_at)}
                        {u.last_sign_in_at ? ` · last sign-in ${timeAgo(u.last_sign_in_at)}` : ""}
                        {` · ${u.comments} comment${u.comments === 1 ? "" : "s"}`}
                        {u.clients ? ` · ${u.clients}` : ""}
                        {u.company ? ` · ${u.company}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pl-[52px] sm:pl-0">
                    <RoleSelect action={setUserRole.bind(null, u.id)} value={u.role} disabled={self} />
                    {!self && u.role !== "ADMIN" &&
                      (u.is_banned ? (
                        <form action={setUserBanned.bind(null, u.id, false)}>
                          <button type="submit" className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-neutral-200 px-3 text-xs font-semibold text-neutral-700 hover:bg-neutral-50">
                            <RotateCcw className="h-3.5 w-3.5" /> Reinstate
                          </button>
                        </form>
                      ) : (
                        <ConfirmButton
                          action={setUserBanned.bind(null, u.id, true)}
                          title={`Suspend ${u.full_name || u.email}?`}
                          description="They'll still be able to sign in, but can't comment or react until you reinstate them."
                          confirmLabel="Suspend"
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-700 hover:bg-red-100"
                        >
                          <Ban className="h-3.5 w-3.5" /> Suspend
                        </ConfirmButton>
                      ))}
                    {u.clients && (
                      <Link href="/admin/clients" className="hidden h-8 items-center rounded-lg px-2 text-xs font-semibold text-neutral-500 hover:text-neutral-950 md:inline-flex">
                        Clients
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <Pager page={page} total={total} perPage={PER_PAGE} href={(p) => href({ page: p })} />
    </div>
  );
}
