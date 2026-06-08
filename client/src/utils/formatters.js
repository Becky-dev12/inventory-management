export const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'ETB',
  currencyDisplay: 'narrowSymbol'
});

export const number = new Intl.NumberFormat('en-US');

export function formatDate(value) {
  return new Intl.DateTimeFormat('en-ET', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(value));
}
