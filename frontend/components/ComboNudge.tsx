'use client';

import { Tag } from 'lucide-react';
import { useCombo } from '@/lib/combo-context';
import { useCurrency } from '@/lib/currency-context';

// "Add ₹X more to get flat ₹Y off" — with a progress bar across all the tiers.
// `compact` drops the bar and keeps just the one-line message.
export default function ComboNudge({
  subtotal,
  compact = false,
  className = '',
}: {
  subtotal: number;
  compact?: boolean;
  className?: string;
}) {
  const { enabled, tiers, getCombo } = useCombo();
  const { formatPrice } = useCurrency();

  if (!enabled || tiers.length === 0) return null;

  const { discount, next } = getCombo(subtotal);
  const topTier = tiers[tiers.length - 1];
  const progress = Math.min(100, (subtotal / topTier.minTotal) * 100);

  const message = next ? (
    <>
      {discount > 0 && (
        <span className="font-semibold text-brand-600">You&apos;ve unlocked {formatPrice(discount)} off! </span>
      )}
      Add <span className="font-semibold">{formatPrice(next.minTotal - subtotal)}</span> more to get flat{' '}
      <span className="font-semibold">{formatPrice(next.discount)} off</span>
    </>
  ) : (
    <span className="font-semibold text-brand-600">
      You&apos;ve unlocked the maximum — flat {formatPrice(discount)} off your order!
    </span>
  );

  return (
    <div className={`rounded-xl bg-brand-50 border border-brand-100 px-3.5 py-3 ${className}`}>
      <p className="flex items-start gap-2 text-xs sm:text-sm text-gray-700 leading-snug">
        <Tag size={15} className="text-brand-500 shrink-0 mt-0.5" />
        <span>{message}</span>
      </p>

      {!compact && (
        <div className="mt-3 mb-4 px-4">
          <div className="relative h-1.5 rounded-full bg-white">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-brand-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
            {tiers.map((t) => {
              const left = (t.minTotal / topTier.minTotal) * 100;
              const reached = subtotal >= t.minTotal;
              return (
                <div
                  key={t.minTotal}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                  style={{ left: `${left}%` }}
                >
                  <div
                    className={`w-3 h-3 rounded-full border-2 ${
                      reached ? 'bg-brand-500 border-brand-500' : 'bg-white border-brand-300'
                    }`}
                  />
                  <span className="absolute top-4 left-1/2 -translate-x-1/2 text-[10px] text-gray-500 whitespace-nowrap">
                    {formatPrice(t.discount)} off
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
