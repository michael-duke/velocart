function formatCurrency(priceCents) {
  return (Math.round(priceCents) / 100).toFixed(2);
}

export function formatTaxCent(priceCents) {
  const taxRate = 0.13; // 13% HST for Ontario
  const taxCents = priceCents * taxRate;
  return taxCents;
}

export default formatCurrency;
