'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api';

export type ComboTier = { minTotal: number; discount: number };

// Same defaults as the backend — used instantly on first paint, then replaced
// by whatever admin has set in Settings once that loads.
export const DEFAULT_COMBO_TIERS: ComboTier[] = [
  { minTotal: 500, discount: 80 },
  { minTotal: 900, discount: 150 },
  { minTotal: 1500, discount: 250 },
];

export function computeCombo(subtotal: number, tiers: ComboTier[]) {
  const sorted = [...tiers].sort((a, b) => a.minTotal - b.minTotal);
  let applied: ComboTier | null = null;
  for (const t of sorted) if (subtotal >= t.minTotal) applied = t;
  const next = sorted.find((t) => subtotal < t.minTotal) || null;
  return {
    discount: applied ? Math.min(applied.discount, subtotal) : 0,
    applied,
    next,
    tiers: sorted,
  };
}

type ComboContextT = {
  enabled: boolean;
  tiers: ComboTier[];
  getCombo: (subtotal: number) => ReturnType<typeof computeCombo>;
};

const ComboContext = createContext<ComboContextT>({
  enabled: true,
  tiers: DEFAULT_COMBO_TIERS,
  getCombo: (subtotal) => computeCombo(subtotal, DEFAULT_COMBO_TIERS),
});

export function ComboProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(true);
  const [tiers, setTiers] = useState<ComboTier[]>(DEFAULT_COMBO_TIERS);

  useEffect(() => {
    api
      .get('/settings')
      .then((res) => {
        if (res.data?.comboDiscountEnabled === false) setEnabled(false);
        if (Array.isArray(res.data?.comboDiscountTiers) && res.data.comboDiscountTiers.length > 0) {
          setTiers(res.data.comboDiscountTiers);
        }
      })
      .catch(() => {}); // defaults are a fine fallback
  }, []);

  return (
    <ComboContext.Provider
      value={{
        enabled,
        tiers,
        getCombo: (subtotal) => computeCombo(subtotal, enabled ? tiers : []),
      }}
    >
      {children}
    </ComboContext.Provider>
  );
}

export const useCombo = () => useContext(ComboContext);
