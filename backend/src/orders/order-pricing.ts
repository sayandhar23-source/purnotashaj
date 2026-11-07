import { computeSaleInfo } from '../common/utils/sale.util';

// What the browser claims is in the cart. Only product/variant/quantity are
// believed — `price` is used purely to notice that a price has gone UP since
// the customer last saw it, never to decide what they're charged.
export type RequestedLine = { product: string; variantId?: string; quantity: number; price: number };

// What the order will actually contain — every field comes from the database.
export type TrustedLine = {
  product: string;
  variantId?: string;
  title: string;
  variantName?: string;
  price: number;
  quantity: number;
  image?: string;
};

export type PricingProblem = {
  code: 'UNAVAILABLE' | 'OUT_OF_STOCK' | 'INSUFFICIENT_STOCK' | 'PRICE_INCREASED' | 'INVALID_VARIANT';
  product: string;
  variantId?: string;
  title: string;
  available?: number; // INSUFFICIENT_STOCK: how many are left
  newPrice?: number; // PRICE_INCREASED: the current price
};

const round2 = (n: number) => Math.round(n * 100) / 100;

// Prices every line from the product records, mirroring exactly how the
// storefront decides the price it shows:
//   • product has variants  -> the chosen variant's price (sales don't apply to variants)
//   • simple product        -> active sale price if there is one, else base price
// Titles, variant names and images are also taken from the database, so a
// tampered request can't put arbitrary text into admin emails/Telegram alerts.
export function priceOrderLines(
  requested: RequestedLine[],
  products: any[],
): { lines: TrustedLine[]; problems: PricingProblem[] } {
  const byId = new Map<string, any>(products.map((p) => [String(p._id), p]));

  // The same product+variant sent on several lines is merged, so quantity limits
  // and stock checks can't be dodged by splitting a purchase across lines.
  const merged = new Map<string, RequestedLine>();
  for (const line of requested) {
    const key = `${line.product}|${line.variantId || ''}`;
    const existing = merged.get(key);
    if (existing) {
      existing.quantity += line.quantity;
      existing.price = Math.min(existing.price, line.price);
    } else {
      merged.set(key, { ...line });
    }
  }

  const lines: TrustedLine[] = [];
  const problems: PricingProblem[] = [];

  for (const line of merged.values()) {
    const product = byId.get(line.product);
    const fallbackTitle = product?.title || 'An item in your cart';

    if (!product || product.isActive === false) {
      problems.push({ code: 'UNAVAILABLE', product: line.product, variantId: line.variantId, title: fallbackTitle });
      continue;
    }

    const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;
    let unitPrice: number;
    let variantName: string | undefined;
    let image: string | undefined = product.images?.[0];
    let stockLimit: number | null = null; // null = not tracked, unlimited

    if (hasVariants) {
      const variant = line.variantId
        ? product.variants.find((v: any) => String(v._id) === String(line.variantId))
        : undefined;
      if (!variant) {
        problems.push({ code: 'INVALID_VARIANT', product: line.product, variantId: line.variantId, title: product.title });
        continue;
      }
      unitPrice = variant.price;
      variantName = variant.name;
      image = variant.image || image;
      stockLimit = variant.stock ?? 0;
    } else {
      if (line.variantId) {
        // The cart refers to an option this product no longer has
        problems.push({ code: 'INVALID_VARIANT', product: line.product, variantId: line.variantId, title: product.title });
        continue;
      }
      const sale = computeSaleInfo(product);
      unitPrice = sale.isActive ? sale.effectivePrice : product.basePrice;
      if (product.trackStock) stockLimit = product.stock ?? 0;
    }

    unitPrice = round2(unitPrice);

    if (stockLimit !== null) {
      if (stockLimit <= 0) {
        problems.push({ code: 'OUT_OF_STOCK', product: line.product, variantId: line.variantId, title: product.title });
        continue;
      }
      if (line.quantity > stockLimit) {
        problems.push({
          code: 'INSUFFICIENT_STOCK',
          product: line.product,
          variantId: line.variantId,
          title: product.title,
          available: stockLimit,
        });
        continue;
      }
    }

    // A price that went DOWN is simply honoured. A price that went UP is never
    // applied silently — the customer is told first and confirms again.
    if (unitPrice > line.price + 0.005) {
      problems.push({
        code: 'PRICE_INCREASED',
        product: line.product,
        variantId: line.variantId,
        title: product.title,
        newPrice: unitPrice,
      });
      continue;
    }

    lines.push({
      product: line.product,
      variantId: line.variantId,
      title: product.title,
      variantName,
      price: unitPrice,
      quantity: line.quantity,
      image,
    });
  }

  return { lines, problems };
}

// A single readable sentence for the customer
export function describeProblems(problems: PricingProblem[]): string {
  const parts = problems.slice(0, 3).map((p) => {
    switch (p.code) {
      case 'UNAVAILABLE':
        return `"${p.title}" is no longer available`;
      case 'OUT_OF_STOCK':
        return `"${p.title}" is out of stock`;
      case 'INSUFFICIENT_STOCK':
        return `only ${p.available} left of "${p.title}"`;
      case 'PRICE_INCREASED':
        return `the price of "${p.title}" changed to ₹${p.newPrice}`;
      case 'INVALID_VARIANT':
        return `the selected option for "${p.title}" is no longer available`;
    }
  });
  const more = problems.length > 3 ? ` (and ${problems.length - 3} more)` : '';
  const sentence = parts.join('; ') + more;
  return `Your cart was updated: ${sentence}. Please review it and try again.`;
}
