export function countUniqueViews(
  views: Array<{ sessionId: string | null }>,
): number {
  const sessions = new Set<string>();
  let legacyCount = 0;

  for (const view of views) {
    if (view.sessionId) {
      sessions.add(view.sessionId);
    } else {
      // Legacy rows created before session tracking are treated as-is.
      legacyCount += 1;
    }
  }

  return sessions.size + legacyCount;
}
