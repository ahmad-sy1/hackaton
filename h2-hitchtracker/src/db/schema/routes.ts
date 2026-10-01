import { integer, pgTable, uniqueIndex } from "drizzle-orm/pg-core";
import { locations } from "./locations";

export const routes = pgTable(
  "routes",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    originLocationId: integer("origin_location_id")
      .notNull()
      .references(() => locations.id),
    destinationLocationId: integer("destination_location_id")
      .notNull()
      .references(() => locations.id),
    distanceM: integer("distance_m").notNull(),
    durationS: integer("duration_s").notNull(),
  },
  (table) => [
    uniqueIndex("routes_origin_destination_idx").on(
      table.originLocationId,
      table.destinationLocationId,
    ),
  ],
);

export type Route = typeof routes.$inferSelect;
