import { calculatePriceCents } from "@/src/lib/price";
import type {
  EstimateData,
  EstimateResult,
  MissingInput,
  NoEstimate,
  ValidatedInput,
} from "./ride-estimate.types";

// User-facing texts from the acceptance criteria, so they stay Dutch.
export const MISSING_INPUT_MESSAGE = "Kies een vertrekpunt en een bestemming.";
export const NO_ESTIMATE_MESSAGE =
  "In deze stad is nog geen tarief bekend. Een schatting is niet mogelijk.";

// Same rule as the browser check on the start screen; 9 digits always fit in int4.
const ID_PATTERN = /^\d{1,9}$/;

// Accepts any uuid version; Postgres rejects a malformed uuid with an error.
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** AC-01.1: both points are required and must differ. */
export function validateInput(
  originRaw: unknown,
  destinationRaw: unknown,
): ValidatedInput {
  const originId = parseId(originRaw);
  const destinationId = parseId(destinationRaw);
  if (originId === null || destinationId === null) return missingInput();
  if (originId === destinationId) return missingInput();
  return { status: "ok", originId, destinationId };
}

export function isRideId(id: unknown): id is string {
  return typeof id === "string" && UUID_PATTERN.test(id);
}

/**
 * Turns the fetched data into an estimate. The tariff belongs to the city of
 * the origin; without a route or an active tariff there is no estimate (AC-01.5).
 */
export function buildEstimate(data: EstimateData): EstimateResult {
  const { origin, destination, route, tariff } = data;
  // An id that does not exist in `locations` counts as not chosen.
  if (origin === null || destination === null) return missingInput();
  if (route === null || tariff === null) return noEstimate();

  return {
    status: "ok",
    estimate: {
      originId: origin.id,
      destinationId: destination.id,
      originName: origin.name,
      destinationName: destination.name,
      distanceM: route.distanceM,
      durationS: route.durationS,
      priceCents: calculatePriceCents(tariff, route.distanceM, route.durationS),
      tariff,
    },
  };
}

function parseId(raw: unknown): number | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!ID_PATTERN.test(trimmed)) return null;
  const id = Number(trimmed);
  return id > 0 ? id : null; // identity columns start at 1
}

function missingInput(): MissingInput {
  return { status: "missing_input", message: MISSING_INPUT_MESSAGE };
}

function noEstimate(): NoEstimate {
  return { status: "no_estimate", message: NO_ESTIMATE_MESSAGE };
}
