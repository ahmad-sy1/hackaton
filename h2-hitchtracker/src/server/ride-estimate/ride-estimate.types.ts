/**
 * Types for the ride estimate (US-01).
 *
 * The rules in `ride-estimate.ts` only see these plain shapes, never Drizzle:
 * the actions fetch the data first and pass it in.
 */

export interface LocationWithCity {
  id: number;
  name: string;
  cityId: number;
  cityName: string;
}

export interface ActiveTariff {
  id: number;
  cityName: string;
  startFeeCents: number;
  perKmCents: number;
  perMinuteCents: number;
}

export interface RouteInfo {
  distanceM: number;
  durationS: number;
}

export interface Estimate {
  originId: number;
  destinationId: number;
  originName: string;
  destinationName: string;
  distanceM: number;
  durationS: number;
  priceCents: number;
  tariff: ActiveTariff;
}

export interface MissingInput {
  status: "missing_input";
  message: string;
}

export interface NoEstimate {
  status: "no_estimate";
  message: string;
}

export type ValidatedInput =
  { status: "ok"; originId: number; destinationId: number } | MissingInput;

/** Expected outcomes are an explicit union, not exceptions. */
export type EstimateResult =
  { status: "ok"; estimate: Estimate } | MissingInput | NoEstimate;

/** Everything `buildEstimate` needs; null means "not found in the database". */
export interface EstimateData {
  origin: LocationWithCity | null;
  destination: LocationWithCity | null;
  route: RouteInfo | null;
  tariff: ActiveTariff | null;
}

/** State of the start screen form, as returned by `requestEstimate`. */
export interface RequestEstimateState {
  error: MissingInput | NoEstimate | null;
  /** The submitted selection, so the screen knows which choice the message is about. */
  originId: string;
  destinationId: string;
}

/** What the ride screen shows of a stored ride. */
export interface RideSummary {
  id: string;
  originName: string;
  destinationName: string;
  estimatedDistanceM: number;
  estimatedDurationS: number;
  estimatedPriceCents: number;
  status: "geaccepteerd" | "afgerond";
  /** Null until the ride is completed (US-02). */
  actualDistanceM: number | null;
  actualDurationS: number | null;
  finalPriceCents: number | null;
}
