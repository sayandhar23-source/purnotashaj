'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ProductCard, { ProductSummary } from '@/components/ProductCard';
import { OCCASIONS, OCCASION_BY_KEY } from '@/lib/occasions';
import { isSafeImageSrc } from '@/lib/safeImage';

type OccasionData = Record<string, { total: number; products: ProductSummary[] }>;

// "What are you dressing for?" — women shop by event, not by product type.
// Occasions nobody has tagged products for are hidden, and if none are tagged yet the
// section quietly becomes "Fresh picks for you" (newest products) so it never looks empty.
export default function OccasionEdit({
  occasions,
  fallbackProducts,
}: {
  occasions: OccasionData | null;
  fallbackProducts: ProductSummary[];
}) {
  const available = OCCASIONS.filter((o) => (occasions?.[o.key]?.total ?? 0) > 0);
  const [selected, setSelected] = useState<string>(available[0]?.key || '');

  const wrapper = 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 md:mt-12';

  if (available.length === 0) {
    if (fallbackProducts.length === 0) return null;
    return (
      <section className={wrapper}>
        <div className="flex items-end justify-between gap-3 mb-4">
          <h2 className="font-serif font-semibold text-xl md:text-3xl text-[#5C1010]">Fresh picks for you</h2>
          <Link href="/collection/new-arrivals" className="text-sm font-semibold text-brand-600 shrink-0">View all →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
          {fallbackProducts.slice(0, 4).map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </section>
    );
  }

  const occ = OCCASION_BY_KEY[selected] && occasions?.[selected] ? OCCASION_BY_KEY[selected] : available[0];
  const data = occasions![occ.key];
  const heroImage = data.products[0]?.images?.[0];

  return (
    <section className={wrapper} aria-label="Shop by occasion">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-6 mb-4 md:mb-5">
        <h2 className="font-serif font-semibold text-xl md:text-3xl text-[#5C1010]">What are you dressing for?</h2>
        <div className="flex gap-2 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap pb-1 scrollbar-hide" role="group" aria-label="Occasions">
          {available.map((o) => (
            <button
              key={o.key}
              onClick={() => setSelected(o.key)}
              aria-pressed={o.key === occ.key}
              className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs sm:text-sm transition-colors ${
                o.key === occ.key ? 'bg-[#5C1010] text-white border-[#5C1010]' : 'bg-white text-gray-700 border-gray-200 hover:border-[#5C1010]'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[5fr_7fr] md:gap-5">
        <div className="bg-[#FBF1E7] rounded-3xl flex overflow-hidden min-h-[160px] md:min-h-[260px]">
          <div
            className="relative shrink-0 w-24 sm:w-32 lg:w-36 h-36 sm:h-48 lg:h-52 mt-5 ml-4 sm:ml-6 self-end rounded-t-full overflow-hidden"
            style={{ background: occ.gradient }}
          >
            {isSafeImageSrc(heroImage) && (
              <Image src={heroImage.trim()} alt="" fill sizes="150px" className="object-cover" />
            )}
          </div>
          <div className="p-4 sm:p-6 flex flex-col justify-center gap-2 min-w-0">
            <p className="text-[10px] font-bold tracking-[0.18em] text-brand-600">{occ.eyebrow}</p>
            <h3 className="font-serif font-semibold text-lg sm:text-2xl leading-tight text-[#5C1010]">{occ.title}</h3>
            <p className="hidden sm:block text-sm text-gray-600 leading-relaxed">{occ.blurb}</p>
            <Link
              href={`/collection/${occ.key}`}
              className="self-start mt-1 rounded-full bg-[#D4A024] text-[#5C1010] text-xs sm:text-sm font-bold px-4 py-2"
            >
              Shop {data.total} {data.total === 1 ? 'style' : 'styles'}
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 content-start">
          {data.products.slice(0, 6).map((p, i) => (
            <div key={p._id} className={i >= 4 ? 'hidden lg:block' : ''}>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 md:mt-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">All occasions</p>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
          {available.map((o) => (
            <Link
              key={o.key}
              href={`/collection/${o.key}`}
              className="h-14 sm:h-20 rounded-2xl flex items-center justify-center text-center px-2 text-white text-xs sm:text-sm font-semibold hover:opacity-90 transition-opacity"
              style={{ background: o.gradient }}
            >
              {o.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
