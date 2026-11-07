export function buildWhatsappLink(
  phone: string,
  product: { title: string; slug: string; basePrice?: number },
  variantName?: string,
  quantity?: number,
) {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const url = `${origin}/products/${product.slug}`;

  const lines = [
    `Hi! I'm interested in this product:`,
    product.title + (variantName ? ` (${variantName})` : ''),
  ];
  if (product.basePrice) lines.push(`Price: ₹${product.basePrice}`);
  if (quantity && quantity > 1) lines.push(`Quantity: ${quantity}`);
  lines.push(url);

  const text = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${phone}?text=${text}`;
}
