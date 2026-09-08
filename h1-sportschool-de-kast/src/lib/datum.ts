/**
 * Datumhelpers voor de weektelling van bezoeken.
 *
 * De weekgrens is bewust lokale tijd, niet UTC: "deze week" volgt de kalender
 * aan de balie. Er is geen tellerkolom en geen resetlogica; de grens wordt bij
 * elke incheck opnieuw berekend.
 */

/** Maandag 00:00 (lokale tijd) van de week waarin `moment` valt. */
export function laatsteMaandag(moment: Date = new Date()): Date {
  const maandag = new Date(moment);
  // getDay(): zondag = 0. Omgerekend naar maandag = 0 tellen we het juiste
  // aantal dagen terug naar het begin van de week.
  const dagenSindsMaandag = (maandag.getDay() + 6) % 7;
  maandag.setDate(maandag.getDate() - dagenSindsMaandag);
  maandag.setHours(0, 0, 0, 0);
  return maandag;
}
