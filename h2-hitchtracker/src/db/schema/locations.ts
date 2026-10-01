import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { cities } from "./cities";

/** Fixed pick-up points, so no GPS location of the traveller is stored. */
export const locations = pgTable("locations", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  cityId: integer("city_id")
    .notNull()
    .references(() => cities.id),
  name: varchar("name", { length: 150 }).notNull(),
});

export type Location = typeof locations.$inferSelect;
