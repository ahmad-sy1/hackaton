"use server";

import {
  anonimiseerOudeLogs,
  haalBezoeklogs,
  haalStatus,
} from "./anonimiseren";
import { drizzleAnonimiseerPoort } from "./queries";
import type {
  AnonimiseerResultaat,
  AnonimiseerStatus,
  BezoeklogWeergave,
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

export async function bezoeklogsOphalen(): Promise<BezoeklogWeergave[]> {
  return haalBezoeklogs(drizzleAnonimiseerPoort);
}
