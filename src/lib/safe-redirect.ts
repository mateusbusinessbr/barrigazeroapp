/** Only allow same-origin relative paths to avoid open redirects. */
export function safeRedirect(target: unknown, fallback = "/painel"): string {
  if (typeof target !== "string") return fallback;
  if (!target.startsWith("/") || target.startsWith("//") || target.startsWith("/\\"))
    return fallback;
  return target;
}
