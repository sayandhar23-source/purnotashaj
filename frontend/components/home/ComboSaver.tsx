'use client';

import Link from 'next/link';
import { useCombo } from '@/lib/combo-context';
import { useCart } from '@/lib/cart-context';
import { useCurrency } from '@/lib/currency-context';

// The combo tiers as steps. Reads the amounts you set in Admin → Settings, and the
// customer's real cart, so the steps fill in as they shop.
export default function ComboSaver() {
  const { enabled, getCombo } = useCombo();
  const { total } = useCart();
  const { formatPrice } = useCurrency();
  const { tiers, next } = getCombo(total);
  if (!enabled || tiers.length === 0) return null;

  const top = tiers[tiers.length - 1].minTotal;
  const progress = Math.min(100, (total / top) * 100);

  let message: string;
  if (total === 0) message = 'Add items to your cart to start saving.';
  else if (next) message = `Add ${formatPrice(next.minTotal - total)} more to unlock flat ${formatPrice(next.discount)} off.`;
  else message = 'You have unlocked the biggest combo discount.';

  return (
    <div className="rounded-3xl bg-[#FBF1E7] p-5 sm:p-6">
      <h3 className="font-semibold text-gray-900">Combo Saver</h3>
      <p className="text-sm text-gray-600 mt-0.5">The more you add, the more you save — applied automatically.</p>

      <div className="flex justify-between mt-5">
        {tiers.map((t) => {
          const done = total >= t.minTotal;
          return (
            <div key={t.minTotal} className="flex-1 text-center">
              <span
                className={`mx-auto flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full border-2 text-[11px] sm:text-xs font-bold ${
                  done ? 'bg-[#5C1010] border-[#5C1010] text-white' : 'bg-white border-[#D4A024] text-[#5C1010]'
                }`}
              >
                {formatPrice(t.discount)}
              </span>
              <span className="block mt-1.5 text-[11px] text-gray-500">at {formatPrice(t.minTotal)}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 h-1.5 rounded-full bg-white overflow-hidden">
        <div className="h-full rounded-full bg-[#5C1010] transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
      <p className="mt-3 text-sm text-gray-700">{message}</p>
      {total > 0 && (
        <Link href="/cart" className="inline-block mt-3 text-sm font-semibold text-[#5C1010] underline">
          View cart
        </Link>
      )}
    </div>
  );
}
