import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';
import { findNodeWithAncestors } from '@/lib/categoryTree';

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

async function getCategoryAncestors(categorySlug?: string) {
  if (!categorySlug) return [];
  const tree = await safeJson(`${API}/categories`);
  if (!tree) return [];
  const found = findNodeWithAncestors(tree, categorySlug);
  if (!found) return [];
  return [...found.ancestors, found.node];
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) return { title: 'Product not found | Purnota Shaj' };
  return {
    title: `${product.title} | Purnota Shaj`,
    description: product.description || `Shop ${product.title} at Purnota Shaj.`,
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  const categoryId = product.category?._id || product.category;
  const [related, whatsappNumber, categoryAncestors] = await Promise.all([
    categoryId ? getRelated(categoryId, product._id) : Promise.resolve([]),
    getSettings(),
    getCategoryAncestors(product.category?.slug),
  ]);

  const breadcrumbItems = [
    ...categoryAncestors.map((c: any) => ({ label: c.name, href: `/category/${c.slug}` })),
    { label: product.title },
  ];

  return (
    <ProductDetailClient
      product={product}
      related={related}
      whatsappNumber={whatsappNumber}
      breadcrumbItems={breadcrumbItems}
    />
  );
}
