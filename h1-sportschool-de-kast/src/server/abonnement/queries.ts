import { eq } from "drizzle-orm";
import { db } from "../../db";
import { subscriptions, users } from "../../db/schema";
import type { AbonnementPoort, LidAbonnement } from "./abonnement.types";

/** Drizzle-implementatie van de abonnementspoort. Alle databasetoegang zit hier. */
export const drizzleAbonnementPoort: AbonnementPoort = {
  async zoekLidAbonnement(lidId: number): Promise<LidAbonnement | null> {
    const [rij] = await db
      .select({
        id: users.id,
        firstname: users.firstname,
        lastname: users.lastname,
        pinHash: users.pinHash,
        abonnementsnaam: subscriptions.subscriptionName,
        startdatum: users.subscriptionStart,
        einddatum: users.subscriptionEnd,
      })
      .from(users)
      .innerJoin(
        subscriptions,
        eq(users.subscriptionId, subscriptions.subscriptionId),
      )
      .where(eq(users.id, lidId))
      .limit(1);

    return rij ?? null;
  },

  async zetEinddatum(lidId: number, einddatum: string): Promise<void> {
    await db
      .update(users)
      .set({ subscriptionEnd: einddatum })
      .where(eq(users.id, lidId));
  },
};
