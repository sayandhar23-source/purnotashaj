import Link from 'next/link';
import SaleBanner from '@/components/SaleBanner';
import ProductRow from '@/components/ProductRow';
import { ProductSummary } from '@/components/ProductCard';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

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

// Collect a category's id plus every descendant id, so the homepage row for
// "Jewellery" includes products filed under its subcategories too.
function collectIds(node: any): string[] {
  const ids = [node._id];
  for (const child of node.children || []) ids.push(...collectIds(child));
  return ids;
}

async function getProductsForCategory(node: any): Promise<ProductSummary[]> {
  const ids = collectIds(node);
  const data = await safeJson(`${API}/products?categories=${ids.join(',')}&limit=5`);
  return data?.products || [];
}

async function getSection(param: string): Promise<ProductSummary[]> {
  const data = await safeJson(`${API}/products?${param}=true&limit=5`);
  return data?.products || [];
}

export default async function HomePage() {
  const categoryTree = await getCategoryTree();

  const [newArrivals, bestSellers, hotDeals, categoryProductLists] = await Promise.all([
    getSection('newArrival'),
    getSection('bestSeller'),
    getSection('hotDeal'),
    Promise.all(categoryTree.map((cat: any) => getProductsForCategory(cat))),
  ]);

  return (
    <div>
      <SaleBanner />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <h2 className="text-xl font-serif font-semibold mb-6">Shop by Category</h2>
        <div className="flex sm:grid sm:grid-cols-3 md:grid-cols-6 gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          {categoryTree.map((cat: any) => (
            <Link
              key={cat._id}
              href={`/category/${cat.slug}`}
              className="card shrink-0 w-28 sm:w-auto p-4 sm:p-6 text-center hover:shadow-md transition-shadow"
            >
              <span className="font-medium text-sm">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <ProductRow title="Hot Deals Now" viewAllHref="/collection/hot-deals" products={hotDeals} />
      <ProductRow title="New Arrivals" viewAllHref="/collection/new-arrivals" products={newArrivals} />
      <ProductRow title="Most Selling" viewAllHref="/collection/best-sellers" products={bestSellers} />

      {categoryTree.map((cat: any, i: number) => (
        <ProductRow
          key={cat._id}
          title={cat.name}
          viewAllHref={`/category/${cat.slug}`}
          products={categoryProductLists[i]}
        />
      ))}

      <div className="h-8" />
    </div>
  );
}
