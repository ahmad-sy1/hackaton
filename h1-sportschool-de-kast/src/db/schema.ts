import {
  boolean,
  date,
  integer,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

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

export type Subscription = typeof subscriptions.$inferSelect;
export type User = typeof users.$inferSelect;
export type VisitLog = typeof visitLogs.$inferSelect;
