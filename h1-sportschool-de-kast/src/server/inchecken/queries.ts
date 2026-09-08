import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "../../db";
import { subscriptions, users, visitLogs } from "../../db/schema";
import type { IncheckPoort, LidMetAbonnement, LogInvoer } from "./toegang";

/** Drizzle-implementatie van de incheckpoort. Alle databasetoegang zit hier. */
export const drizzleIncheckPoort: IncheckPoort = {
  async zoekLidMetAbonnement(lidId: number): Promise<LidMetAbonnement | null> {
    const [rij] = await db
      .select({
        id: users.id,
        firstname: users.firstname,
        lastname: users.lastname,
        pinHash: users.pinHash,
        subscriptionEnd: users.subscriptionEnd,
        abonnementId: subscriptions.subscriptionId,
        limiet: subscriptions.subscriptionLimit,
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

  async telGeslaagdeBezoekenSinds(lidId: number, vanaf: Date): Promise<number> {
    // AC1: tellen via een query op visit_logs, geen tellerkolom. Alleen
    // geslaagde bezoeken vanaf de laatste maandag tellen mee.
    const [rij] = await db
      .select({ aantal: sql<number>`cast(count(*) as int)` })
      .from(visitLogs)
      .where(
        and(
          eq(visitLogs.userId, lidId),
          eq(visitLogs.accessGranted, true),
          gte(visitLogs.visitDate, vanaf),
        ),
      );

    return rij?.aantal ?? 0;
  },

  async logPoging(invoer: LogInvoer): Promise<void> {
    // AC4: elke poging wordt gelogd — geslaagd én geweigerd.
    await db.insert(visitLogs).values({
      userId: invoer.lidId,
      subscriptionTypeId: invoer.abonnementId,
      accessGranted: invoer.toegangVerleend,
      visitDate: invoer.wanneer,
    });
  },
};
