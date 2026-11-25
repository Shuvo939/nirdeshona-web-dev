import "server-only";

import type { TransactionSql } from "postgres";

import { sql } from "@/lib/db";
import { deleteFromR2, deletePrivateObject, hasR2 } from "@/lib/r2";

/*
 * Recycle bin.
 *
 * Deleting moves a record — with every child row that would otherwise be
 * lost (tags, comments, reactions, tickets…) — into `trash` as a JSON
 * snapshot, and removes it from the live tables, so nothing else in the app
 * has to know about deleted rows. Restoring puts the rows back. Files in R2
 * stay until the item is purged: after 30 days, or when an admin deletes it
 * forever.
 */

export type TrashEntity = "post" | "project" | "client" | "file" | "contact" | "comment" | "quote";

export const TRASH_LABELS: Record<TrashEntity, string> = {
  post: "Blog post",
  project: "Project",
  client: "Client",
  file: "Media file",
  contact: "Contact request",
  comment: "Comment",
  quote: "Quote request",
};

type Snapshot = Record<string, unknown[]>;

const rows = async (q: Promise<unknown>) => ((await q) as { rows: unknown[] }[])[0]?.rows ?? [];

async function snapshot(tx: TransactionSql, entity: TrashEntity, id: string) {
  const data: Snapshot = {};
  let label = "";
  let r2: string[] = [];
  let r2Private: string[] = [];
  let extra: Record<string, unknown> = {};

  switch (entity) {
    case "post": {
      const [post] = await tx`select title from posts where id = ${id}`;
      if (!post) return null;
      label = post.title;
      data.posts = await rows(tx`select coalesce(jsonb_agg(to_jsonb(t)), '[]') as rows from posts t where id = ${id}`);
      data.post_tags = await rows(tx`select coalesce(jsonb_agg(to_jsonb(t)), '[]') as rows from post_tags t where post_id = ${id}`);
      data.post_reactions = await rows(tx`select coalesce(jsonb_agg(to_jsonb(t)), '[]') as rows from post_reactions t where post_id = ${id}`);
      data.post_view_tracking = await rows(tx`select coalesce(jsonb_agg(to_jsonb(t)), '[]') as rows from post_view_tracking t where post_id = ${id}`);
      data.comments = await rows(tx`select coalesce(jsonb_agg(to_jsonb(t)), '[]') as rows from comments t where post_id = ${id}`);
      data.comment_likes = await rows(tx`select coalesce(jsonb_agg(to_jsonb(t)), '[]') as rows from comment_likes t where comment_id in (select id from comments where post_id = ${id})`);
      data.comment_reports = await rows(tx`select coalesce(jsonb_agg(to_jsonb(t)), '[]') as rows from comment_reports t where comment_id in (select id from comments where post_id = ${id})`);
      await tx`delete from posts where id = ${id}`;
      break;
    }
    case "comment": {
      const [comment] = await tx`select c.content, p.title from comments c join posts p on p.id = c.post_id where c.id = ${id}`;
      if (!comment) return null;
      label = `“${String(comment.content).slice(0, 60)}” on ${comment.title}`;
      const tree = tx`
        with recursive tree as (
          select id from comments where id = ${id}
          union all select c.id from comments c join tree on c.parent_id = tree.id
        ) select id from tree`;
      const ids = ((await tree) as unknown as { id: string }[]).map((r) => r.id);
      data.comments = await rows(tx`select coalesce(jsonb_agg(to_jsonb(t)), '[]') as rows from comments t where id = any(${ids})`);
      data.comment_likes = await rows(tx`select coalesce(jsonb_agg(to_jsonb(t)), '[]') as rows from comment_likes t where comment_id = any(${ids})`);
      data.comment_reports = await rows(tx`select coalesce(jsonb_agg(to_jsonb(t)), '[]') as rows from comment_reports t where comment_id = any(${ids})`);
      await tx`delete from comments where id = ${id}`;
      break;
    }
    case "project": {
      const [project] = await tx`select title from projects where id = ${id}`;
      if (!project) return null;
      label = project.title;
      data.projects = await rows(tx`select coalesce(jsonb_agg(to_jsonb(t)), '[]') as rows from projects t where id = ${id}`);
      data.project_media = await rows(tx`select coalesce(jsonb_agg(to_jsonb(t)), '[]') as rows from project_media t where project_id = ${id}`);
      data.project_technologies = await rows(tx`select coalesce(jsonb_agg(to_jsonb(t)), '[]') as rows from project_technologies t where project_id = ${id}`);
      const tickets = (await tx`select id from support_tickets where project_id = ${id}`) as unknown as { id: string }[];
      extra = { ticket_ids: tickets.map((t) => t.id) };
      const media = (await tx`select file_key from project_media where project_id = ${id} and file_key is not null`) as unknown as { file_key: string }[];
      r2 = media.map((m) => m.file_key);
      await tx`delete from projects where id = ${id}`;
      break;
    }
    case "client": {
      const [client] = await tx`select name from clients where id = ${id}`;
      if (!client) return null;
      label = client.name;
      data.clients = await rows(tx`select coalesce(jsonb_agg(to_jsonb(t)), '[]') as rows from clients t where id = ${id}`);
      data.client_members = await rows(tx`select coalesce(jsonb_agg(to_jsonb(t)), '[]') as rows from client_members t where client_id = ${id}`);
      data.client_member_blocks = await rows(tx`select coalesce(jsonb_agg(to_jsonb(t)), '[]') as rows from client_member_blocks t where client_id = ${id}`);
      data.support_tickets = await rows(tx`select coalesce(jsonb_agg(to_jsonb(t)), '[]') as rows from support_tickets t where client_id = ${id}`);
      data.ticket_messages = await rows(tx`select coalesce(jsonb_agg(to_jsonb(t)), '[]') as rows from ticket_messages t where ticket_id in (select id from support_tickets where client_id = ${id})`);
      data.ticket_attachments = await rows(tx`
        select coalesce(jsonb_agg(to_jsonb(t)), '[]') as rows from ticket_attachments t
        where ticket_message_id in (select m.id from ticket_messages m join support_tickets s on s.id = m.ticket_id where s.client_id = ${id})`);
      const projects = (await tx`select id from projects where client_id = ${id}`) as unknown as { id: string }[];
      extra = { project_ids: projects.map((p) => p.id) };
      r2Private = (data.ticket_attachments as { file_key: string | null }[]).map((a) => a.file_key).filter(Boolean) as string[];
      await tx`delete from clients where id = ${id}`;
      break;
    }
    case "file": {
      const [file] = await tx`select file_name, file_key from files where id = ${id}`;
      if (!file) return null;
      label = file.file_name;
      data.files = await rows(tx`select coalesce(jsonb_agg(to_jsonb(t)), '[]') as rows from files t where id = ${id}`);
      r2 = file.file_key ? [file.file_key] : [];
      await tx`delete from files where id = ${id}`;
      break;
    }
    case "contact": {
      const [contact] = await tx`select name, email, attachment_url from contact_requests where id = ${id}`;
      if (!contact) return null;
      label = `${contact.name} <${contact.email}>`;
      data.contact_requests = await rows(tx`select coalesce(jsonb_agg(to_jsonb(t)), '[]') as rows from contact_requests t where id = ${id}`);
      const url = String(contact.attachment_url ?? "");
      if (url.startsWith("private:")) r2Private = [url.slice("private:".length)];
      await tx`delete from contact_requests where id = ${id}`;
      break;
    }
    case "quote": {
      const [quote] = await tx`select name, reference from quote_requests where id = ${id}`;
      if (!quote) return null;
      label = `${quote.reference} · ${quote.name}`;
      data.quote_requests = await rows(tx`select coalesce(jsonb_agg(to_jsonb(t)), '[]') as rows from quote_requests t where id = ${id}`);
      await tx`delete from quote_requests where id = ${id}`;
      break;
    }
  }
  return { label, data, extra, r2, r2Private };
}

/** Moves a record (and its child rows) to the bin. Returns false if it no longer exists. */
export async function moveToTrash(entity: TrashEntity, id: string, actorId: string | null) {
  return sql.begin(async (tx) => {
    const snap = await snapshot(tx, entity, id);
    if (!snap) return false;
    await tx`
      insert into trash (entity, entity_id, label, data, r2_keys, r2_private_keys, deleted_by)
      values (${entity}, ${id}, ${snap.label.slice(0, 300)}, ${tx.json({ ...snap.data, _extra: snap.extra } as never)},
              ${snap.r2}, ${snap.r2Private}, ${actorId})
    `;
    return true;
  });
}

// Tables are restored parent-first. Rows pointing at users who no longer exist are skipped.
const RESTORE_ORDER = [
  "clients",
  "client_members",
  "client_member_blocks",
  "support_tickets",
  "ticket_messages",
  "ticket_attachments",
  "projects",
  "project_media",
  "project_technologies",
  "posts",
  "post_tags",
  "post_reactions",
  "post_view_tracking",
  "comments",
  "comment_likes",
  "comment_reports",
  "files",
  "contact_requests",
  "quote_requests",
] as const;

const USER_COLUMNS: Partial<Record<(typeof RESTORE_ORDER)[number], string>> = {
  client_members: "user_id",
  client_member_blocks: "user_id",
  post_reactions: "user_id",
  comments: "user_id",
  comment_likes: "user_id",
  comment_reports: "reporter_id",
};

const SLUG_TABLES = new Set(["posts", "projects", "clients"]);

/** Puts a bin item back. Returns a message when something had to change (e.g. a taken slug). */
export async function restoreFromTrash(trashId: string): Promise<{ ok: boolean; note?: string; entity?: TrashEntity }> {
  return sql.begin(async (tx) => {
    const [item] = await tx`select * from trash where id = ${trashId} for update`;
    if (!item) return { ok: false };
    const data = item.data as Snapshot & { _extra?: { ticket_ids?: string[]; project_ids?: string[] } };
    let note: string | undefined;

    for (const table of RESTORE_ORDER) {
      let list = (data[table] ?? []) as Record<string, unknown>[];
      if (list.length === 0) continue;

      if (SLUG_TABLES.has(table)) {
        list = await Promise.all(
          list.map(async (row) => {
            const [taken] = await tx`select 1 from ${tx(table)} where slug = ${String(row.slug)} limit 1`;
            if (!taken) return row;
            const slug = `${row.slug}-restored-${Date.now().toString(36).slice(-4)}`;
            note = `The address “${row.slug}” is now used by something else, so it was restored as “${slug}”.`;
            return { ...row, slug };
          }),
        );
      }

      const userCol = USER_COLUMNS[table];
      if (userCol) {
        await tx`
          insert into ${tx(table)}
          select * from jsonb_populate_recordset(null::${tx(table)}, ${tx.json(list as never)}) r
          where exists (select 1 from profiles p where p.id = r.${tx(userCol)})
          on conflict do nothing
        `;
      } else {
        await tx`
          insert into ${tx(table)}
          select * from jsonb_populate_recordset(null::${tx(table)}, ${tx.json(list as never)})
          on conflict do nothing
        `;
      }
    }

    // Re-attach things that were only unlinked (not deleted) at delete time.
    const extra = data._extra ?? {};
    if (item.entity === "project" && extra.ticket_ids?.length) {
      await tx`update support_tickets set project_id = ${item.entity_id} where id = any(${extra.ticket_ids}) and project_id is null`;
    }
    if (item.entity === "client" && extra.project_ids?.length) {
      await tx`update projects set client_id = ${item.entity_id} where id = any(${extra.project_ids}) and client_id is null`;
    }

    await tx`delete from trash where id = ${trashId}`;
    return { ok: true, note, entity: item.entity as TrashEntity };
  });
}

async function removeObjects(item: { r2_keys: string[]; r2_private_keys: string[] }) {
  if (!hasR2()) return;
  for (const key of item.r2_keys ?? []) {
    // Keep objects that are in use again (e.g. the same file restored/re-added elsewhere).
    const [inUse] = await sql`select 1 from files where file_key = ${key} limit 1`;
    if (!inUse) await deleteFromR2(key).catch((e) => console.error("R2 delete failed", key, e));
  }
  for (const key of item.r2_private_keys ?? []) {
    await deletePrivateObject(key).catch((e) => console.error("R2 private delete failed", key, e));
  }
}

/** Deletes one bin item forever (and its files in R2). */
export async function purgeTrashItem(trashId: string) {
  const [item] = await sql`delete from trash where id = ${trashId} returning label, entity, r2_keys, r2_private_keys`;
  if (!item) return null;
  await removeObjects(item as never);
  return item as { label: string; entity: TrashEntity };
}

/** Deletes items whose 30 days are up (or everything when `all`). Returns how many. */
export async function purgeExpiredTrash(all = false) {
  const items = (await sql`
    delete from trash where ${all ? sql`true` : sql`purge_after <= now()`}
    returning r2_keys, r2_private_keys
  `) as unknown as { r2_keys: string[]; r2_private_keys: string[] }[];
  for (const item of items) await removeObjects(item);
  return items.length;
}
