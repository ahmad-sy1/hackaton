import { boolean, integer, pgTable, timestamp } from "drizzle-orm/pg-core";
import { cities } from "./cities";

/** Amounts are in cents, so prices never depend on float rounding. */
export const tariffs = pgTable("tariffs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  cityId: integer("city_id")
    .notNull()
    .references(() => cities.id),
  startFeeCents: integer("start_fee_cents").notNull(),
  perKmCents: integer("per_km_cents").notNull(),
  perMinuteCents: integer("per_minute_cents").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Tariff = typeof tariffs.$inferSelect;
