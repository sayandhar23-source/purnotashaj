'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Plus, Check } from 'lucide-react';
import { api } from '@/lib/api';
import { useCart } from '@/lib/cart-context';
import { useCurrency } from '@/lib/currency-context';
import ComboNudge from './ComboNudge';

type Recommended = {
  _id: string;
  slug: string;
  title: string;
  images: string[];
  basePrice: number;
  compareAtPrice?: number;
  variants?: unknown[];
  saleInfo?: { isActive: boolean; effectivePrice: number; originalPrice: number };
};

const effectivePrice = (p: Recommended) => (p.saleInfo?.isActive ? p.saleInfo.effectivePrice : p.basePrice);
const strikePrice = (p: Recommended) => (p.saleInfo?.isActive ? p.saleInfo.originalPrice : p.compareAtPrice);
// Products with variants need a size/colour/etc. chosen, which can't be done inline
const needsOptions = (p: Recommended) => (p.variants?.length ?? 0) > 0;

export default function CompleteTheLook({ productId }: { productId: string }) {
  const [items, setItems] = useState<Recommended[]>([]);
  const [added, setAdded] = useState<Set<string>>(new Set());
  const { addItem, total } = useCart();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    let cancelled = false;
    setItems([]);
    setAdded(new Set());
    api
      .get(`/products/${productId}/recommendations`)
      .then((res) => {
        if (!cancelled) setItems(res.data);
      })
      .catch(() => {}); // suggestions are a bonus — never let a failure show an error on the page
    return () => {
      cancelled = true;
    };
  }, [productId]);

  if (items.length === 0) return null;

  const addOne = (p: Recommended) => {
    addItem({
      productId: p._id,
      slug: p.slug,
      title: p.title,
      price: effectivePrice(p),
      quantity: 1,
      image: p.images?.[0],
    });
    setAdded((prev) => new Set(prev).add(p._id));
  };

  const addable = items.filter((p) => !needsOptions(p) && !added.has(p._id));

  const addAll = () => {
    addable.forEach(addOne);
    toast.success(`Added ${addable.length} item${addable.length > 1 ? 's' : ''} to cart`);
  };

  return (
    <section className="mt-8 max-w-md" aria-label="Complete the look">
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Complete the look</h2>
          <p className="text-xs text-gray-500">Pairs beautifully with this piece</p>
        </div>
        {addable.length > 1 && (
          <button onClick={addAll} className="text-xs font-medium text-brand-600 shrink-0">
            Add all
          </button>
        )}
      </div>

      <div className="space-y-2.5">
        {items.map((p) => {
          const strike = strikePrice(p);
          const isAdded = added.has(p._id);
          return (
            <div key={p._id} className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 bg-white">
              <Link
                href={`/products/${p.slug}`}
                className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0"
              >
                {p.images?.[0] && (
                  <Image src={p.images[0]} alt={p.title} fill sizes="64px" className="object-cover" />
                )}
              </Link>

              <div className="flex-1 min-w-0">
                <Link href={`/products/${p.slug}`} className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug">
                  {p.title}
                </Link>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm font-semibold">{formatPrice(effectivePrice(p))}</span>
                  {strike && strike > effectivePrice(p) && (
                    <span className="text-xs text-gray-400 line-through">{formatPrice(strike)}</span>
                  )}
                </div>
              </div>

              {needsOptions(p) ? (
                <Link
                  href={`/products/${p.slug}`}
                  className="shrink-0 text-xs font-medium border border-gray-300 rounded-full px-3 py-2"
                >
                  Options
                </Link>
              ) : (
                <button
                  onClick={() => addOne(p)}
                  className={`shrink-0 flex items-center gap-1 text-xs font-semibold rounded-full px-3 py-2 transition-colors ${
                    isAdded ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-brand-500 text-white'
                  }`}
                  aria-label={`Add ${p.title} to cart`}
                >
                  {isAdded ? <Check size={14} /> : <Plus size={14} />}
                  {isAdded ? 'Added' : 'Add'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <ComboNudge subtotal={total} compact className="mt-3" />
    </section>
  );
}
