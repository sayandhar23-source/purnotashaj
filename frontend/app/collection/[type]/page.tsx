import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductCard, { ProductSummary } from '@/components/ProductCard';
import Breadcrumbs from '@/components/Breadcrumbs';
import SortFilterBar from '@/components/SortFilterBar';
import { OCCASIONS } from '@/lib/occasions';

// Always fetch fresh — prevents stale category/collection data from a previous
// page persisting in Next.js's client route cache during fast navigation.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/+$/, '');

// Each collection is just a fixed set of listing filters.
const COLLECTIONS: Record<string, { title: string; description: string; query: Record<string, string> }> = {
  'new-arrivals': { title: 'New Arrivals', description: 'The latest additions to the store.', query: { newArrival: 'true' } },
  'best-sellers': { title: 'Most Selling', description: 'Our most popular picks, loved by customers.', query: { bestSeller: 'true' } },
  'hot-deals': { title: 'Hot Deals Now', description: "Limited-time offers — don't miss out.", query: { hotDeal: 'true' } },

  // Shop by budget — "price" means what you actually pay (sale price while a sale is on)
  'under-499': { title: 'Under ₹499', description: 'Pocket-friendly picks, all under ₹499.', query: { priceMax: '499', sort: 'price-asc' } },
  'under-699': { title: 'Under ₹699', description: 'Everyday value, all under ₹699.', query: { priceMax: '699', sort: 'price-asc' } },
  'under-999': { title: 'Under ₹999', description: 'Great combos, all under ₹999.', query: { priceMax: '999', sort: 'price-asc' } },
  '999-and-up': { title: '₹999 & up', description: 'Gifts and festive pieces from ₹999.', query: { priceMin: '999', sort: 'price-asc' } },

  // Shop by occasion — products tagged for it in Admin → Products
  ...Object.fromEntries(
    OCCASIONS.map((o) => [o.key, { title: o.label === 'Pujo' ? 'The Pujo Edit' : `${o.label} edit`, description: o.blurb, query: { tag: o.key } }]),
  ),
};

async function safeJson(url: string) {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function getProducts(
  fixed: Record<string, string>,
  opts: { sort?: string; priceMin?: string; priceMax?: string },
): Promise<{ products: ProductSummary[]; total: number }> {
  // The collection's own filters first; anything the shopper picks in the filter bar overrides them
  const qs = new URLSearchParams({ ...fixed, limit: '60' });
  if (opts.sort) qs.set('sort', opts.sort);
  if (opts.priceMin) qs.set('priceMin', opts.priceMin);
  if (opts.priceMax) qs.set('priceMax', opts.priceMax);
  const data = await safeJson(`${API}/products?${qs.toString()}`);
  return { products: data?.products || [], total: data?.total || 0 };
}

export async function generateMetadata({ params }: { params: { type: string } }): Promise<Metadata> {
  const collection = COLLECTIONS[params.type];
  if (!collection) return { title: 'Purnota Shaj' };
  return {
    title: `${collection.title} | Purnota Shaj`,
    description: collection.description,
  };
}

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: { type: string };
  searchParams: { sort?: string; priceMin?: string; priceMax?: string };
}) {
  const collection = COLLECTIONS[params.type];
  if (!collection) notFound();

  const { products, total } = await getProducts(collection.query, searchParams);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumbs items={[{ label: collection.title }]} />
      <h1 className="text-2xl font-serif font-semibold mb-2">{collection.title}</h1>
      <p className="text-gray-500 mb-8">{collection.description}</p>

      {products.length === 0 ? (
        <p className="text-gray-500 text-sm">
          Nothing here yet — mark products for this section from Admin → Products.
        </p>
      ) : (
        <>
          <SortFilterBar resultCount={total} />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
