/**
 * Generates a readable, reasonably-unique SKU from category, product title,
 * and (optionally) a variant name — e.g. "CLO-REDTS-REDM-014".
 * `index` should be a small incrementing number to avoid collisions between
 * variants of the same product.
 */
export function generateSku(
  categoryName: string | undefined,
  productTitle: string,
  variantName: string | undefined,
  index: number,
): string {
  const clean = (s: string) => s.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

  const catCode = clean(categoryName || 'GEN').slice(0, 3).padEnd(3, 'X');
  const prodCode = clean(productTitle).slice(0, 5).padEnd(3, 'X');
  const variantCode = variantName ? clean(variantName).slice(0, 4) : 'STD';
  const seq = String(index + 1).padStart(3, '0');

  return [catCode, prodCode, variantCode, seq].filter(Boolean).join('-');
}
