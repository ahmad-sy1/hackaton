import { compare } from "bcryptjs";
import { eindeHuidigeMaandcyclus } from "../../lib/datum";
import type {
  AbonnementPoort,
  LidAbonnement,
  OpzegResultaat,
  OverzichtResultaat,
} from "./abonnement.types";

// Exact 4 cijfers, gelijk aan de client-validatie in app/abonnement/page.tsx.
const PINCODE_PATROON = /^\d{4}$/;

// Onbekend lidnummer en foute pincode geven exact dezelfde melding, zodat niet
// af te leiden is welke lidnummers bestaan (US-08).
const ONGELDIGE_INLOG = "Onjuist lidnummer of onjuiste pincode.";

/**
 * Haalt het abonnementsoverzicht op na verificatie van lidnummer + pincode.
 */
export async function haalOverzicht(
  lidnummer: string,
  pincode: string,
  poort: AbonnementPoort,
): Promise<OverzichtResultaat> {
  const lid = await verifieerLid(lidnummer, pincode, poort);
  if (lid === null) {
    return {
      status: "geweigerd",
      reden: "ongeldige_inloggegevens",
      melding: ONGELDIGE_INLOG,
    };
  }

  return {
    status: "gevonden",
    overzicht: {
      voornaam: lid.firstname,
      achternaam: lid.lastname,
      abonnementsnaam: lid.abonnementsnaam,
      startdatum: lid.startdatum,
      einddatum: lid.einddatum,
    },
  };
}

/**
 * Zegt het abonnement op: zet `subscription_end` op het einde van de lopende
 * maandcyclus (US-02 AC "toegang loopt door tot einde huidige maandcyclus").
 *
 * De inloggegevens worden hier opnieuw geverifieerd — de bevestigknop in de UI
 * is niet de beveiliging. Een al opgezegd abonnement wordt niet nog eens
 * verzet. `nu` is injecteerbaar zodat een test de einddatum vastlegt.
 */
export async function zegOp(
  lidnummer: string,
  pincode: string,
  poort: AbonnementPoort,
  nu: Date = new Date(),
): Promise<OpzegResultaat> {
  const lid = await verifieerLid(lidnummer, pincode, poort);
  if (lid === null) {
    return {
      status: "geweigerd",
      reden: "ongeldige_inloggegevens",
      melding: ONGELDIGE_INLOG,
    };
  }

  if (lid.einddatum !== null) {
    return {
      status: "geweigerd",
      reden: "al_opgezegd",
      melding: `Je abonnement is al opgezegd en loopt door tot ${lid.einddatum}.`,
    };
  }

  const einddatum = eindeHuidigeMaandcyclus(lid.startdatum, nu);
  await poort.zetEinddatum(lid.id, einddatum);
  return { status: "opgezegd", einddatum };
}

/**
 * Lidnummer + pincode -> het lid, of null bij ongeldige invoer, onbekend lid of
 * foute pincode. Alle drie leveren dezelfde uitkomst op (US-08).
 */
async function verifieerLid(
  lidnummer: string,
  pincode: string,
  poort: AbonnementPoort,
): Promise<LidAbonnement | null> {
  const lidId = leesLidnummer(lidnummer);
  const pin = pincode.trim();
  if (lidId === null || !PINCODE_PATROON.test(pin)) return null;

  const lid = await poort.zoekLidAbonnement(lidId);
  if (lid === null) return null;

  // Nooit plaintext vergelijken of loggen; alleen tegen de hash.
  if (!(await compare(pin, lid.pinHash))) return null;
  return lid;
}

/** Lidnummer -> geldig `Users.id`, of null bij ongeldige invoer. */
function leesLidnummer(ruw: string): number | null {
  const schoon = ruw.trim();
  if (!/^\d{1,9}$/.test(schoon)) return null; // 9 cijfers past altijd in int4
  const id = Number(schoon);
  return id > 0 ? id : null; // identity-kolom begint bij 1
}
