import { compare } from "bcryptjs";
import { laatsteMaandag, lokaleDatum } from "../../lib/datum";
import type {
  IncheckGeweigerd,
  IncheckPoort,
  IncheckResultaat,
  WeigerReden,
} from "./toegang.types";

// Exact 4 cijfers, gelijk aan de client-validatie in app/check-in/page.tsx.
const PINCODE_PATROON = /^\d{4}$/;

// Onbekend lidnummer en foute pincode geven exact dezelfde melding, zodat niet
// af te leiden is welke lidnummers bestaan (US-08).
const MELDINGEN: Record<WeigerReden, string> = {
  ongeldige_inloggegevens: "Onjuist lidnummer of onjuiste pincode.",
  abonnement_verlopen:
    "Je abonnement is verlopen. Neem contact op met de balie.",
  limiet_bereikt:
    "Je hebt deze week het maximale aantal bezoeken van je abonnement bereikt.",
};

/**
 * Volledige toegangscontrole voor één incheckpoging.
 * `nu` is injecteerbaar zodat de weekgrens in tests vastligt.
 */
export async function verwerkIncheck(
  lidnummer: string,
  pincode: string,
  poort: IncheckPoort,
  nu: Date = new Date(),
): Promise<IncheckResultaat> {
  // 1. Invoer normaliseren en valideren vóór we de database raken (US-08).
  const lidId = leesLidnummer(lidnummer);
  const pin = pincode.trim();
  if (lidId === null || !PINCODE_PATROON.test(pin)) {
    console.warn("[incheck] geweigerd: ongeldige invoer");
    return weiger("ongeldige_inloggegevens");
  }

  // 2. Lid opzoeken. Onbekend lid -> zelfde uitkomst als foute pincode.
  const lid = await poort.zoekLidMetAbonnement(lidId);
  if (lid === null) {
    console.warn(`[incheck] geweigerd: onbekend lidnummer ${lidId}`);
    return weiger("ongeldige_inloggegevens");
  }

  // Vanaf hier is het lid bekend, dus elke uitkomst wordt gelogd (AC4).
  const logPoging = (toegangVerleend: boolean) =>
    poort.logPoging({
      lidId: lid.id,
      abonnementId: lid.abonnementId,
      toegangVerleend,
      wanneer: nu,
    });

  // 3. Pincode tegen de hash verifiëren; nooit plaintext vergelijken of loggen.
  if (!(await compare(pin, lid.pinHash))) {
    console.warn(`[incheck] geweigerd: onjuiste pincode voor lid ${lidId}`);
    await logPoging(false);
    return weiger("ongeldige_inloggegevens");
  }

  // 4. Opgezegd abonnement mag, zolang de einddatum niet is gepasseerd (US-02).
  if (abonnementVerlopen(lid.subscriptionEnd, nu)) {
    await logPoging(false);
    return weiger("abonnement_verlopen");
  }

  // 5. Weeklimiet handhaven. Onbeperkt (limiet null) telt wel mee, begrenst niet
  //    (AC1/AC2).
  const bezoekenVoorNu = await poort.telGeslaagdeBezoekenSinds(
    lid.id,
    laatsteMaandag(nu),
  );
  if (lid.limiet !== null && bezoekenVoorNu >= lid.limiet) {
    await logPoging(false);
    return weiger("limiet_bereikt");
  }

  // 6. Toegang verleend: log de poging en tel deze mee (AC4).
  await logPoging(true);
  return {
    status: "granted",
    naam: `${lid.firstname} ${lid.lastname}`,
    bezoekenDezeWeek: bezoekenVoorNu + 1,
    limiet: lid.limiet,
  };
}

/** Lidnummer -> geldig `Users.id`, of null bij ongeldige invoer. */
function leesLidnummer(ruw: string): number | null {
  const schoon = ruw.trim();
  if (!/^\d{1,9}$/.test(schoon)) return null; // 9 cijfers past altijd in int4
  const id = Number(schoon);
  return id > 0 ? id : null; // identity-kolom begint bij 1
}

/** True als de einddatum vóór vandaag ligt; de einddatum zelf is nog geldig. */
function abonnementVerlopen(einddatum: string | null, nu: Date): boolean {
  // ISO-datums ("YYYY-MM-DD") vergelijken alfabetisch = chronologisch.
  return einddatum !== null && einddatum < lokaleDatum(nu);
}

function weiger(reden: WeigerReden): IncheckGeweigerd {
  return { status: "denied", reden, melding: MELDINGEN[reden] };
}
