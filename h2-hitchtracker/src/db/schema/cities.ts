import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const cities = pgTable("cities", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 100 }).notNull().unique(),
});

export type City = typeof cities.$inferSelect;
