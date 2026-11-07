'use client';

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

export default function SortFilterBar({ resultCount }: { resultCount?: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [priceMin, setPriceMin] = useState(searchParams.get('priceMin') || '');
  const [priceMax, setPriceMax] = useState(searchParams.get('priceMax') || '');
  const [showPriceFilter, setShowPriceFilter] = useState(false);

  const currentSort = searchParams.get('sort') || 'newest';

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const applyPriceFilter = () => {
    updateParams({ priceMin: priceMin || null, priceMax: priceMax || null });
    setShowPriceFilter(false);
  };

  const clearPriceFilter = () => {
    setPriceMin('');
    setPriceMax('');
    updateParams({ priceMin: null, priceMax: null });
    setShowPriceFilter(false);
  };

  const hasPriceFilter = !!searchParams.get('priceMin') || !!searchParams.get('priceMax');

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      {resultCount !== undefined && (
        <p className="text-sm text-gray-500">{resultCount} product{resultCount === 1 ? '' : 's'}</p>
      )}
      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={() => setShowPriceFilter(true)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm ${
            hasPriceFilter ? 'border-brand-500 text-brand-600 bg-brand-50' : 'border-gray-300 text-gray-600'
          }`}
        >
          <SlidersHorizontal size={14} />
          Price
        </button>

        <select
          value={currentSort}
          onChange={(e) => updateParams({ sort: e.target.value === 'newest' ? null : e.target.value })}
          className="input text-sm w-auto py-2"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              Sort: {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Centered modal at every screen size — sidesteps all viewport-overflow
          math that broke on mobile with the old anchored-dropdown approach. */}
      {showPriceFilter && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30"
          onClick={() => setShowPriceFilter(false)}
        >
          <div className="card p-5 w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <p className="font-medium text-sm">Filter by price</p>
              <button onClick={() => setShowPriceFilter(false)} aria-label="Close">
                <X size={18} className="text-gray-400" />
              </button>
            </div>
            <div className="flex gap-2 mb-4">
              <input
                type="number"
                placeholder="Min"
                className="input text-sm min-w-0"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
              />
              <input
                type="number"
                placeholder="Max"
                className="input text-sm min-w-0"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button onClick={applyPriceFilter} className="btn-primary text-sm flex-1">
                Apply
              </button>
              {hasPriceFilter && (
                <button onClick={clearPriceFilter} className="btn-outline text-sm">
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
