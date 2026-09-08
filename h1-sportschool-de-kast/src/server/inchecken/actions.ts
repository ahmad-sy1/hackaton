"use server";

import { drizzleIncheckPoort } from "./queries";
import { verwerkIncheck, type IncheckResultaat } from "./toegang";

/**
 * Server action voor het inchecken aan de balie.
 *
 * Dunne schil: de businessregels staan in `verwerkIncheck`, de databasetoegang
 * in `drizzleIncheckPoort`.
 */
export async function checkIn(
  lidnummer: string,
  pincode: string,
): Promise<IncheckResultaat> {
  return verwerkIncheck(lidnummer, pincode, drizzleIncheckPoort);
}
