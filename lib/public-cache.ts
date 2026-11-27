import { unstable_cache, updateTag } from "next/cache";

/** Tag for cached public reads (home page, listings). Admin edits clear it. */
export const PUBLIC_TAG = "public-content";

/** Cache a public, viewer-independent query for a short time. */
export function publicCache<A extends unknown[], R>(fn: (...args: A) => Promise<R>, key: string, revalidate = 120) {
  return unstable_cache(fn, [key], { revalidate, tags: [PUBLIC_TAG] });
}

/** Call from admin server actions after changing public content. */
export function refreshPublicContent() {
  try {
    updateTag(PUBLIC_TAG);
  } catch {
    // Outside a server action (e.g. a route handler) there's nothing to refresh eagerly.
  }
}
