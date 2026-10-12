import { execFileSync } from "node:child_process";
import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@/src/db/schema";
import { rides, tariffs } from "@/src/db/schema";
import { testDatabaseUrl } from "./test-database-url";

// One pool for all spec files in the worker; it closes itself once idle, so
// no spec file has to end it (and break it for the next file).
const db = drizzle({
  connection: { connectionString: testDatabaseUrl(), allowExitOnIdle: true },
  schema,
});

// The scripts read .env, but a DATABASE_URL in the environment wins over it.
const scriptEnv = { ...process.env, DATABASE_URL: testDatabaseUrl() };

/**
 * Clean start from the testplan: empty tables and the seed loaded again.
 * RESTART IDENTITY keeps the ids from the testplan (Centraal Station = 1).
 */
export async function resetDatabase() {
  await db.execute(
    sql`TRUNCATE rides, routes, locations, tariffs, cities RESTART IDENTITY CASCADE`,
  );
  execFileSync("npm", ["run", "db:seed"], { env: scriptEnv, stdio: "pipe" });
}

/** Output of `npm run ritten:opschonen` against the test database. */
export function runCleanupScript(): string {
  return execFileSync("npm", ["run", "ritten:opschonen"], {
    env: scriptEnv,
    encoding: "utf8",
  });
}

export async function countRides(): Promise<number> {
  return db.$count(rides);
}

export async function getRide(id: string) {
  const [ride] = await db.select().from(rides).where(eq(rides.id, id));
  return ride;
}

export function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

// Centraal Station → Schiphol with tariff 1, as in the seed.
const centraalToSchiphol = {
  originLocationId: 1,
  destinationLocationId: 2,
  tariffId: 1,
  estimatedDistanceM: 17000,
  estimatedDurationS: 1500,
  estimatedPriceCents: 5380,
};

/** Fixtures F-0, F-NEG, F-20 and F-20+: a completed ride with a chosen final price. */
export async function insertCompletedRide(
  finalPriceCents: number,
): Promise<string> {
  const [ride] = await db
    .insert(rides)
    .values({
      ...centraalToSchiphol,
      status: "afgerond",
      actualDistanceM: 17000,
      actualDurationS: 1500,
      finalPriceCents,
      completedAt: new Date(),
    })
    .returning({ id: rides.id });
  return ride.id;
}

/** Fixtures for TC-27 and TC-28: an accepted ride from a given moment. */
export async function insertAcceptedRide(acceptedAt: Date): Promise<string> {
  const [ride] = await db
    .insert(rides)
    .values({ ...centraalToSchiphol, acceptedAt })
    .returning({ id: rides.id });
  return ride.id;
}

/** Fixture for TC-16: tariff 1 inactive, a new active tariff for Amsterdam. */
export async function replaceAmsterdamTariff() {
  await db.update(tariffs).set({ isActive: false }).where(eq(tariffs.id, 1));
  await db.insert(tariffs).values({
    cityId: 1,
    startFeeCents: 500,
    perKmCents: 300,
    perMinuteCents: 50,
    isActive: true,
  });
}
