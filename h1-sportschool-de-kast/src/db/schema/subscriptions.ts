import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

/**
 * Abonnementstypen.
 * subscription_limit = maximaal aantal bezoeken per week.
 * NULL betekent onbeperkt (Premium) — zie onderbouwing in het ontwerpdocument.
 */
export const subscriptions = pgTable("Subscriptions", {
  subscriptionId: integer("subscription_id")
    .primaryKey()
    .generatedAlwaysAsIdentity(),
  subscriptionName: varchar("subscription_name", { length: 50 }).notNull(),
  subscriptionLimit: integer("subscription_limit"),
});

export type Subscription = typeof subscriptions.$inferSelect;
