// next/image THROWS while rendering on the server if its src isn't a proper link
// (e.g. someone saved "ibb.co/abc" without https://). One bad value would then take down
// the whole page — every visitor, not just that image.
export function isHttpUrl(value: unknown): value is string {
  if (typeof value !== 'string' || !value.trim()) return false;
  try {
    const u = new URL(value.trim());
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

// What <Image> may be given: a real http(s) link, or a file from this site's own /public
// folder ("/logo.png"). "//host/x" (protocol-relative) and anything else is rejected.
export function isSafeImageSrc(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const v = value.trim();
  if (v.startsWith('/')) return !v.startsWith('//');
  return isHttpUrl(v);
}
