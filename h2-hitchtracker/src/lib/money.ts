const euro = new Intl.NumberFormat("nl-NL", {
  style: "currency",
  currency: "EUR",
});

/** 5380 -> "€ 53,80". Amounts stay integers in cents; dividing is display only. */
export function formatEuro(cents: number): string {
  return euro.format(cents / 100);
}

/** 1240 -> "+ € 12,40", -300 -> "− € 3,00". */
export function formatEuroDifference(cents: number): string {
  const sign = cents < 0 ? "−" : "+";
  return `${sign} ${formatEuro(Math.abs(cents))}`;
}

/** 25 -> "+25%", -3 -> "−3%". */
export function formatPercentDifference(percent: number): string {
  // A small negative difference rounds to -0; keep its minus so the sign
  // matches formatEuroDifference.
  const sign = percent < 0 || Object.is(percent, -0) ? "−" : "+";
  return `${sign}${Math.abs(percent)}%`;
}
