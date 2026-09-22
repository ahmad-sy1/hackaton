/**
 * Types voor de incheck-toegangscontrole.
 *
 * De poort (`IncheckPoort`) scheidt de businessregels in `toegang.ts` van de
 * database: `verwerkIncheck` kent alleen deze interface, niet Drizzle.
 */

export type WeigerReden =
  "ongeldige_inloggegevens" | "abonnement_verlopen" | "limiet_bereikt";

export interface IncheckToegestaan {
  status: "granted";
  naam: string;
  bezoekenDezeWeek: number;
  limiet: number | null;
}

export interface IncheckGeweigerd {
  status: "denied";
  reden: WeigerReden;
  melding: string;
}

/**
 * Uitkomst van een incheckpoging. Verwachte uitkomsten (ook weigeringen) zijn
 * een expliciete union, geen exceptions.
 */
export type IncheckResultaat = IncheckToegestaan | IncheckGeweigerd;

/** Eén lid met het bijbehorende abonnementstype, zoals de poort het teruggeeft. */
export interface LidMetAbonnement {
  id: number;
  firstname: string;
  lastname: string;
  pinHash: string;
  /** `date`-kolom: "YYYY-MM-DD", of null = niet opgezegd. */
  subscriptionEnd: string | null;
  abonnementId: number;
  /** Maximaal aantal bezoeken per week; null = onbeperkt. */
  limiet: number | null;
}

export interface LogInvoer {
  lidId: number;
  abonnementId: number;
  toegangVerleend: boolean;
  wanneer: Date;
}

export interface IncheckPoort {
  zoekLidMetAbonnement(lidId: number): Promise<LidMetAbonnement | null>;
  telGeslaagdeBezoekenSinds(lidId: number, vanaf: Date): Promise<number>;
  logPoging(invoer: LogInvoer): Promise<void>;
}
