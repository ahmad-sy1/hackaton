import { expect, test, type Page } from "@playwright/test";
import {
  getRide,
  insertCompletedRide,
  replaceAmsterdamTariff,
  resetDatabase,
} from "./support/test-database";

// Test names are the scenarios from chapter 4 of docs/testen/testplan.md.

const WARNING =
  "De eindprijs is meer dan 20% hoger dan de schatting. Vraag de chauffeur om uitleg, bijvoorbeeld over de gereden route.";

test.beforeEach(async () => {
  await resetDatabase();
});

/** Accepts the estimate Centraal Station → Schiphol and returns the ride id. */
async function acceptRide(page: Page): Promise<string> {
  await page.goto("/estimate?from=1&to=2");
  await page.getByRole("button", { name: "Schatting accepteren" }).click();
  await page.waitForURL(/\/ride\/[0-9a-f-]{36}$/);
  await expect(
    page.getByRole("heading", { name: "Rit is bezig" }),
  ).toBeVisible();
  return new URL(page.url()).pathname.split("/").pop()!;
}

function completeButton(page: Page, scenario: "normaal" | "omweg") {
  return page.getByRole("button", { name: `Rit afronden: ${scenario}` });
}

/** The form fields of a server action request, without the values. */
function formFieldNames(body: string): string[] {
  return [...body.matchAll(/name="([^"]+)"/g)].map((match) => match[1]);
}

function formFieldValue(body: string, name: string): string {
  const match = body.match(
    new RegExp(`name="${name}"\\r\\n\\r\\n([\\s\\S]*?)\\r\\n--`),
  );
  return match?.[1] ?? "";
}

test("TC-15 | Gegeven een geaccepteerde rit, wanneer de rit wordt afgerond met scenario normaal, dan berekent het systeem de eindprijs met tarief 1 en de werkelijke afstand en duur", async ({
  page,
}) => {
  const rideId = await acceptRide(page);

  const requestPromise = page.waitForRequest(
    (request) =>
      request.method() === "POST" && "next-action" in request.headers(),
  );
  await completeButton(page, "normaal").click();
  const body = (await requestPromise).postData() ?? "";

  await test.step("het verzoek bevat alleen de rit-id en het scenario", async () => {
    expect(formFieldNames(body).sort()).toEqual(["0", "_1_scenario"]);
    expect(formFieldValue(body, "_1_scenario")).toBe("normal");
    expect(JSON.parse(formFieldValue(body, "0"))[0]).toBe(rideId);
    for (const value of ["5634", "56,34", "17850", "1575"]) {
      expect(body).not.toContain(value);
    }
  });

  await expect(
    page.getByRole("heading", { name: "Rit afgerond" }),
  ).toBeVisible();
  const ride = await getRide(rideId);
  // 300 + 17,85 × 240 + 26,25 × 40 = 5634 cent
  expect(ride).toMatchObject({
    status: "afgerond",
    actualDistanceM: 17850,
    actualDurationS: 1575,
    finalPriceCents: 5634,
  });
  expect(ride.completedAt).not.toBeNull();
});

test("TC-16 | Gegeven een geaccepteerde rit en een daarna vervangen tarief, wanneer de rit wordt afgerond, dan wordt nog steeds het tarief van de schatting gebruikt", async ({
  page,
}) => {
  const rideId = await acceptRide(page);
  await replaceAmsterdamTariff();

  await completeButton(page, "normaal").click();

  await expect(page.getByText("€ 56,34", { exact: true })).toBeVisible();
  const ride = await getRide(rideId);
  expect(ride).toMatchObject({ tariffId: 1, finalPriceCents: 5634 });
});

test("TC-17 | Gegeven een geaccepteerde rit, wanneer het afrondformulier wordt verstuurd met een niet-bestaand scenario, dan wordt de rit niet afgerond", async ({
  page,
}) => {
  const rideId = await acceptRide(page);
  await page
    .locator('button[value="normal"]')
    .evaluate((button: HTMLButtonElement) => {
      button.value = "free";
    });

  const responsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      "next-action" in response.request().headers(),
  );
  await completeButton(page, "normaal").click();
  const response = await responsePromise;

  expect(response.request().postData()).toContain("free");
  await expect(
    page.getByRole("heading", { name: "Rit is bezig" }),
  ).toBeVisible();
  const ride = await getRide(rideId);
  expect(ride).toMatchObject({
    status: "geaccepteerd",
    actualDistanceM: null,
    actualDurationS: null,
    finalPriceCents: null,
  });
});

test("TC-18 | Gegeven een geaccepteerde rit in twee tabbladen, wanneer de rit in het ene tabblad met omweg en daarna in het andere met normaal wordt afgerond, dan telt alleen de eerste", async ({
  page,
  context,
}) => {
  const rideId = await acceptRide(page);
  const tabB = await context.newPage();
  await tabB.goto(`/ride/${rideId}`);
  await expect(
    tabB.getByRole("heading", { name: "Rit is bezig" }),
  ).toBeVisible();

  await completeButton(page, "omweg").click();
  await expect(page.getByText("€ 67,00", { exact: true })).toBeVisible();
  const { completedAt } = await getRide(rideId);

  await completeButton(tabB, "normaal").click();
  await expect(
    tabB.getByRole("heading", { name: "Rit afgerond" }),
  ).toBeVisible();
  await expect(tabB.getByText("€ 67,00", { exact: true })).toBeVisible();

  const ride = await getRide(rideId);
  expect(ride).toMatchObject({
    actualDistanceM: 21250,
    actualDurationS: 1950,
    finalPriceCents: 6700,
  });
  expect(ride.completedAt).toEqual(completedAt);
});

test("TC-21 | Gegeven een afgeronde rit zonder verschil, wanneer de reiziger het eindprijsscherm bekijkt, dan is het verschil nul met een plusteken", async ({
  page,
}) => {
  const rideId = await insertCompletedRide(5380);

  await page.goto(`/ride/${rideId}`);

  await expect(page.getByText("+ € 0,00 (+0%)", { exact: true })).toBeVisible();
  await expect(page.getByText(WARNING)).toHaveCount(0);
});

test("TC-22 | Gegeven een afgeronde rit die 2 cent goedkoper is, wanneer de reiziger het eindprijsscherm bekijkt, dan tonen bedrag en percentage hetzelfde minteken", async ({
  page,
}) => {
  const rideId = await insertCompletedRide(5378);

  await page.goto(`/ride/${rideId}`);

  // Both signs are U+2212, not the hyphen-minus from the keyboard.
  await expect(page.getByText("− € 0,02 (−0%)", { exact: true })).toBeVisible();
  await expect(page.getByText(WARNING)).toHaveCount(0);
});

test("TC-25 | Gegeven een afgeronde rit die precies 20% duurder is, wanneer de reiziger het eindprijsscherm bekijkt, dan staat er geen waarschuwing", async ({
  page,
}) => {
  // 6456 × 100 = 645600, 5380 × 120 = 645600: not more than 20%.
  const rideId = await insertCompletedRide(6456);

  await page.goto(`/ride/${rideId}`);

  await expect(
    page.getByText("+ € 10,76 (+20%)", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText(WARNING)).toHaveCount(0);
});

test("TC-26 | Gegeven een afgeronde rit die 1 cent boven de 20% zit, wanneer de reiziger het eindprijsscherm bekijkt, dan staat de waarschuwing er wel", async ({
  page,
}) => {
  // 6457 × 100 = 645700 > 645600
  const rideId = await insertCompletedRide(6457);

  await page.goto(`/ride/${rideId}`);

  await expect(
    page.getByText("+ € 10,77 (+20%)", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText(WARNING)).toBeVisible();
});
