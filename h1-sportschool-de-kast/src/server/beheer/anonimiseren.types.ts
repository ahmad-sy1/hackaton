/**
 * Types voor het anonimiseren van oude bezoeklogs (AVG-maatregel).
 *
 * Net als bij inchecken en abonnement scheidt de poort (`AnonimiseerPoort`)
 * de businessregels in `anonimiseren.ts` van de database: de regels kennen
 * alleen deze interface, niet Drizzle.
 */

export interface AnonimiseerPoort {
  /** Aantal rijen met `visit_date` vóór `grens` en nog een `user_id`. */
  telTeAnonimiseren(grens: Date): Promise<number>;
  /** Zet `user_id` op NULL voor die rijen; geeft het aantal aangepaste rijen terug. */
  anonimiseerTot(grens: Date): Promise<number>;
}

/** Wat het beheerscherm te zien krijgt vóór de anonimisering. */
export interface AnonimiseerStatus {
  aantal: number;
  /** "YYYY-MM-DD". */
  grens: string;
}

export interface AnonimiseerGedaan {
  status: "gedaan";
  aantal: number;
}

export interface AnonimiseerNietsTeDoen {
  status: "niets_te_doen";
}

export type AnonimiseerResultaat = AnonimiseerGedaan | AnonimiseerNietsTeDoen;
