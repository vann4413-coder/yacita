export function formatPrice(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatPriceShort(amount: number): string {
  return `${amount.toFixed(2).replace('.', ',')}€`;
}
