"use server";

import { drizzleIncheckPoort } from "./queries";
import { verwerkIncheck } from "./toegang";
import type { IncheckResultaat } from "./toegang.types";

/**
 * Server action voor het inchecken aan de deurzuil.
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
