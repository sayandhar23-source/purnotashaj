import { notFound } from 'next/navigation';
import ProductCard, { ProductSummary } from '@/components/ProductCard';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

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

async function getProducts(param: string): Promise<ProductSummary[]> {
  const data = await safeJson(`${API}/products?${param}=true&limit=60`);
  return data?.products || [];
}

export default async function CollectionPage({ params }: { params: { type: string } }) {
  const collection = COLLECTIONS[params.type];
  if (!collection) notFound();

  const products = await getProducts(collection.param);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-serif font-semibold mb-2">{collection.title}</h1>
      <p className="text-gray-500 mb-8">{collection.description}</p>

      {products.length === 0 ? (
        <p className="text-gray-500 text-sm">
          Nothing here yet — mark products for this section from Admin → Products.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
