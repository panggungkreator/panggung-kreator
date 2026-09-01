/**
 * Cek izin dari permission map (tanpa query tambahan).
 * Digunakan di client component setelah map di-pass dari server.
 */
export function hasPermission(
  permMap: Record<string, string[]>,
  pageSlug: string,
  action: string
): boolean {
  if (!permMap) return false;
  if (
    permMap["*"]?.includes("*") ||
    permMap["*"]?.includes(action) ||
    permMap[pageSlug]?.includes("*")
  ) {
    return true;
  }
  return permMap[pageSlug]?.includes(action) ?? false;
}
