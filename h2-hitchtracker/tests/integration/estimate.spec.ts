import { expect, test } from "@playwright/test";
import { countRides, getRide, resetDatabase } from "./support/test-database";

// Test names are the scenarios from chapter 4 of docs/testen/testplan.md.

test.beforeEach(async () => {
  await resetDatabase();
});

test("TC-03 | Gegeven een schone database, wanneer iemand /estimate opent met een ontbrekende, gelijke, tekstuele, negatieve of onbekende id, dan wordt er geen schatting gemaakt", async ({
  page,
}) => {
  const urls = [
    "/estimate",
    "/estimate?from=1",
    "/estimate?from=1&to=1",
    "/estimate?from=abc&to=2",
    "/estimate?from=-1&to=2",
    "/estimate?from=1&to=999",
  ];

  for (const url of urls) {
    await test.step(url, async () => {
      await page.goto(url);
      await expect(
        page.getByRole("heading", { name: "Geen schatting mogelijk" }),
      ).toBeVisible();
      await expect(
        page.getByText("Kies een vertrekpunt en een bestemming."),
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: "Terug naar start" }),
      ).toBeVisible();
      await expect(page.getByText("€")).toHaveCount(0);
    });
  }

  expect(await countRides()).toBe(0);
});

test("TC-05 | Gegeven een schone database, wanneer een schatting wordt opgevraagd voor Amsterdam Zuid → Schiphol, dan klopt ook een afstand met decimaal", async ({
  page,
}) => {
  await page.goto("/estimate?from=5&to=2");

  await expect(page.getByText("± € 34,60", { exact: true })).toBeVisible();
  await expect(
    page.getByText("ca. 16 minuten · 10,5 km", { exact: true }),
  ).toBeVisible();
  expect(await countRides()).toBe(0);
});

test("TC-07 | Gegeven een schone database, wanneer een schatting wordt opgevraagd voor Amsterdam Zuid → Vondelpark, dan klopt de berekening ook voor een andere route", async ({
  page,
}) => {
  await page.goto("/estimate?from=5&to=4");

  // 300 + 4 × 240 + 11 × 40 = 1700 cent
  await expect(page.getByText("± € 17,00", { exact: true })).toBeVisible();
  await expect(
    page.getByText("ca. 11 minuten · 4 km", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Gebruikt tarief (Amsterdam)")).toBeVisible();
});

test("TC-08 | Gegeven een schatting, wanneer de reiziger die accepteert, dan wordt er precies één rit met de schatting vastgelegd", async ({
  page,
}) => {
  await page.goto("/estimate?from=1&to=2");
  await expect(page.getByText("± € 53,80", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Schatting accepteren" }).click();

  await page.waitForURL(/\/ride\/[0-9a-f-]{36}$/);
  await expect(
    page.getByRole("heading", { name: "Rit is bezig" }),
  ).toBeVisible();
  await expect(page.getByText("Vastgelegde schatting")).toBeVisible();
  await expect(page.getByText("€ 53,80", { exact: true })).toBeVisible();

  const rideId = new URL(page.url()).pathname.split("/").pop()!;
  expect(await countRides()).toBe(1);
  const ride = await getRide(rideId);
  expect(ride).toMatchObject({
    status: "geaccepteerd",
    tariffId: 1,
    estimatedDistanceM: 17000,
    estimatedDurationS: 1500,
    estimatedPriceCents: 5380,
    actualDistanceM: null,
    actualDurationS: null,
    finalPriceCents: null,
  });
});

test("TC-09 | Gegeven een schatting, wanneer de reiziger op Terug klikt zonder te accepteren, dan wordt er niets opgeslagen", async ({
  page,
}) => {
  await page.goto("/estimate?from=1&to=2");
  await expect(page.getByText("± € 53,80", { exact: true })).toBeVisible();

  await page.getByRole("link", { name: "Terug", exact: true }).click();

  await page.waitForURL("/");
  expect(await countRides()).toBe(0);
});

test("TC-10 | Gegeven een schone database, wanneer iemand een ritlink opent met een ongeldige of onbekende uuid, dan bestaat die rit niet", async ({
  page,
}) => {
  // Step 3 of TC-10 (no database error in the server log) is checked by hand.
  for (const url of [
    "/ride/abc",
    "/ride/00000000-0000-0000-0000-000000000000",
  ]) {
    await test.step(url, async () => {
      const response = await page.goto(url);
      expect(response?.status()).toBe(404);
      await expect(
        page.getByText("This page could not be found."),
      ).toBeVisible();
    });
  }
});

test("TC-12 | Gegeven een schone database, wanneer iemand /estimate?from=6&to=7 direct opent, dan wordt er geen schatting gemaakt", async ({
  page,
}) => {
  await page.goto("/estimate?from=6&to=7");

  await expect(
    page.getByRole("heading", { name: "Geen schatting mogelijk" }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "In deze stad is nog geen tarief bekend. Een schatting is niet mogelijk.",
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Schatting accepteren" }),
  ).toHaveCount(0);
  expect(await countRides()).toBe(0);
});
