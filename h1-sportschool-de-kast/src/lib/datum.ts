/**
 * Datumhelpers voor de weektelling van bezoeken.
 *
 * De weekgrens is bewust lokale tijd, niet UTC: "deze week" volgt de kalender
 * aan de balie. Er is geen tellerkolom en geen resetlogica; de grens wordt bij
 * elke incheck opnieuw berekend.
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
