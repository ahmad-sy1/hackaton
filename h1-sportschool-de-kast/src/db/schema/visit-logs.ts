import { boolean, integer, pgTable, timestamp } from "drizzle-orm/pg-core";
import { subscriptions } from "./subscriptions";
import { users } from "./users";

/**
 * Bezoeklog: elke toegangspoging, geslaagd én geweigerd.
 *
 * user_id is bewust nullable: het anonimiseren van logs ouder dan 14 dagen
 * zet deze kolom op NULL. subscription_type_id blijft staan, zodat de
 * sportschool nog kan zien wélk abonnementstype er langskwam zonder te
 * weten wie het was.
 */
export const visitLogs = pgTable("visit_logs", {
  visitId: integer("visit_id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  subscriptionTypeId: integer("subscription_type_id")
    .notNull()
    .references(() => subscriptions.subscriptionId),
  visitDate: timestamp("visit_date", { withTimezone: true })
    .notNull()
    .defaultNow(),
  accessGranted: boolean("access_granted").notNull(),
});

export type VisitLog = typeof visitLogs.$inferSelect;
