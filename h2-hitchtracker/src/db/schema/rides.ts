import { integer, pgEnum, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { locations } from "./locations";
import { tariffs } from "./tariffs";

export const rideStatus = pgEnum("ride_status", ["geaccepteerd", "afgerond"]);

/**
 * The id is a uuid so a ride link cannot be guessed (no /rit/5, /rit/6).
 * The tariff is referenced so the estimate stays traceable after a tariff change.
 */
export const rides = pgTable("rides", {
  id: uuid("id").primaryKey().defaultRandom(),
  originLocationId: integer("origin_location_id")
    .notNull()
    .references(() => locations.id),
  destinationLocationId: integer("destination_location_id")
    .notNull()
    .references(() => locations.id),
  tariffId: integer("tariff_id")
    .notNull()
    .references(() => tariffs.id),
  status: rideStatus("status").notNull().default("geaccepteerd"),
  estimatedDistanceM: integer("estimated_distance_m").notNull(),
  estimatedDurationS: integer("estimated_duration_s").notNull(),
  estimatedPriceCents: integer("estimated_price_cents").notNull(),
  actualDistanceM: integer("actual_distance_m"),
  actualDurationS: integer("actual_duration_s"),
  finalPriceCents: integer("final_price_cents"),
  acceptedAt: timestamp("accepted_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export type Ride = typeof rides.$inferSelect;
