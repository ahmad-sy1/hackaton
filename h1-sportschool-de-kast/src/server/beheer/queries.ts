import { and, desc, eq, isNotNull, lt } from "drizzle-orm";
import { db } from "../../db";
import { subscriptions, users, visitLogs } from "../../db/schema";
import type { AnonimiseerPoort, Bezoeklog } from "./anonimiseren.types";

/** Drizzle-implementatie van de anonimiseerpoort. Alle databasetoegang zit hier. */
export const drizzleAnonimiseerPoort: AnonimiseerPoort = {
  async telTeAnonimiseren(grens: Date): Promise<number> {
    return db.$count(
      visitLogs,
      and(lt(visitLogs.visitDate, grens), isNotNull(visitLogs.userId)),
    );
  },

  async anonimiseerTot(grens: Date): Promise<number> {
    const rijen = await db
      .update(visitLogs)
      .set({ userId: null })
      .where(and(lt(visitLogs.visitDate, grens), isNotNull(visitLogs.userId)))
      .returning({ visitId: visitLogs.visitId });

    return rijen.length;
  },

  async haalBezoeklogs(): Promise<Bezoeklog[]> {
    const rijen = await db
      .select({
        visitId: visitLogs.visitId,
        voornaam: users.firstname,
        achternaam: users.lastname,
        abonnementsnaam: subscriptions.subscriptionName,
        bezoekmoment: visitLogs.visitDate,
        toegangVerleend: visitLogs.accessGranted,
      })
      .from(visitLogs)
      .leftJoin(users, eq(visitLogs.userId, users.id))
      .innerJoin(
        subscriptions,
        eq(visitLogs.subscriptionTypeId, subscriptions.subscriptionId),
      )
      .orderBy(desc(visitLogs.visitDate));

    return rijen.map((rij) => ({
      visitId: rij.visitId,
      naam: rij.voornaam === null ? null : `${rij.voornaam} ${rij.achternaam}`,
      abonnementsnaam: rij.abonnementsnaam,
      bezoekmoment: rij.bezoekmoment,
      toegangVerleend: rij.toegangVerleend,
    }));
  },
};
