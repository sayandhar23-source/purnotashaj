'use client';

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { SlidersHorizontal } from 'lucide-react';

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
      <div className="flex items-center gap-2 ml-auto relative">
        <div className="relative">
          <button
            onClick={() => setShowPriceFilter(!showPriceFilter)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm ${
              hasPriceFilter ? 'border-brand-500 text-brand-600 bg-brand-50' : 'border-gray-300 text-gray-600'
            }`}
          >
            <SlidersHorizontal size={14} />
            Price
          </button>
          {showPriceFilter && (
            <div className="absolute right-0 top-full mt-2 z-20 card p-4 w-64">
              <div className="flex gap-2 mb-3">
                <input
                  type="number"
                  placeholder="Min"
                  className="input text-sm"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Max"
                  className="input text-sm"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <button onClick={applyPriceFilter} className="btn-primary text-xs px-3 py-1.5 flex-1">
                  Apply
                </button>
                {hasPriceFilter && (
                  <button onClick={clearPriceFilter} className="btn-outline text-xs px-3 py-1.5">
                    Clear
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

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
    </div>
  );
}
