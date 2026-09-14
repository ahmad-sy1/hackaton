"use server";

import { anonimiseerOudeLogs, haalStatus } from "./anonimiseren";
import { drizzleAnonimiseerPoort } from "./queries";
import type {
  AnonimiseerResultaat,
  AnonimiseerStatus,
} from "./anonimiseren.types";

/**
 * Server actions voor het anonimiseren van bezoeklogs (AVG).
 *
 * Dunne schil: de businessregels staan in `anonimiseren.ts`, de
 * databasetoegang in `drizzleAnonimiseerPoort`.
 */

export async function statusOphalen(): Promise<AnonimiseerStatus> {
  return haalStatus(drizzleAnonimiseerPoort);
}

export async function oudeLogsAnonimiseren(): Promise<AnonimiseerResultaat> {
  return anonimiseerOudeLogs(drizzleAnonimiseerPoort);
}
