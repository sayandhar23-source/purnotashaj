import type { Metadata } from 'next';
import Link from 'next/link';
import ProductCard, { ProductSummary } from '@/components/ProductCard';
import Breadcrumbs from '@/components/Breadcrumbs';
import SortFilterBar from '@/components/SortFilterBar';
import CategorySidebarTree from '@/components/CategorySidebarTree';
import { findNodeWithAncestors, collectIds } from '@/lib/categoryTree';

// Always fetch fresh — prevents Next.js's client-side route cache from ever
// showing a previous category's products when navigating quickly between
// categories (most noticeable on mobile, tapping through the sidebar fast).
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

async function getCategoryTree() {
  const data = await safeJson(`${API}/categories`);
  return data || [];
}

async function getProductsByCategoryIds(
  ids: string[],
  opts: { sort?: string; priceMin?: string; priceMax?: string },
): Promise<{ products: ProductSummary[]; total: number }> {
  if (ids.length === 0) return { products: [], total: 0 };
  const qs = new URLSearchParams({ categories: ids.join(','), limit: '60' });
  if (opts.sort) qs.set('sort', opts.sort);
  if (opts.priceMin) qs.set('priceMin', opts.priceMin);
  if (opts.priceMax) qs.set('priceMax', opts.priceMax);
  const data = await safeJson(`${API}/products?${qs.toString()}`);
  return { products: data?.products || [], total: data?.total || 0 };
}

async function getFeatured(): Promise<ProductSummary[]> {
  const data = await safeJson(`${API}/products?featured=true&limit=8`);
  return data?.products || [];
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const tree = await getCategoryTree();
  const found = findNodeWithAncestors(tree, params.slug);
  const name = found?.node?.name || params.slug.replace(/-/g, ' ');
  return {
    title: `${name} | Purnota Shaj`,
    description: found?.node?.description || `Shop ${name} at Purnota Shaj.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { sort?: string; priceMin?: string; priceMax?: string };
}) {
  const tree = await getCategoryTree();
  const found = findNodeWithAncestors(tree, params.slug);
  const category = found?.node;
  const ancestors: any[] = found?.ancestors || [];
  const parent = ancestors[ancestors.length - 1];

  // The sidebar always shows the WHOLE branch from its top-level root down —
  // e.g. viewing "Jamdani" still shows the full Saree > Cotton Saree > Jamdani
  // > Jamdani Cotton tree, with the active path expanded, so you can jump
  // anywhere in that category family without going back up one level at a time.
  const sidebarRoot = ancestors[0] || category;
  const showSidebar = !!sidebarRoot && (sidebarRoot.children?.length || 0) > 0;

  const categoryIds = category ? collectIds(category) : [];
  const { products, total } = await getProductsByCategoryIds(categoryIds, searchParams);
  const suggestions = products.length === 0 ? await getFeatured() : [];

  const breadcrumbItems = [
    ...ancestors.map((a) => ({ label: a.name, href: `/category/${a.slug}` })),
    ...(category ? [{ label: category.name }] : []),
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumbs items={breadcrumbItems} />

      {parent && (
        <Link href={`/category/${parent.slug}`} className="text-sm text-brand-500 mb-2 inline-block">
          ← All in {parent.name}
        </Link>
      )}
      <h1 className="text-2xl font-serif font-semibold mb-2 capitalize">
        {category?.name || params.slug.replace(/-/g, ' ')}
      </h1>
      {category?.description && <p className="text-gray-500 mb-6">{category.description}</p>}

      <div className={showSidebar ? 'md:grid md:grid-cols-[220px_1fr] md:gap-8' : ''}>
        {showSidebar && (
          <aside className="md:sticky md:top-20 md:h-fit mb-6 md:mb-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
              Filter by
            </p>
            <CategorySidebarTree root={sidebarRoot} activeSlug={params.slug} />
          </aside>
        )}

        <div className="min-w-0">
          {products.length === 0 ? (
            <div>
              <p className="text-gray-500 text-sm mb-8">
                {category
                  ? "No products in this category yet — here's what's popular right now."
                  : "We couldn't find that category — here's what's popular right now."}
              </p>
              {suggestions.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  {suggestions.map((p) => (
                    <ProductCard key={p._id} product={p} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              <SortFilterBar resultCount={total} />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {products.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
