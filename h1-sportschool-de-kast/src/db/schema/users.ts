import { date, integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { subscriptions } from "./subscriptions";

/**
 * Leden.
 * pin_hash bevat nooit de pincode zelf, alleen de bcrypt-hash.
 * subscription_end NULL betekent: niet opgezegd.
 */
export const users = pgTable("Users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  subscriptionId: integer("subscription_id")
    .notNull()
    .references(() => subscriptions.subscriptionId),
  firstname: varchar("firstname", { length: 100 }).notNull(),
  lastname: varchar("lastname", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phoneNumber: varchar("phone_number", { length: 20 }),
  pinHash: varchar("pin_hash", { length: 255 }).notNull(),
  subscriptionStart: date("subscription_start").notNull(),
  subscriptionEnd: date("subscription_end"),
});

export type User = typeof users.$inferSelect;
