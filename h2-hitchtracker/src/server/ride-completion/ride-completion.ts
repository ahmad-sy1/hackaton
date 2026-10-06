import type { RouteInfo } from "../ride-estimate/ride-estimate.types";
import type { DemoScenario, PriceComparison } from "./ride-completion.types";

// Fixed deviations on the estimate, as percentages, so both outcomes of
// AC-02.4 can be shown: "normal" stays under the 20% limit, "detour" goes over.
const SCENARIOS: Record<DemoScenario, { distance: number; duration: number }> =
  {
    normal: { distance: 105, duration: 105 },
    detour: { distance: 125, duration: 130 },
  };

/** The scenario comes from a form, so anything else counts as invalid. */
export function parseScenario(raw: unknown): DemoScenario | null {
  return raw === "normal" || raw === "detour" ? raw : null;
}

/** Distance and duration the simulated driver actually drove. */
export function simulateDrivenRide(
  estimate: RouteInfo,
  scenario: DemoScenario,
): RouteInfo {
  const { distance, duration } = SCENARIOS[scenario];
  return {
    distanceM: Math.round((estimate.distanceM * distance) / 100),
    durationS: Math.round((estimate.durationS * duration) / 100),
  };
}

/**
 * AC-02.3 and AC-02.4. The 20% limit is checked on whole cents
 * (final * 100 > estimate * 120), so no float rounding decides the warning.
 */
export function compareWithEstimate(
  estimatedPriceCents: number,
  finalPriceCents: number,
): PriceComparison {
  const differenceCents = finalPriceCents - estimatedPriceCents;
  return {
    differenceCents,
    differencePercent: Math.round(
      (differenceCents * 100) / estimatedPriceCents,
    ),
    exceedsThreshold: finalPriceCents * 100 > estimatedPriceCents * 120,
  };
}
