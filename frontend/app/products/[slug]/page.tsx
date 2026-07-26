import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';
import { findNodeWithAncestors, collectIds } from '@/lib/categoryTree';

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

// "Related" products cascade through three tiers, each broader than the last,
// so a sparsely-populated subcategory never falls straight through to
// completely unrelated items (e.g. bangles showing under a saree):
//   1. Exact same category/subcategory
//   2. Everything under the same top-level category (e.g. all of "Saree",
//      not just "Cotton" specifically) — found by walking the category tree
//   3. Generic featured products, only as an absolute last resort
async function getRelated(product: any, categoryTree: any[]): Promise<any[]> {
  const categoryId = product.category?._id || product.category;
  const excludeId = product._id;
  if (!categoryId) return getFeaturedFallback(excludeId);

  const exact = await safeJson(`${API}/products?category=${categoryId}&excludeId=${excludeId}&limit=8`);
  if (exact?.products?.length) return exact.products;

  const categorySlug = product.category?.slug;
  if (categorySlug) {
    const found = findNodeWithAncestors(categoryTree, categorySlug);
    if (found) {
      const topAncestor = found.ancestors[0] || found.node;
      const ids = collectIds(topAncestor).filter((id) => id !== categoryId); // already tried exact match above
      if (ids.length > 0) {
        const branch = await safeJson(
          `${API}/products?categories=${ids.join(',')}&excludeId=${excludeId}&limit=8`,
        );
        if (branch?.products?.length) return branch.products;
      }
    }
  }

  return getFeaturedFallback(excludeId);
}

async function getFeaturedFallback(excludeId: string) {
  const featured = await safeJson(`${API}/products?featured=true&excludeId=${excludeId}&limit=8`);
  return featured?.products || [];
}

async function getSettings() {
  const data = await safeJson(`${API}/settings`);
  return data?.whatsappNumber || '';
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) return { title: 'Product not found | Purnota Shaj' };
  const title = `${product.title} | Purnota Shaj`;
  const description = product.description || `Shop ${product.title} at Purnota Shaj.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: product.images?.length ? [{ url: product.images[0] }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  const categoryTree = (await safeJson(`${API}/categories`)) || [];

  const [related, whatsappNumber] = await Promise.all([
    getRelated(product, categoryTree),
    getSettings(),
  ]);

  const found = product.category?.slug ? findNodeWithAncestors(categoryTree, product.category.slug) : null;
  const breadcrumbItems = [
    ...(found?.ancestors || []).map((c: any) => ({ label: c.name, href: `/category/${c.slug}` })),
    ...(found?.node ? [{ label: found.node.name, href: `/category/${found.node.slug}` }] : []),
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
