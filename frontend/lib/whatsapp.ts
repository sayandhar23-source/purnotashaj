export function buildWhatsappLink(product: { title: string; slug: string }, variantName?: string) {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const url = `${origin}/products/${product.slug}`;
  const lines = [
    `Hi! I'm interested in this product:`,
    product.title + (variantName ? ` (${variantName})` : ''),
    url,
  ];
  const text = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${phone}?text=${text}`;
}
