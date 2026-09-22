/**
 * Onafhankelijke herberekening van datumregels voor black-box assertions in
 * de specs. Bewust losstaand van `src/lib/datum.ts`: een test die de
 * productiecode zou hergebruiken, kan een bug daarin niet meer opmerken.
 */

/** `dag` in (`jaar`, `maandIndex`), geklemd naar de laatste dag van die maand. */
function klemNaarMaand(jaar: number, maandIndex: number, dag: number): Date {
  const laatsteDag = new Date(jaar, maandIndex + 1, 0).getDate();
  return new Date(jaar, maandIndex, Math.min(dag, laatsteDag));
}

/** Lokale datum als "YYYY-MM-DD". */
export function alsIsoDatum(d: Date): string {
  const jaar = d.getFullYear();
  const maand = String(d.getMonth() + 1).padStart(2, "0");
  const dag = String(d.getDate()).padStart(2, "0");
  return `${jaar}-${maand}-${dag}`;
}

/**
 * Verwachte `subscription_end` na opzeggen (US-02 AC): de dag vóór de
 * eerstvolgende keer dat `ankerDag` voorkomt ná vandaag, geklemd naar het
 * einde van korte maanden.
 */
export function verwachteEinddatumOpzeggen(ankerDag: number, nu: Date): string {
  const vandaag = new Date(nu.getFullYear(), nu.getMonth(), nu.getDate());
  let verleng = klemNaarMaand(
    vandaag.getFullYear(),
    vandaag.getMonth(),
    ankerDag,
  );
  if (verleng.getTime() <= vandaag.getTime()) {
    verleng = klemNaarMaand(
      vandaag.getFullYear(),
      vandaag.getMonth() + 1,
      ankerDag,
    );
  }
  const einde = new Date(verleng);
  einde.setDate(einde.getDate() - 1);
  return alsIsoDatum(einde);
}

/** "YYYY-MM-DD" -> dezelfde weergave als `formatteerDatum` in de app. */
export function formatteerDatumNl(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
