import { anonimiseerGrens, lokaleDatum } from "../../lib/datum";
import type {
  AnonimiseerPoort,
  AnonimiseerResultaat,
  AnonimiseerStatus,
} from "./anonimiseren.types";

/**
 * Haalt op hoeveel bezoeklogs van vóór de grens nog een lidnummer bevatten.
 *
 * `nu` is injecteerbaar zodat een test de grens vastlegt.
 */
export async function haalStatus(
  poort: AnonimiseerPoort,
  nu: Date = new Date(),
): Promise<AnonimiseerStatus> {
  const grens = anonimiseerGrens(nu);
  const aantal = await poort.telTeAnonimiseren(grens);
  return { aantal, grens: lokaleDatum(grens) };
}

/**
 * Anonimiseert bezoeklogs van vóór de grens: zet `user_id` op NULL.
 *
 * Telt eerst hoeveel rijen in aanmerking komen, zodat "niets_te_doen"
 * teruggegeven wordt zonder een overbodige update-query. Al geanonimiseerde
 * rijen (`user_id` al NULL) tellen niet mee.
 */
export async function anonimiseerOudeLogs(
  poort: AnonimiseerPoort,
  nu: Date = new Date(),
): Promise<AnonimiseerResultaat> {
  const grens = anonimiseerGrens(nu);
  const teAnonimiseren = await poort.telTeAnonimiseren(grens);
  if (teAnonimiseren === 0) {
    return { status: "niets_te_doen" };
  }

  const aantal = await poort.anonimiseerTot(grens);
  return { status: "gedaan", aantal };
}
