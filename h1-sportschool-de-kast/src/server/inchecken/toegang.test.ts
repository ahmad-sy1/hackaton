import assert from "node:assert/strict";
import { test } from "node:test";
import { hashSync } from "bcryptjs";
import {
  verwerkIncheck,
  type IncheckPoort,
  type LidMetAbonnement,
  type LogInvoer,
} from "./toegang";

const PINCODE = "1234";
const PIN_HASH = hashSync(PINCODE, 10);
// Woensdag, midden in de week: de weekgrens ligt vast op maandag ervoor.
const NU = new Date(2026, 8, 9, 10, 0);

function maakLid(
  overschrijf: Partial<LidMetAbonnement> = {},
): LidMetAbonnement {
  return {
    id: 1,
    firstname: "Test",
    lastname: "Lid",
    pinHash: PIN_HASH,
    subscriptionEnd: null,
    abonnementId: 1,
    limiet: 1,
    ...overschrijf,
  };
}

function maakPoort(opties: {
  lid: LidMetAbonnement | null;
  bezoeken?: number;
}): { poort: IncheckPoort; gelogd: LogInvoer[] } {
  const gelogd: LogInvoer[] = [];
  const poort: IncheckPoort = {
    async zoekLidMetAbonnement() {
      return opties.lid;
    },
    async telGeslaagdeBezoekenSinds() {
      return opties.bezoeken ?? 0;
    },
    async logPoging(invoer) {
      gelogd.push(invoer);
    },
  };
  return { poort, gelogd };
}

function alsDatum(d: Date): string {
  const maand = String(d.getMonth() + 1).padStart(2, "0");
  const dag = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${maand}-${dag}`;
}

test("onbeperkt abonnement: altijd toegang, geen limiethandhaving", async () => {
  const { poort, gelogd } = maakPoort({
    lid: maakLid({ limiet: null }),
    bezoeken: 42,
  });

  const uitkomst = await verwerkIncheck("1", PINCODE, poort, NU);

  assert.equal(uitkomst.status, "granted");
  if (uitkomst.status === "granted") {
    assert.equal(uitkomst.limiet, null);
    assert.equal(uitkomst.bezoekenDezeWeek, 43);
  }
  assert.deepEqual(
    gelogd.map((g) => g.toegangVerleend),
    [true],
  );
});

test("1x/week onder de limiet: toegang", async () => {
  const { poort, gelogd } = maakPoort({
    lid: maakLid({ limiet: 1 }),
    bezoeken: 0,
  });

  const uitkomst = await verwerkIncheck("1", PINCODE, poort, NU);

  assert.equal(uitkomst.status, "granted");
  if (uitkomst.status === "granted") {
    assert.equal(uitkomst.bezoekenDezeWeek, 1);
    assert.equal(uitkomst.limiet, 1);
  }
  assert.deepEqual(
    gelogd.map((g) => g.toegangVerleend),
    [true],
  );
});

test("1x/week op de limiet: geweigerd, weigering wordt gelogd", async () => {
  const { poort, gelogd } = maakPoort({
    lid: maakLid({ limiet: 1 }),
    bezoeken: 1,
  });

  const uitkomst = await verwerkIncheck("1", PINCODE, poort, NU);

  assert.equal(uitkomst.status, "denied");
  if (uitkomst.status === "denied") {
    assert.equal(uitkomst.reden, "limiet_bereikt");
    assert.ok(uitkomst.melding.length > 0);
  }
  assert.deepEqual(
    gelogd.map((g) => g.toegangVerleend),
    [false],
  );
});

test("verlopen abonnement: geweigerd, weigering wordt gelogd", async () => {
  const gisteren = new Date(NU);
  gisteren.setDate(gisteren.getDate() - 1);
  const { poort, gelogd } = maakPoort({
    lid: maakLid({ subscriptionEnd: alsDatum(gisteren) }),
  });

  const uitkomst = await verwerkIncheck("1", PINCODE, poort, NU);

  assert.equal(uitkomst.status, "denied");
  if (uitkomst.status === "denied") {
    assert.equal(uitkomst.reden, "abonnement_verlopen");
  }
  assert.deepEqual(
    gelogd.map((g) => g.toegangVerleend),
    [false],
  );
});

test("foute pincode: geweigerd en niet in visit_logs", async (t) => {
  t.mock.method(console, "warn", () => {});
  const { poort, gelogd } = maakPoort({ lid: maakLid() });

  const uitkomst = await verwerkIncheck("1", "9999", poort, NU);

  assert.equal(uitkomst.status, "denied");
  if (uitkomst.status === "denied") {
    assert.equal(uitkomst.reden, "ongeldige_inloggegevens");
  }
  // Mislukte authenticatie hoort niet in de bezoeklog; het onderscheid staat
  // alleen in de interne log (US-08).
  assert.equal(gelogd.length, 0);
});

test("onbekend lidnummer: zelfde weigering en melding als foute pincode", async (t) => {
  t.mock.method(console, "warn", () => {});
  const onbekend = maakPoort({ lid: null });
  const foutePin = maakPoort({ lid: maakLid() });

  const uitOnbekend = await verwerkIncheck(
    "999999",
    PINCODE,
    onbekend.poort,
    NU,
  );
  const uitFoutePin = await verwerkIncheck("1", "0000", foutePin.poort, NU);

  assert.equal(uitOnbekend.status, "denied");
  assert.equal(uitFoutePin.status, "denied");
  if (uitOnbekend.status === "denied" && uitFoutePin.status === "denied") {
    assert.equal(uitOnbekend.reden, "ongeldige_inloggegevens");
    // Niet te onderscheiden voor de gebruiker (US-08).
    assert.equal(uitOnbekend.melding, uitFoutePin.melding);
  }
  assert.equal(onbekend.gelogd.length, 0);
  assert.equal(foutePin.gelogd.length, 0);
});
