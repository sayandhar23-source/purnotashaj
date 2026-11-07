'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api';

// Maps a detected country to the currency its visitors would expect to see.
// Not exhaustive — anything not listed just falls back to showing INR as-is.
const COUNTRY_TO_CURRENCY: Record<string, string> = {
  US: 'USD', CA: 'CAD', GB: 'GBP', AU: 'AUD', NZ: 'NZD',
  JP: 'JPY', CN: 'CNY', SG: 'SGD', HK: 'HKD', CH: 'CHF',
  SE: 'SEK', NO: 'NOK', DK: 'DKK', MX: 'MXN', ZA: 'ZAR',
  BR: 'BRL', KR: 'KRW', TH: 'THB', PL: 'PLN',
  DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR', NL: 'EUR',
  IE: 'EUR', PT: 'EUR', BE: 'EUR', AT: 'EUR', FI: 'EUR', GR: 'EUR',
};

type CurrencyContextT = {
  currency: string; // 'INR' when no conversion applies
  formatPrice: (inrAmount: number) => string;
};

const CurrencyContext = createContext<CurrencyContextT>({
  currency: 'INR',
  formatPrice: (amount) => `₹${amount}`,
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState('INR');
  const [rate, setRate] = useState<number | null>(null);

  useEffect(() => {
    api
      .get('/geo/me')
      .then(async (geoRes) => {
        const countryCode = geoRes.data?.countryCode;
        if (!countryCode || countryCode === 'IN') return; // India (or unknown) — stay in INR

        const targetCurrency = COUNTRY_TO_CURRENCY[countryCode];
        if (!targetCurrency) return; // no mapping for this country — stay in INR

        const ratesRes = await api.get('/currency/rates');
        const targetRate = ratesRes.data?.rates?.[targetCurrency];
        if (!targetRate) return; // rate unavailable for this currency — stay in INR

        setCurrency(targetCurrency);
        setRate(targetRate);
      })
      .catch(() => {}); // fails quietly — INR display is a perfectly fine default
  }, []);

  const formatPrice = (inrAmount: number) => {
    if (currency === 'INR' || !rate) return `₹${inrAmount}`;
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency,
        maximumFractionDigits: 2,
      }).format(inrAmount * rate);
    } catch {
      return `₹${inrAmount}`;
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, formatPrice }}>{children}</CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);
