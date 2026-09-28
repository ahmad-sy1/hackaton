"use server";

import { haalOverzicht, zegOp } from "./abonnement";
import { drizzleAbonnementPoort } from "./queries";
import type { OpzegResultaat, OverzichtResultaat } from "./abonnement.types";

/**
 * Server actions voor het abonnementsbeheer (US-02).
 *
 * Dunne schil: de businessregels staan in `abonnement.ts`, de databasetoegang
 * in `drizzleAbonnementPoort`.
 */

export async function overzichtOphalen(
  lidnummer: string,
  pincode: string,
): Promise<OverzichtResultaat> {
  return haalOverzicht(lidnummer, pincode, drizzleAbonnementPoort);
}

export async function abonnementOpzeggen(
  lidnummer: string,
  pincode: string,
): Promise<OpzegResultaat> {
  return zegOp(lidnummer, pincode, drizzleAbonnementPoort);
}
