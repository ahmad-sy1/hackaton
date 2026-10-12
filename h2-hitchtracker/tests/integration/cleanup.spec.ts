import { expect, test } from "@playwright/test";
import {
  countRides,
  daysAgo,
  insertAcceptedRide,
  resetDatabase,
  runCleanupScript,
} from "./support/test-database";

// Test names are the scenarios from chapter 4 of docs/testen/testplan.md.

test.beforeEach(async () => {
  await resetDatabase();
});

test("TC-27 | Gegeven een rit die 31 dagen geleden is geaccepteerd, wanneer het opschoonscript draait, dan wordt de rit verwijderd", async () => {
  await insertAcceptedRide(daysAgo(31));

  const output = runCleanupScript();

  expect(output).toContain("1 rit(ten) ouder dan 30 dagen verwijderd.");
  expect(await countRides()).toBe(0);
});

test("TC-28 | Gegeven een rit die 29 dagen geleden is geaccepteerd, wanneer het opschoonscript draait, dan blijft de rit staan", async () => {
  await insertAcceptedRide(daysAgo(29));

  const output = runCleanupScript();

  expect(output).toContain("0 rit(ten) ouder dan 30 dagen verwijderd.");
  expect(await countRides()).toBe(1);
});
