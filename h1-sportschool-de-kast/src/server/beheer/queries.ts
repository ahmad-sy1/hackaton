import { and, isNotNull, lt } from "drizzle-orm";
import { db } from "../../db";
import { visitLogs } from "../../db/schema";
import type { AnonimiseerPoort } from "./anonimiseren.types";

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
};
