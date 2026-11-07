type ImageMetaEntry = { url: string; name?: string; title?: string; alt?: string };

// Falls back to the product title when no per-image alt/title was set —
// keeps every existing product (no imageMeta yet) working exactly as before.
export function getImageAltTitle(
  url: string,
  imageMeta: ImageMetaEntry[] | undefined,
  fallbackTitle: string,
): { alt: string; title: string } {
  const meta = imageMeta?.find((m) => m.url === url);
  return {
    alt: meta?.alt || fallbackTitle,
    title: meta?.title || fallbackTitle,
  };
}
