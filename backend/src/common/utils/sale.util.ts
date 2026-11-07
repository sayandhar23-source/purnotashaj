export type SaleInfo = {
  isActive: boolean;
  effectivePrice: number;
  originalPrice: number;
  discountPercent: number;
  endsAt: Date | null;
};

/**
 * Computes whether a product's flash sale is currently active (enabled, has a
 * sale price, and within its optional start/end window), the effective price
 * to charge, and the discount percentage — all derived at read-time so there's
 * nothing stale to keep in sync.
 */
export function computeSaleInfo(product: {
  saleEnabled?: boolean;
  salePrice?: number;
  saleStartsAt?: Date | string;
  saleEndsAt?: Date | string;
  basePrice: number;
}): SaleInfo {
  const now = new Date();
  const startOk = !product.saleStartsAt || new Date(product.saleStartsAt) <= now;
  const endOk = !product.saleEndsAt || new Date(product.saleEndsAt) >= now;
  const isActive = !!product.saleEnabled && !!product.salePrice && startOk && endOk;

  const discountPercent =
    isActive && product.basePrice > 0
      ? Math.round(((product.basePrice - (product.salePrice as number)) / product.basePrice) * 100)
      : 0;

  return {
    isActive,
    effectivePrice: isActive ? (product.salePrice as number) : product.basePrice,
    originalPrice: product.basePrice,
    discountPercent,
    endsAt: product.saleEndsAt ? new Date(product.saleEndsAt) : null,
  };
}
