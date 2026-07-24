import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductCard, { ProductSummary } from '@/components/ProductCard';
import Breadcrumbs from '@/components/Breadcrumbs';
import SortFilterBar from '@/components/SortFilterBar';

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/+$/, '');

const COLLECTIONS: Record<string, { title: string; description: string; param: string }> = {
  'new-arrivals': {
    title: 'New Arrivals',
    description: 'The latest additions to the store.',
    param: 'newArrival',
  },
  'best-sellers': {
    title: 'Most Selling',
    description: 'Our most popular picks, loved by customers.',
    param: 'bestSeller',
  },
  'hot-deals': {
    title: 'Hot Deals Now',
    description: "Limited-time offers — don't miss out.",
    param: 'hotDeal',
  },
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
  param: string,
  opts: { sort?: string; priceMin?: string; priceMax?: string },
): Promise<{ products: ProductSummary[]; total: number }> {
  const qs = new URLSearchParams({ [param]: 'true', limit: '60' });
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

  const { products, total } = await getProducts(collection.param, searchParams);

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
