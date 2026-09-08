import { compare } from "bcryptjs";
import { laatsteMaandag } from "../../lib/datum";

/**
 * Uitkomst van een incheckpoging. Verwachte uitkomsten (ook weigeringen) zijn
 * een expliciete union, geen exceptions.
 */
export type IncheckResultaat =
  | {
      status: "granted";
      naam: string;
      bezoekenDezeWeek: number;
      limiet: number | null;
    }
  | {
      status: "denied";
      reden:
        "ongeldige_inloggegevens" | "abonnement_verlopen" | "limiet_bereikt";
      melding: string;
    };

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

/**
 * De databasetoegang die `verwerkIncheck` nodig heeft, als poort. Zo kennen de
 * businessregels de database niet en zijn ze los te testen.
 */
export interface IncheckPoort {
  zoekLidMetAbonnement(lidId: number): Promise<LidMetAbonnement | null>;
  telGeslaagdeBezoekenSinds(lidId: number, vanaf: Date): Promise<number>;
  logPoging(invoer: LogInvoer): Promise<void>;
}

// Onbekend lidnummer en foute pincode geven exact dezelfde melding, zodat niet
// af te leiden is welke lidnummers bestaan (US-08).
const MELDING_ONGELDIG = "Onjuist lidnummer of onjuiste pincode.";
const MELDING_VERLOPEN =
  "Je abonnement is verlopen. Neem contact op met de balie.";
const MELDING_LIMIET =
  "Je hebt deze week het maximale aantal bezoeken van je abonnement bereikt.";

// Alleen cijfers. De pincode blijft een string (leidende nullen tellen mee);
// exacte lengte-eisen horen in de frontend, de server checkt alleen het formaat.
const LIDNUMMER_PATROON = /^\d{1,10}$/;
const PINCODE_PATROON = /^\d{4,10}$/;
const INT4_MAX = 2147483647;

function ongeldigeInloggegevens(): IncheckResultaat {
  return {
    status: "denied",
    reden: "ongeldige_inloggegevens",
    melding: MELDING_ONGELDIG,
  };
}

/**
 * Volledige toegangscontrole voor één incheckpoging.
 *
 * `nu` is injecteerbaar zodat de weekgrens in tests vastligt.
 */
export async function verwerkIncheck(
  lidnummer: string,
  pincode: string,
  poort: IncheckPoort,
  nu: Date = new Date(),
): Promise<IncheckResultaat> {
  // 1. Normaliseren en valideren vóór de database wordt geraakt (US-08).
  const lidnummerSchoon = lidnummer.trim();
  const pincodeSchoon = pincode.trim();

  if (
    !LIDNUMMER_PATROON.test(lidnummerSchoon) ||
    !PINCODE_PATROON.test(pincodeSchoon)
  ) {
    console.warn("[incheck] geweigerd: ongeldig invoerformaat");
    return ongeldigeInloggegevens();
  }

  const lidId = Number(lidnummerSchoon);
  if (lidId < 1 || lidId > INT4_MAX) {
    console.warn("[incheck] geweigerd: lidnummer buiten bereik");
    return ongeldigeInloggegevens();
  }

  // 2. Lid opzoeken. Onbekend lid -> zelfde uitkomst als foute pincode.
  const lid = await poort.zoekLidMetAbonnement(lidId);
  if (lid === null) {
    console.warn(`[incheck] geweigerd: onbekend lidnummer ${lidId}`);
    return ongeldigeInloggegevens();
  }

  // 3. Pincode verifiëren tegen de hash; nooit plaintext vergelijken of loggen.
  const pincodeKlopt = await compare(pincodeSchoon, lid.pinHash);
  if (!pincodeKlopt) {
    console.warn(`[incheck] geweigerd: onjuiste pincode voor lid ${lidId}`);
    return ongeldigeInloggegevens();
  }

  // 4. Abonnement geldig? Een opgezegd abonnement geeft toegang zolang de
  //    einddatum niet is gepasseerd (US-02); die datum is de laatste geldige dag.
  if (lid.subscriptionEnd !== null) {
    const vandaag = new Date(nu);
    vandaag.setHours(0, 0, 0, 0);
    // "T00:00:00" dwingt lokale interpretatie af, gelijk aan `vandaag`.
    const einde = new Date(`${lid.subscriptionEnd}T00:00:00`);
    if (einde < vandaag) {
      await poort.logPoging({
        lidId: lid.id,
        abonnementId: lid.abonnementId,
        toegangVerleend: false,
        wanneer: nu,
      });
      return {
        status: "denied",
        reden: "abonnement_verlopen",
        melding: MELDING_VERLOPEN,
      };
    }
  }

  // 5. Weektelling via een query op visit_logs vanaf de laatste maandag (AC1).
  //    Onbeperkt (limiet null) wordt geteld voor het overzicht, maar nergens
  //    gehandhaafd (AC2).
  const bezoekenVoorNu = await poort.telGeslaagdeBezoekenSinds(
    lid.id,
    laatsteMaandag(nu),
  );

  if (lid.limiet !== null && bezoekenVoorNu >= lid.limiet) {
    await poort.logPoging({
      lidId: lid.id,
      abonnementId: lid.abonnementId,
      toegangVerleend: false,
      wanneer: nu,
    });
    return {
      status: "denied",
      reden: "limiet_bereikt",
      melding: MELDING_LIMIET,
    };
  }

  // 6. Toegang verleend: log de geslaagde poging en tel deze mee (AC4).
  await poort.logPoging({
    lidId: lid.id,
    abonnementId: lid.abonnementId,
    toegangVerleend: true,
    wanneer: nu,
  });

  return {
    status: "granted",
    naam: `${lid.firstname} ${lid.lastname}`,
    bezoekenDezeWeek: bezoekenVoorNu + 1,
    limiet: lid.limiet,
  };
}
