export type ComboTier = { minTotal: number; discount: number };

// Matches what the store owner specified: flat ₹80 off from ₹500, ₹150 off
// from ₹900, ₹250 off from ₹1500. Admin can change these in Settings; these
// are only the defaults (and the fallback if settings can't be read).
export const DEFAULT_COMBO_TIERS: ComboTier[] = [
  { minTotal: 500, discount: 80 },
  { minTotal: 900, discount: 150 },
  { minTotal: 1500, discount: 250 },
];

// The highest tier whose threshold the subtotal has reached wins. Thresholds
// are inclusive ("500+" means exactly 500 qualifies). Tiers don't stack.
export function computeComboDiscount(subtotal: number, tiers: ComboTier[]) {
  const sorted = [...tiers].sort((a, b) => a.minTotal - b.minTotal);
  let applied: ComboTier | null = null;
  for (const tier of sorted) {
    if (subtotal >= tier.minTotal) applied = tier;
  }
  // Can never discount more than the subtotal itself
  const discount = applied ? Math.min(applied.discount, subtotal) : 0;
  return { discount, applied };
}
