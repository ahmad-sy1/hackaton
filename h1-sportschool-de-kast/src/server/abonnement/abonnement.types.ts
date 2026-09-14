/**
 * Types voor het abonnementsoverzicht en het opzeggen ervan (US-02).
 *
 * Net als bij inchecken scheidt de poort (`AbonnementPoort`) de businessregels
 * in `abonnement.ts` van de database: de regels kennen alleen deze interface,
 * niet Drizzle.
 */

/** De enige inlogfout die naar buiten gaat; bewust neutraal gehouden (US-08). */
export type InlogFout = "ongeldige_inloggegevens";

/** Wat het lid op het beheerscherm te zien krijgt. */
export interface AbonnementOverzicht {
  voornaam: string;
  achternaam: string;
  abonnementsnaam: string;
  /** "YYYY-MM-DD". */
  startdatum: string;
  /** "YYYY-MM-DD", of null = niet opgezegd. */
  einddatum: string | null;
}

export interface OverzichtGevonden {
  status: "gevonden";
  overzicht: AbonnementOverzicht;
}

export interface OverzichtGeweigerd {
  status: "geweigerd";
  reden: InlogFout;
  melding: string;
}

export type OverzichtResultaat = OverzichtGevonden | OverzichtGeweigerd;

export interface OpzegBevestigd {
  status: "opgezegd";
  /** Laatste dag dat de toegang nog geldt: "YYYY-MM-DD". */
  einddatum: string;
}

export interface OpzegGeweigerd {
  status: "geweigerd";
  reden: InlogFout | "al_opgezegd";
  melding: string;
}

export type OpzegResultaat = OpzegBevestigd | OpzegGeweigerd;

/** Eén lid met abonnementsgegevens zoals de poort het teruggeeft. */
export interface LidAbonnement {
  id: number;
  firstname: string;
  lastname: string;
  pinHash: string;
  abonnementsnaam: string;
  /** `date`-kolommen: "YYYY-MM-DD". */
  startdatum: string;
  einddatum: string | null;
}

export interface AbonnementPoort {
  zoekLidAbonnement(lidId: number): Promise<LidAbonnement | null>;
  zetEinddatum(lidId: number, einddatum: string): Promise<void>;
}
