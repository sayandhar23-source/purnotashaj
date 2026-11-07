// Public listing endpoints used to pass `Number(limit)` straight into the query:
// ?limit=100000 was a cheap way to make the database do a lot of work, and
// ?page=-3 or ?limit=abc produced database errors. Everything goes through here now.
export function clampPage(raw: unknown, fallback = 1): number {
  const n = Math.floor(Number(raw));
  return Number.isFinite(n) && n >= 1 ? Math.min(n, 10000) : fallback;
}

export function clampLimit(raw: unknown, fallback = 20, max = 60): number {
  const n = Math.floor(Number(raw));
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(n, max);
}
