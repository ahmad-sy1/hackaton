import { aliasedTable, and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/src/db";
import { cities, locations, rides, routes, tariffs } from "@/src/db/schema";
import { buildEstimate, isRideId, validateInput } from "./ride-estimate";
import type {
  ActiveTariff,
  Estimate,
  EstimateResult,
  LocationWithCity,
  RideSummary,
  RouteInfo,
} from "./ride-estimate.types";

const locationWithCityColumns = {
  id: locations.id,
  name: locations.name,
  cityId: cities.id,
  cityName: cities.name,
};

/** All pick-up points, grouped by city for the selects on the start screen. */
export async function getPickupPoints(): Promise<LocationWithCity[]> {
  return db
    .select(locationWithCityColumns)
    .from(locations)
    .innerJoin(cities, eq(locations.cityId, cities.id))
    .orderBy(asc(cities.name), asc(locations.name));
}

export async function getLocationWithCity(
  id: number,
): Promise<LocationWithCity | null> {
  const [row] = await db
    .select(locationWithCityColumns)
    .from(locations)
    .innerJoin(cities, eq(locations.cityId, cities.id))
    .where(eq(locations.id, id))
    .limit(1);
  return row ?? null;
}

/** The active tariff of a city; with several active ones the newest wins. */
export async function getActiveTariff(
  cityId: number,
): Promise<ActiveTariff | null> {
  const [row] = await db
    .select({
      id: tariffs.id,
      cityName: cities.name,
      startFeeCents: tariffs.startFeeCents,
      perKmCents: tariffs.perKmCents,
      perMinuteCents: tariffs.perMinuteCents,
    })
    .from(tariffs)
    .innerJoin(cities, eq(tariffs.cityId, cities.id))
    .where(and(eq(tariffs.cityId, cityId), eq(tariffs.isActive, true)))
    .orderBy(desc(tariffs.createdAt), desc(tariffs.id))
    .limit(1);
  return row ?? null;
}

export async function getRoute(
  originId: number,
  destinationId: number,
): Promise<RouteInfo | null> {
  const [row] = await db
    .select({ distanceM: routes.distanceM, durationS: routes.durationS })
    .from(routes)
    .where(
      and(
        eq(routes.originLocationId, originId),
        eq(routes.destinationLocationId, destinationId),
      ),
    )
    .limit(1);
  return row ?? null;
}

/** Stores an accepted estimate; status and accepted_at come from the defaults. */
export async function createRide(estimate: Estimate): Promise<string> {
  const [ride] = await db
    .insert(rides)
    .values({
      originLocationId: estimate.originId,
      destinationLocationId: estimate.destinationId,
      tariffId: estimate.tariff.id,
      estimatedDistanceM: estimate.distanceM,
      estimatedDurationS: estimate.durationS,
      estimatedPriceCents: estimate.priceCents,
    })
    .returning({ id: rides.id });
  return ride.id;
}

/** A stored ride with its pick-up point names, or null for an unknown id. */
export async function getRideById(id: string): Promise<RideSummary | null> {
  if (!isRideId(id)) return null;

  const origin = aliasedTable(locations, "origin");
  const destination = aliasedTable(locations, "destination");
  const [row] = await db
    .select({
      id: rides.id,
      originName: origin.name,
      destinationName: destination.name,
      estimatedDistanceM: rides.estimatedDistanceM,
      estimatedDurationS: rides.estimatedDurationS,
      estimatedPriceCents: rides.estimatedPriceCents,
      status: rides.status,
      actualDistanceM: rides.actualDistanceM,
      actualDurationS: rides.actualDurationS,
      finalPriceCents: rides.finalPriceCents,
    })
    .from(rides)
    .innerJoin(origin, eq(rides.originLocationId, origin.id))
    .innerJoin(destination, eq(rides.destinationLocationId, destination.id))
    .where(eq(rides.id, id))
    .limit(1);
  return row ?? null;
}

/**
 * Validates the raw ids, fetches what the rules need and builds the estimate.
 * Read-only: nothing is stored until the traveller accepts (AC-01.4).
 */
export async function getEstimate(
  originRaw: unknown,
  destinationRaw: unknown,
): Promise<EstimateResult> {
  const input = validateInput(originRaw, destinationRaw);
  if (input.status !== "ok") return input;

  const [origin, destination] = await Promise.all([
    getLocationWithCity(input.originId),
    getLocationWithCity(input.destinationId),
  ]);
  const [route, tariff] =
    origin === null || destination === null
      ? [null, null]
      : await Promise.all([
          getRoute(origin.id, destination.id),
          getActiveTariff(origin.cityId),
        ]);

  return buildEstimate({ origin, destination, route, tariff });
}
