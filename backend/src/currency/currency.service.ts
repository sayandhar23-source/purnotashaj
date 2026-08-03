import { Injectable, Logger } from '@nestjs/common';

// A broad but sensible set of major currencies to offer conversion into —
// kept within Frankfurter's ~30 ECB-tracked currencies so lookups don't miss.
const TARGET_CURRENCIES = [
  'USD', 'GBP', 'CAD', 'EUR', 'AUD', 'JPY', 'CNY', 'SGD', 'CHF', 'NZD',
  'HKD', 'SEK', 'NOK', 'DKK', 'MXN', 'ZAR', 'BRL', 'KRW', 'THB', 'PLN',
];

@Injectable()
export class CurrencyService {
  private logger = new Logger(CurrencyService.name);
  private cache: { rates: Record<string, number>; updatedAt: number } | null = null;
  private readonly CACHE_MS = 6 * 60 * 60 * 1000; // 6 hours — plenty, since ECB only updates once/day anyway

  async getRates() {
    if (this.cache && Date.now() - this.cache.updatedAt < this.CACHE_MS) {
      return { base: 'INR', rates: this.cache.rates, updatedAt: this.cache.updatedAt };
    }

    try {
      const url = `https://api.frankfurter.dev/v2/rates?base=INR&quotes=${TARGET_CURRENCIES.join(',')}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Frankfurter returned ${res.status}`);
      const rows = await res.json();

      // The v2 API returns an array of { quote, rate } rows, not a single
      // object with a `rates` map — reshape it into the lookup we actually want.
      const rates: Record<string, number> = {};
      if (Array.isArray(rows)) {
        for (const row of rows) {
          if (row?.quote && typeof row.rate === 'number') rates[row.quote] = row.rate;
        }
      }

      this.cache = { rates, updatedAt: Date.now() };
      return { base: 'INR', rates: this.cache.rates, updatedAt: this.cache.updatedAt };
    } catch (err) {
      this.logger.error(`Failed to fetch exchange rates: ${err}`);
      // Serve stale cache if we have one rather than breaking price display entirely
      if (this.cache) return { base: 'INR', rates: this.cache.rates, updatedAt: this.cache.updatedAt };
      return { base: 'INR', rates: {}, updatedAt: null };
    }
  }
}
