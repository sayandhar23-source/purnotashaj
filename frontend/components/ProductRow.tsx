'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import ProductCard, { ProductSummary } from './ProductCard';

export default function ProductRow({
  title,
  viewAllHref,
  products,
  bgColor,
  dark,
}: {
  title: string;
  viewAllHref: string;
  products: ProductSummary[];
  bgColor?: string; // e.g. '#FFE4D6' — wraps the section in a colored card when set
  dark?: boolean; // use light text — for bold/vibrant backgrounds
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  if (products.length === 0) return null;

  const scrollByAmount = (dir: 1 | -1) => {
    scrollerRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
      <div
        className={bgColor ? 'rounded-2xl sm:rounded-3xl p-4 sm:p-6' : ''}
        style={bgColor ? { backgroundColor: bgColor } : undefined}
      >
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className={`text-lg sm:text-xl font-serif font-semibold ${dark ? 'text-white' : ''}`}>
            {title}
          </h2>
          <div className="flex items-center gap-3">
            <Link
              href={viewAllHref}
              className={`text-sm font-medium flex items-center gap-0.5 shrink-0 ${
                dark ? 'text-white/90' : 'text-brand-600'
              }`}
            >
              View all <ChevronRight size={16} />
            </Link>
            {/* Prev/next buttons — desktop only; mobile keeps native touch-swipe */}
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={() => scrollByAmount(-1)}
                aria-label="Previous"
                className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                  dark ? 'border-white/40 text-white hover:bg-white/10' : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => scrollByAmount(1)}
                aria-label="Next"
                className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                  dark ? 'border-white/40 text-white hover:bg-white/10' : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal row — native swipe on mobile, buttons + no visible
            scrollbar on desktop (scrollbar-hide only matters there; mobile
            scrollbars are invisible by default anyway) */}
        <div
          ref={scrollerRef}
          className={`flex gap-4 sm:gap-6 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide scroll-smooth ${
            bgColor ? '' : '-mx-4 px-4 lg:mx-0 lg:px-0'
          }`}
        >
          {products.slice(0, 10).map((p) => (
            <div key={p._id} className="w-[46%] sm:w-[30%] lg:w-[220px] shrink-0 snap-start">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
