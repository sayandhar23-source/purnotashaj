// "Under ₹499" must mean what the customer is actually charged. The listing filter used
// basePrice only, so a ₹599 saree on sale at ₹449 was missing from "Under ₹499", and a
// ₹1,299 saree on sale at ₹899 wrongly appeared under "₹999 & up".
// Effective price = the sale price while a sale is active, otherwise the base price —
// the same rule computeSaleInfo uses everywhere else.
export function buildPriceConditions(min?: number, max?: number, now: Date = new Date()): any[] {
  const activeSale = {
    saleEnabled: true,
    $and: [
      { $or: [{ saleStartsAt: null }, { saleStartsAt: { $lte: now } }] },
      { $or: [{ saleEndsAt: null }, { saleEndsAt: { $gte: now } }] },
    ],
  };
  const conds: any[] = [];
  if (max !== undefined && Number.isFinite(max)) {
    conds.push({ $or: [{ basePrice: { $lte: max } }, { ...activeSale, salePrice: { $gt: 0, $lte: max } }] });
  }
  if (min !== undefined && Number.isFinite(min)) {
    conds.push({ basePrice: { $gte: min } });
    conds.push({ $nor: [{ ...activeSale, salePrice: { $gt: 0, $lt: min } }] });
  }
  return conds;
}
