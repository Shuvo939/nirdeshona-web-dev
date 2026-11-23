// Only same-site paths are allowed as post-login redirect targets.
// Rejects "//evil.com" and "/\\evil.com" (browsers treat both as another host).
export function safeNextPath(value: string | null | undefined, fallback = "/account") {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  try {
    const url = new URL(value, "https://placeholder.local");
    if (url.origin !== "https://placeholder.local") return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

// http(s) URLs only — blocks javascript:, data: and friends in user/admin-entered links.
export function isHttpUrl(value: string) {
  try {
    const { protocol } = new URL(value);
    return protocol === "https:" || protocol === "http:";
  } catch {
    return false;
  }
}
