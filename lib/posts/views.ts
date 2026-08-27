import { cookies } from "next/headers";
import { sql } from "@/lib/db";

const VISITOR_COOKIE = "nirdeshona_visitor_id";

export async function trackPostView(postId: string) {
  const cookieStore = await cookies();

  const visitorId = cookieStore.get(VISITOR_COOKIE)?.value;

  // No visitor cookie = do not count.
  if (!visitorId) {
    return {
      counted: false,
    };
  }

  const result = await sql`
    insert into public.post_view_tracking (
      post_id,
      visitor_id,
      last_viewed_at
    )
    values (
      ${postId},
      ${visitorId}::uuid,
      now()
    )
    on conflict (post_id, visitor_id)
    do update set
      last_viewed_at = now()
    where post_view_tracking.last_viewed_at <= now() - interval '12 hours'
    returning post_id
  `;

  // Existing visit within the last 12 hours.
  if (result.length === 0) {
    return {
      counted: false,
    };
  }

  await sql`
    update public.posts
    set views_count = views_count + 1
    where id = ${postId}
  `;

  return {
    counted: true,
  };
}