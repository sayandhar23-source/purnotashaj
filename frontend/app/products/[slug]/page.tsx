import { notFound } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/+$/, '');

async function safeJson(url: string) {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function getProduct(slug: string) {
  return safeJson(`${API}/products/slug/${slug}`);
}

async function getRelated(categoryId: string, excludeId: string) {
  const data = await safeJson(
    `${API}/products?category=${categoryId}&excludeId=${excludeId}&limit=8`,
  );
  if (data?.products?.length) return data.products;
  // Fall back to featured products if nothing else in the same category
  const featured = await safeJson(`${API}/products?featured=true&excludeId=${excludeId}&limit=8`);
  return featured?.products || [];
}

async function getSettings() {
  const data = await safeJson(`${API}/settings`);
  return data?.whatsappNumber || '';
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  const categoryId = product.category?._id || product.category;
  const [related, whatsappNumber] = await Promise.all([
    categoryId ? getRelated(categoryId, product._id) : Promise.resolve([]),
    getSettings(),
  ]);

  return <ProductDetailClient product={product} related={related} whatsappNumber={whatsappNumber} />;
}
