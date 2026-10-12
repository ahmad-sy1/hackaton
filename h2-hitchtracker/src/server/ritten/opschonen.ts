import { lt } from "drizzle-orm";
import { db } from "@/src/db";
import { rides } from "@/src/db/schema";

// Retention period from the design: long enough to handle a complaint, no longer.
const RETENTION_DAYS = 30;

async function deleteOldRides() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);

  const deleted = await db
    .delete(rides)
    .where(lt(rides.acceptedAt, cutoff))
    .returning({ id: rides.id });

  console.log(
    `${deleted.length} rit(ten) ouder dan ${RETENTION_DAYS} dagen verwijderd.`,
  );
}

deleteOldRides()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
