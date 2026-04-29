export function calcDiscountPct(stdPrice: number, discountPrice: number): number {
  if (stdPrice <= 0) return 0;
  return Math.round(((stdPrice - discountPrice) / stdPrice) * 100);
}

export function calcSavings(stdPrice: number, discountPrice: number): number {
  return parseFloat((stdPrice - discountPrice).toFixed(2));
}
