import { FileText, Film, Trash2 } from "lucide-react";

import ConfirmButton from "@/app/components/confirm-button";
import { sql } from "@/lib/db";
import { formatBytes } from "@/lib/tickets/attachments";

import { AdminHeader, Empty, FilterTabs, Pager, SearchBox, pageParam, timeAgo } from "../admin-ui";
import { deleteMedia } from "./actions";
import CopyButton from "./copy-button";
import MediaUploader from "./media-uploader";

export const dynamic = "force-dynamic";
const PER_PAGE = 24;

export default async function AdminMediaPage({ searchParams }: { searchParams: Promise<{ type?: string; q?: string; page?: string }> }) {
  const sp = await searchParams;
  const type = ["image", "document", "video"].includes(sp.type ?? "") ? sp.type! : "all";
  const q = sp.q?.trim().slice(0, 80) || null;
  const pattern = q ? `%${q}%` : null;
  const page = pageParam(sp.page);

  const where = sql`
    (${type} = 'all'
      or (${type} = 'image' and f.mime_type like 'image/%')
      or (${type} = 'video' and f.mime_type like 'video/%')
      or (${type} = 'document' and f.mime_type not like 'image/%' and f.mime_type not like 'video/%'))
    and (${pattern}::text is null or f.file_name ilike ${pattern})
  `;

  const [files, [{ total }], [stats]] = await Promise.all([
    sql`
      select f.id, f.file_url, f.file_name, f.file_size, f.mime_type, f.created_at, p.full_name as owner
      from files f left join profiles p on p.id = f.owner_id
      where ${where}
      order by f.created_at desc
      limit ${PER_PAGE} offset ${(page - 1) * PER_PAGE}
    `,
    sql`select count(*)::int as total from files f where ${where}`,
    sql`
      select count(*)::int as all,
             count(*) filter (where mime_type like 'image/%')::int as images,
             count(*) filter (where mime_type like 'video/%')::int as videos,
             count(*) filter (where mime_type not like 'image/%' and mime_type not like 'video/%')::int as documents,
             coalesce(sum(file_size), 0)::bigint as bytes
      from files
    `,
  ]);

  const href = (next: { type?: string; page?: number }) => {
    const p = new URLSearchParams();
    const t = next.type ?? type;
    if (t !== "all") p.set("type", t);
    if (q) p.set("q", q);
    if (next.page && next.page > 1) p.set("page", String(next.page));
    const s = p.toString();
    return s ? `/admin/media?${s}` : "/admin/media";
  };

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader title="Media library" description={`Files stored on Cloudflare R2 · ${formatBytes(Number(stats.bytes))} used`} />
      <MediaUploader />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterTabs
          active={type}
          tabs={[
            { value: "all", label: "All", href: href({ type: "all" }), count: stats.all },
            { value: "image", label: "Images", href: href({ type: "image" }), count: stats.images },
            { value: "document", label: "Documents", href: href({ type: "document" }), count: stats.documents },
            { value: "video", label: "Videos", href: href({ type: "video" }), count: stats.videos },
          ]}
        />
        <SearchBox action="/admin/media" defaultValue={q ?? ""} placeholder="Search file names…" hidden={type !== "all" ? { type } : {}} />
      </div>

      {files.length === 0 ? (
        <Empty>No files yet. Upload images for posts, projects and pages above.</Empty>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {files.map((f) => (
            <li key={f.id} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
              <a href={f.file_url} target="_blank" rel="noreferrer" className="block aspect-[4/3] bg-[repeating-conic-gradient(#f5f5f5_0%_25%,#fff_0%_50%)] bg-[length:20px_20px]">
                {String(f.mime_type).startsWith("image/") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={f.file_url} alt={f.file_name} loading="lazy" className="h-full w-full object-contain" />
                ) : (
                  <span className="flex h-full items-center justify-center bg-neutral-50">
                    {String(f.mime_type).startsWith("video/") ? <Film className="h-10 w-10 text-neutral-300" /> : <FileText className="h-10 w-10 text-neutral-300" />}
                  </span>
                )}
              </a>
              <div className="p-3">
                <p className="truncate text-sm font-medium text-neutral-900" title={f.file_name}>{f.file_name}</p>
                <p className="mt-0.5 truncate text-xs text-neutral-500">
                  {formatBytes(Number(f.file_size ?? 0))} · {timeAgo(f.created_at)}{f.owner ? ` · ${f.owner}` : ""}
                </p>
                <div className="mt-3 flex gap-2">
                  <CopyButton value={f.file_url} />
                  <ConfirmButton
                    action={deleteMedia.bind(null, f.id)}
                    title="Delete this file?"
                    description="It will be removed from R2. Any page that still uses this URL will show a broken image."
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </ConfirmButton>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Pager page={page} total={total} perPage={PER_PAGE} href={(p) => href({ page: p })} />
    </div>
  );
}
