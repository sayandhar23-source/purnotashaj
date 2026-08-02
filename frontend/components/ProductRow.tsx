import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import ProductCard, { ProductSummary } from './ProductCard';

export default function ProductRow({
  title,
  viewAllHref,
  products,
  bgColor,
}: {
  title: string;
  viewAllHref: string;
  products: ProductSummary[];
  bgColor?: string; // e.g. '#FFE4D6' — wraps the section in a colored card when set
}) {
  if (products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
      <div
        className={bgColor ? 'rounded-2xl sm:rounded-3xl p-4 sm:p-6' : ''}
        style={bgColor ? { backgroundColor: bgColor } : undefined}
      >
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-serif font-semibold">{title}</h2>
          <Link
            href={viewAllHref}
            className="text-sm text-brand-600 font-medium flex items-center gap-0.5 shrink-0"
          >
            View all <ChevronRight size={16} />
          </Link>
        </div>

        {/* Horizontal swipeable row at every breakpoint, including desktop */}
        <div
          className={`flex gap-4 sm:gap-6 overflow-x-auto pb-2 snap-x snap-mandatory ${
            bgColor ? '' : '-mx-4 px-4 lg:mx-0 lg:px-0'
          }`}
        >
          {products.slice(0, 5).map((p) => (
            <div key={p._id} className="w-[46%] sm:w-[30%] lg:w-[220px] shrink-0 snap-start">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
