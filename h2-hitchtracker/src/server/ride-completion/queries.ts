import { and, eq } from "drizzle-orm";
import { db } from "@/src/db";
import { rides, tariffs } from "@/src/db/schema";
import { calculatePriceCents } from "@/src/lib/price";
import { simulateDrivenRide } from "./ride-completion";
import type { DemoScenario, RideToComplete } from "./ride-completion.types";

/**
 * An accepted ride with the tariff it was estimated with. A completed or
 * unknown ride gives null, so a ride can only be completed once.
 */
async function getRideToComplete(id: string): Promise<RideToComplete | null> {
  const [row] = await db
    .select({
      id: rides.id,
      estimatedDistanceM: rides.estimatedDistanceM,
      estimatedDurationS: rides.estimatedDurationS,
      startFeeCents: tariffs.startFeeCents,
      perKmCents: tariffs.perKmCents,
      perMinuteCents: tariffs.perMinuteCents,
    })
    .from(rides)
    .innerJoin(tariffs, eq(rides.tariffId, tariffs.id))
    .where(and(eq(rides.id, id), eq(rides.status, "geaccepteerd")))
    .limit(1);
  return row ?? null;
}

/**
 * Stores the driven distance and duration and the final price. The price is
 * calculated here with the ride's own tariff, never taken from input (AC-02.2).
 */
export async function completeRide(
  id: string,
  scenario: DemoScenario,
): Promise<void> {
  const ride = await getRideToComplete(id);
  if (ride === null) return;

  const driven = simulateDrivenRide(
    { distanceM: ride.estimatedDistanceM, durationS: ride.estimatedDurationS },
    scenario,
  );

  await db
    .update(rides)
    .set({
      status: "afgerond",
      actualDistanceM: driven.distanceM,
      actualDurationS: driven.durationS,
      finalPriceCents: calculatePriceCents(
        ride,
        driven.distanceM,
        driven.durationS,
      ),
      completedAt: new Date(),
    })
    // The status check guards against a second click completing it twice.
    .where(and(eq(rides.id, ride.id), eq(rides.status, "geaccepteerd")));
}
