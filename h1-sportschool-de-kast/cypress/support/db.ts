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
