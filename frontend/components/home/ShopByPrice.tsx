import Link from 'next/link';
import ProductCard, { ProductSummary } from '@/components/ProductCard';
import ComboSaver from './ComboSaver';
import { BUDGET_TILES } from '@/lib/occasions';

// "Shop by budget" — price is the first filter for many shoppers, so it's answered on the
// homepage. The tiles are plain links to /collection/under-499 etc.
export default function ShopByPrice({ deals }: { deals: ProductSummary[] }) {
  const stealDeals = deals.slice(0, 4);
  return (
    <section className="bg-white mt-8 md:mt-12 py-8 md:py-12" aria-label="Shop by budget">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-3 mb-4 md:mb-5">
          <h2 className="font-serif font-semibold text-xl md:text-3xl text-[#5C1010]">Shop by budget</h2>
          <Link href="/sale" className="text-sm font-semibold text-brand-600 shrink-0">See all offers →</Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {BUDGET_TILES.map((t) => (
            <Link
              key={t.slug}
              href={`/collection/${t.slug}`}
              className="block rounded-2xl p-4 sm:p-5 border-2 border-dashed border-white/70 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all sm:odd:-rotate-1 sm:even:rotate-1"
              style={{ background: t.bg, color: t.color }}
            >
              <span className="block text-[10px] sm:text-xs tracking-[0.15em] font-semibold uppercase opacity-90">{t.caption}</span>
              <span className="block font-serif font-bold text-xl sm:text-3xl leading-tight mt-1">{t.label}</span>
            </Link>
          ))}
        </div>

        <div className={`grid gap-5 mt-5 md:mt-6 ${stealDeals.length > 0 ? 'lg:grid-cols-[5fr_7fr]' : ''}`}>
          <ComboSaver />
          {stealDeals.length > 0 && (
            <div>
              <div className="flex items-end justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Steal deals</h3>
                <Link href="/collection/hot-deals" className="text-sm font-semibold text-brand-600">See all</Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {stealDeals.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
