import { anonimiseerGrens, lokaleDatum } from "../../lib/datum";
import type {
  AnonimiseerPoort,
  AnonimiseerResultaat,
  AnonimiseerStatus,
  BezoeklogWeergave,
} from "./anonimiseren.types";

const NAAM_GEMASKEERD = "Anoniem";

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

/**
 * Haalt alle bezoeklogs op voor het overzicht op het beheerscherm.
 *
 * Een log toont "Anoniem" zodra het lid al geen `user_id` meer heeft, of
 * zodra het bezoekmoment vóór de anonimiseringsgrens ligt — ook als de
 * anonimisering zelf nog niet is uitgevoerd. Zo klopt het overzicht al vóór
 * er op "Anonimiseren" is geklikt.
 */
export async function haalBezoeklogs(
  poort: AnonimiseerPoort,
  nu: Date = new Date(),
): Promise<BezoeklogWeergave[]> {
  const grens = anonimiseerGrens(nu);
  const logs = await poort.haalBezoeklogs();
  return logs.map((log) => ({
    visitId: log.visitId,
    naam:
      log.naam === null || log.bezoekmoment < grens
        ? NAAM_GEMASKEERD
        : log.naam,
    abonnementsnaam: log.abonnementsnaam,
    bezoekmoment: log.bezoekmoment.toISOString(),
    toegangVerleend: log.toegangVerleend,
  }));
}
