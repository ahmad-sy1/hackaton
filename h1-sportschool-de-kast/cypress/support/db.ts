/**
 * Dunne helpers rond de "query"-task, zodat specs geen inline generics en
 * ruwe SQL-details hoeven te herhalen.
 */

export function queryRows<T>(sql: string, params: unknown[] = []) {
  return cy.task<T[]>("query", { sql, params });
}

export interface LidRij {
  subscription_start: string;
  subscription_end: string | null;
}

export function haalLid(userId: number) {
  return queryRows<LidRij>(
    'SELECT subscription_start, subscription_end FROM "Users" WHERE id = $1',
    [userId],
  ).then(([lid]) => lid);
}

/** Dag-van-de-maand uit een "YYYY-MM-DD"-datum. */
export function ankerDagVan(datum: string): number {
  const [, , dag] = datum.split("-");
  return Number(dag);
}

export interface BezoekRij {
  visit_id: number;
  access_granted: boolean;
}

export function bezoekenVan(userId: number) {
  return queryRows<BezoekRij>(
    "SELECT visit_id, access_granted FROM visit_logs WHERE user_id = $1 ORDER BY visit_id",
    [userId],
  );
}

export function totaalAantalBezoeken() {
  return queryRows<{ aantal: number }>(
    "SELECT COUNT(*)::int AS aantal FROM visit_logs",
  ).then(([rij]) => rij.aantal);
}

export interface VisitLogRij {
  visit_id: number;
  user_id: number | null;
  subscription_type_id: number;
}

export function bezoeklogsVan(userId: number) {
  return queryRows<VisitLogRij>(
    "SELECT visit_id, user_id, subscription_type_id FROM visit_logs WHERE user_id = $1",
    [userId],
  );
}

export function laatsteBezoeklogVan(userId: number) {
  return queryRows<VisitLogRij>(
    "SELECT visit_id, user_id, subscription_type_id FROM visit_logs WHERE user_id = $1 ORDER BY visit_date DESC LIMIT 1",
    [userId],
  ).then(([log]) => log);
}

export function haalBezoeklog(visitId: number) {
  return queryRows<VisitLogRij>(
    "SELECT visit_id, user_id, subscription_type_id FROM visit_logs WHERE visit_id = $1",
    [visitId],
  ).then(([log]) => log);
}

/** Simuleert de anonimiseerknop rechtstreeks in de database, voor TC-15. */
export function anonimiseerLogsOuderDan14Dagen() {
  return queryRows(
    "UPDATE visit_logs SET user_id = NULL WHERE visit_date < now() - interval '14 days'",
  );
}
