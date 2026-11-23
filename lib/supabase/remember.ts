// "Remember me": when unchecked, auth cookies become session cookies
// (no Max-Age/Expires) and disappear when the browser is closed.
export const REMEMBER_COOKIE = "nw_remember";

type CookieOptions = { maxAge?: number; expires?: Date | number | string; [key: string]: unknown };

export function withRemember<T extends CookieOptions | undefined>(options: T, persistent: boolean): T {
  if (persistent || !options) return options;
  // Keep deletions (maxAge 0) working; drop lifetimes on everything else.
  if (options.maxAge === 0) return options;
  const { maxAge: _maxAge, expires: _expires, ...rest } = options;
  return rest as T;
}

export function isPersistent(value: string | undefined | null) {
  return value !== "0";
}
