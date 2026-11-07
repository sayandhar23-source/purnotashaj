import Link from 'next/link';
import TempleSaleBanner from '@/components/TempleSaleBanner';
import ProductRow from '@/components/ProductRow';
import { ProductSummary } from '@/components/ProductCard';
import SectionDivider from '@/components/dividers/SectionDivider';
import CategoryCard from '@/components/CategoryCard';
import ComboStrip from '@/components/home/ComboStrip';
import CategoryStories from '@/components/home/CategoryStories';
import OccasionEdit from '@/components/home/OccasionEdit';
import ShopByPrice from '@/components/home/ShopByPrice';
import ForYouFeed from '@/components/home/ForYouFeed';

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/+$/, '');

async function safeJson(url: string) {
  try {
    const res = await fetch(url, { next: { revalidate: 30 } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function getCategoryTree() {
  const data = await safeJson(`${API}/categories?hasProducts=true`);
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
  const data = await safeJson(`${API}/products?categories=${ids.join(',')}&limit=10`);
  return data?.products || [];
}

async function getSection(param: string): Promise<ProductSummary[]> {
  const data = await safeJson(`${API}/products?${param}=true&limit=10`);
  return data?.products || [];
}

async function getSaleBannerContent() {
  const data = await safeJson(`${API}/sale-banner`);
  return data;
}

async function getOccasions() {
  return safeJson(`${API}/products/occasions?limit=8`);
}

async function getLooks() {
  const data = await safeJson(`${API}/products/looks?limit=6`);
  return Array.isArray(data) ? data : [];
}

async function getStoreSettings() {
  const data = await safeJson(`${API}/settings`);
  return data;
}

// A rotating palette for the per-category rows, all chosen to work with white
// text. Saree always gets blue specifically, regardless of its position in
// the category list — everything else cycles through the rest in order.
const SAREE_COLOR = '#2563EB';
const CATEGORY_COLOR_PALETTE = ['#C9971C', '#A63472', '#B5541F', '#D6336C', '#6B3FA0', '#34495E', '#2F855A'];

function getCategoryColor(name: string, index: number) {
  if (name.trim().toLowerCase() === 'saree') return SAREE_COLOR;
  return CATEGORY_COLOR_PALETTE[index % CATEGORY_COLOR_PALETTE.length];
}

export default async function HomePage() {
  const categoryTree = await getCategoryTree();

  const [newArrivals, bestSellers, hotDeals, categoryProductLists, bannerContent, settings, occasions, looks] = await Promise.all([
    getSection('newArrival'),
    getSection('bestSeller'),
    getSection('hotDeal'),
    Promise.all(categoryTree.map((cat: any) => getProductsForCategory(cat))),
    getSaleBannerContent(),
    getStoreSettings(),
    getOccasions(),
    getLooks(),
  ]);

  return (
    <div>
      <ComboStrip />

      {bannerContent?.isActive !== false && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 md:mt-6">
          <TempleSaleBanner
            template={bannerContent?.activeTemplate}
            heroTitle={bannerContent?.heroTitle || 'Jagannath Rath Yatra Sale'}
            heroSubtitle={bannerContent?.heroSubtitle}
            ctaText={bannerContent?.ctaText || 'Shop the sale'}
            ctaHref="/sale#products"
          />
        </div>
      )}

      <CategoryStories categories={categoryTree} />

      <OccasionEdit occasions={occasions} fallbackProducts={newArrivals} />
      <ShopByPrice deals={hotDeals} />
      <ForYouFeed looks={looks} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <Link
          href="/refer-and-earn"
          className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl px-5 sm:px-8 py-5 sm:py-6 text-center sm:text-left"
          style={{ backgroundColor: '#FBE6D8' }}
        >
          <div>
            <p className="text-xs font-semibold tracking-widest text-brand-600">EARN WITH US</p>
            <p className="font-serif font-semibold text-lg sm:text-xl mt-1 text-gray-900">
              Now earn by referral — see how
            </p>
          </div>
          <span className="btn-primary inline-block px-6 py-2.5 shrink-0 whitespace-nowrap">
            Learn More
          </span>
        </Link>
      </div>

      <SectionDivider id={settings?.activeDivider} />

      {/* Tablets and up keep the category grid; phones already have the round stories at the top */}
      <section className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <h2 className="text-xl font-serif font-semibold mb-6">Shop by Category</h2>
        <div className="grid grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {categoryTree.map((cat: any) => (
            <CategoryCard key={cat._id} cat={cat} />
          ))}
        </div>
      </section>

      <ProductRow title="New Arrivals" viewAllHref="/collection/new-arrivals" products={newArrivals} bgColor="#2F9E44" dark />
      <ProductRow title="Most Selling" viewAllHref="/collection/best-sellers" products={bestSellers} bgColor="#0F7173" dark />

      {categoryTree.map((cat: any, i: number) => (
        <ProductRow
          key={cat._id}
          title={cat.name}
          viewAllHref={`/category/${cat.slug}`}
          products={categoryProductLists[i]}
          bgColor={getCategoryColor(cat.name, i)}
          dark
        />
      ))}

      <SectionDivider id={settings?.activeDivider} />

      <div className="h-8" />
    </div>
  );
}
