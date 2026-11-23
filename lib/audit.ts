import { sql } from "@/lib/db";

// Records a staff action for /admin/activity. Best-effort: never throws.
export async function logActivity(
  actorId: string | null,
  entry: { action: string; entity: string; entityId?: string | null; summary: string },
) {
  try {
    await sql`
      insert into activity_log (actor_id, action, entity, entity_id, summary)
      values (${actorId}, ${entry.action}, ${entry.entity}, ${entry.entityId ?? null}, ${entry.summary.slice(0, 300)})
    `;
  } catch (error) {
    console.error("logActivity failed", error);
  }
}
