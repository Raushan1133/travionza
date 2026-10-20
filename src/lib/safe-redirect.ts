/** Only allow same-site paths as post-login redirects (blocks `//evil.com` and absolute URLs) */
export function safeNext(next: string | null, fallback = "/trips") {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback
  return next
}
