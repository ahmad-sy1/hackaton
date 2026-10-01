export interface PriceTariff {
  startFeeCents: number;
  perKmCents: number;
  perMinuteCents: number;
}

/**
 * Price of a ride in whole cents. Rounded once, at the end, so partial cents
 * from the distance and duration parts do not add up to a rounding error.
 */
export function calculatePriceCents(
  tariff: PriceTariff,
  distanceM: number,
  durationS: number,
): number {
  return Math.round(
    tariff.startFeeCents +
      (distanceM * tariff.perKmCents) / 1000 +
      (durationS * tariff.perMinuteCents) / 60,
  );
}
