export function sanitizeFilename(input: string, fallback = "untitled"): string {
  const sanitized = input
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^\.+$/, "")
    .replace(/^-|-$/g, "");

  return sanitized.length > 0 ? sanitized : fallback;
}
