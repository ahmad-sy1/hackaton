/**
 * Types for completing a ride and checking the final price (US-02).
 *
 * Like the estimate rules, `ride-completion.ts` only sees these plain shapes.
 */

/** The demo button simulates the driver; see "Haalbaarheid: afbakening". */
export type DemoScenario = "normal" | "detour";

export interface DrivenRide {
  distanceM: number;
  durationS: number;
}

export interface PriceComparison {
  differenceCents: number;
  /** Rounded to a whole percent, for display only. */
  differencePercent: number;
  /** AC-02.4: more than 20% above the estimate. */
  exceedsThreshold: boolean;
}

/** What `completeRide` needs of a stored ride, including its own tariff. */
export interface RideToComplete {
  id: string;
  estimatedDistanceM: number;
  estimatedDurationS: number;
  startFeeCents: number;
  perKmCents: number;
  perMinuteCents: number;
}
