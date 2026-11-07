'use client';

import { Gift } from 'lucide-react';
import { useCombo } from '@/lib/combo-context';
import { useCart } from '@/lib/cart-context';
import { useCurrency } from '@/lib/currency-context';

// A slim gold strip at the very top: the combo offer, or — once there's something in the
// cart — how far away the next discount is.
export default function ComboStrip() {
  const { enabled, getCombo } = useCombo();
  const { total } = useCart();
  const { formatPrice } = useCurrency();
  const { tiers, next } = getCombo(total);
  if (!enabled || tiers.length === 0) return null;

  let text: string;
  if (total > 0 && next) text = `Add ${formatPrice(next.minTotal - total)} more to get flat ${formatPrice(next.discount)} off`;
  else if (total > 0) text = 'You have unlocked the biggest combo discount';
  else text = `${tiers.map((t) => `${formatPrice(t.discount)} off ${formatPrice(t.minTotal)}+`).join(' · ')} — applied automatically`;

  return (
    <div className="bg-[#D4A024] text-[#5C1010] text-[11px] sm:text-xs font-semibold text-center px-3 py-2 flex items-center justify-center gap-1.5">
      <Gift size={14} className="shrink-0" />
      <span>{text}</span>
    </div>
  );
}
