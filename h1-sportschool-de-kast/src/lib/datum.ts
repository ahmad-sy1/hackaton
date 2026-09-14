/**
 * Datumhelpers voor de weektelling van bezoeken (US-01) en de opzegtermijn
 * (US-02).
 *
 * Grenzen zijn bewust lokale tijd, niet UTC: ze volgen de kalender aan de balie.
 * Er is geen tellerkolom en geen resetlogica; elke grens wordt bij aanroep
 * opnieuw berekend.
 *
 * `moment` is altijd expliciet, zodat de aanroeper (en straks een test) bepaalt
 * wat "nu" is.
 */

/** Maandag 00:00 (lokale tijd) van de week waarin `moment` valt. */
export function laatsteMaandag(moment: Date): Date {
  const maandag = new Date(moment);
  // getDay(): zondag = 0. Omgerekend naar maandag = 0 tellen we het juiste
  // aantal dagen terug naar het begin van de week.
  const dagenSindsMaandag = (maandag.getDay() + 6) % 7;
  maandag.setDate(maandag.getDate() - dagenSindsMaandag);
  maandag.setHours(0, 0, 0, 0);
  return maandag;
}

/** Datum van `moment` als "YYYY-MM-DD" in lokale tijd. */
export function lokaleDatum(moment: Date): string {
  const jaar = moment.getFullYear();
  const maand = String(moment.getMonth() + 1).padStart(2, "0");
  const dag = String(moment.getDate()).padStart(2, "0");
  return `${jaar}-${maand}-${dag}`;
}

/**
 * Einddatum van de lopende maandcyclus voor een abonnement dat op `start`
 * begon, gegeven "nu" als `moment`.
 *
 * De cyclus verlengt telkens op de dag-van-de-maand van de startdatum. Zeg je
 * op, dan loopt de toegang door tot en met de dag vóór de eerstvolgende
 * verlengdatum ná vandaag. Korte maanden klemmen de dag naar de laatste dag
 * van die maand (start op de 31e -> verlenging op 28/29 feb).
 *
 * Resultaat is "YYYY-MM-DD" in lokale tijd, gelijk aan `lokaleDatum`, zodat het
 * rechtstreeks in `subscription_end` past en met de incheck-controle vergelijkt.
 */
export function eindeHuidigeMaandcyclus(start: string, moment: Date): string {
  const ankerDag = Number(start.slice(8, 10));
  const vandaag = new Date(
    moment.getFullYear(),
    moment.getMonth(),
    moment.getDate(),
  );

  // Verlengdatum in de huidige maand; ligt die op of vóór vandaag, dan valt de
  // eerstvolgende verlenging in de maand erna.
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
  return lokaleDatum(einde);
}

/** `dag` in (`jaar`, `maand`), geklemd naar de laatste dag van die maand. */
function klemNaarMaand(jaar: number, maand: number, dag: number): Date {
  const laatsteDag = new Date(jaar, maand + 1, 0).getDate();
  return new Date(jaar, maand, Math.min(dag, laatsteDag));
}
