import TempleSaleBanner from '@/components/TempleSaleBanner';
import ProductCard, { ProductSummary } from '@/components/ProductCard';

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

async function getSaleBannerContent() {
  return safeJson(`${API}/sale-banner`);
}

async function getSaleProducts(): Promise<ProductSummary[]> {
  const data = await safeJson(`${API}/products/sale-page`);
  return data || [];
}

export default async function SalePage() {
  const [bannerContent, products] = await Promise.all([getSaleBannerContent(), getSaleProducts()]);

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <TempleSaleBanner
          template={bannerContent?.activeTemplate}
          heroTitle={bannerContent?.pageTitle || 'Rath Yatra Sale'}
          heroSubtitle={bannerContent?.pageSubtitle}
          showCta={false}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {products.length === 0 ? (
          <p className="text-gray-500 text-sm">
            Nothing on sale right now — check back soon.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
